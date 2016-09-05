require('dotenv').config();

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
    findPostsWithTag('blog_name', 'tag')
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
    replaces tags on an array of post ids
    replaceTags('blog_name', [post_id, another_post_id], 'tag1', 'tag2')
  */
  this.replaceTags = function replaceTags(blog, find, replace) {
    return new Promise(function(resolveAll, rejectAll) {

      // get all posts with tag
      // (could pass this back in from the front end, but it's a lot of data?)
      this.findPostsWithTag(blog, find)
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
          // matches whole tag only
          var tags = post.tags.map(function(tag) {
            if (tag === replace) {
              return replace;
            } else {
              return tag;
            }
          });

          this.client.editPost(blog, {
            id: id,
            tags: tags
          }).then(function(result) {
            resolve(result);
          }).catch(reject);
          
        }.bind(this));
      }

    }.bind(this));
  }

  return this;

}

module.exports = api;
