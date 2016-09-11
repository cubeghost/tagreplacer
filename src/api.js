require('dotenv').config();

var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var tumblr = require('tumblr.js');


var POST_LIMIT = 20;


/* tag replacer api */
function api(token, secret) {

  this.client = new tumblr.Client({
    credentials: {
      consumer_key: process.env.TUMBLR_API_KEY,
      consumer_secret: process.env.TUMBLR_API_SECRET,
      token: token,
      token_secret: secret
    },
    returnPromises: true
  });

  /*
    returns authed user info
    getUserInfo()
  */
  this.getUserInfo = function getUserInfo() {
    return new Promise(function(resolve, reject) {
      this.client.userInfo().then(function(result) {
        resolve(result);
      }).catch(reject);
    }.bind(this));
  }

  /*
    returns all posts that have a tag
    findPostsWithTag('blog', 'tag')
  */
  this.findPostsWithTag = function findPostsWithTag(blog, tag) {
    return new Promise(function(resolve, reject) {
      // loop through until we have all the posts

      var posts = [];

      function findWithOffset(offset, retry) {
        this.client.blogPosts(blog, {
          tag: tag,
          limit: POST_LIMIT,
          offset: offset
        }).then(function(result) {
          posts = posts.concat(result.posts);
          if (result.total_posts > POST_LIMIT && offset < result.total_posts) {
            findWithOffset(offset + POST_LIMIT);
          } else {
            return finish(result.total_posts);
          }
        }).catch(function(error) {
          // retry once
          if (!retry) {
            findWithOffset(offset);
          } else {
            reject(error);
          }
        });
      }

      function finish(total) {
        resolve({
          posts: posts,
          total: total
        });
      }

      findWithOffset(0);

    }.bind(this));
  }

  /*
    finds posts that have more than one tag (inclusive)
    findPostsWithTags('blog', ['tag1', 'tag2'])
  */
  this.findPostsWithTags = function findPostsWithTags(blog, tags) {
    return new Promise(function(resolve, reject) {

      var sorted = tags.sort();

      // find posts with the first tag, then check for the others
      this.findPostsWithTag(blog, tags[0])
      .then(function(result) {
        // compare post tags to our tags
        var filtered = result.posts.filter(function(post) {
          if (_.isEqual(
            _.intersection(post.tags.sort(), sorted),
            sorted
          )) {
            return true
          } else {
            return false
          }
        });

        resolve({
          posts: filtered,
          total: filtered.length
        });
      });
    }.bind(this));
  }

  /*
    replaces tags on an array of post ids
    replaceTags('blog', 'tag1', 'tag2')
    find and replace can both be either a string or array
  */
  this.replaceTags = function replaceTags(blog, find, replace) {
    return new Promise(function(resolveAll, rejectAll) {

      var findFunction = this.findPostsWithTag;
      if (Array.isArray(find)) {
        findFunction = this.findPostsWithTags;
      }

      // get all posts with tag(s)
      findFunction(blog, find)
      .then(function(result) {
        return result.posts;
      }).catch(function(error) {
        rejectAll(error);
      }).then(function(posts) {
        // map posts to edit function
        var actions = posts.map(function(post) {
          return makePromise(post);
        });

        // edit all
        Promise.all(actions).then(function(results) {
          resolveAll(results);
        });
      });

      // return a promise to edit the post
      function makePromise(post) {
        return new Promise(function(resolve, reject) {

          var diff = Array.isArray(find) ? find : [find];
          var tags = _.chain(post.tags).difference(diff).concat(replace).value();
          var joined = tags.join(','); // >_> you can send arrays but not accept them???
          
          this.client.editPost(blog, {
            id: post.id,
            tags: joined
          }).then(function(result) {
            resolve(result);
          }).catch(reject);

        }.bind(this));
      };

    }.bind(this));
  }

  return this;

}

module.exports = api;
