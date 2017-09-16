require('dotenv').config();

var _ = require('lodash');
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

  */
  this.getMethods = function getMethod(config) {
    var methods = [
      {
        method: 'blogPosts',
        arrayKey: 'posts',
      }
    ];
    if (config.includeQueue) {
      methods.push({
        method: 'blogQueue',
        arrayKey: 'queued',
      });
    }
    if (config.includeDrafts) {
      methods.push({
        method: 'blogDrafts',
        arrayKey: 'drafts',
      });
    }
    return methods;
  }

  /*
    returns all posts that have a tag
    findPostsWithTag('blog', 'tag')
  */
  this.findPostsWithTag = function findPostsWithTag(blog, tag, config) {
    return new Promise(function(resolve, reject) {
      // loop through until we have all the posts

      var results = {
        posts: [],
        queued: [],
        drafts: [],
      };

      var methodTypes = this.getMethods(config);

      function findWithOffset(type, offset, retry, params) {
        return this.client[type.method](blog, Object.assign({
          tag: tag,
          limit: POST_LIMIT,
          offset: offset
        }, params)).then(function(response) {
          results[type.arrayKey] = results[type.arrayKey].concat(response.posts);
          if (response.total_posts) {
            if (response.total_posts > POST_LIMIT && offset < response.total_posts) {
              return findWithOffset(type, offset + POST_LIMIT);
            } else {
              return;
            }
          } else {
            if (response.posts.length > 0) {
              if (type.method === 'blogDrafts') {
                // seriously, what the fuck? seriously.
                var before_id = response.posts[response.posts.length - 1].id;
                return findWithOffset(type, offset + POST_LIMIT, undefined, { before_id: before_id })
              } else {
                return findWithOffset(type, offset + POST_LIMIT);
              }
            } else {
              return;
            }
          }
        }).catch(function(error) {
          // retry once
          if (!retry) {
            return findWithOffset(type, offset, true);
          } else {
            reject(error);
          }
        });
      }

      var promises = methodTypes.map(function(type) {
        return findWithOffset(type, 0);
      });

      Promise.all(promises).then(function() {
        resolve(results);
      })

    }.bind(this));
  }

  /*
    finds posts that have more than one tag (inclusive)
    findPostsWithTags('blog', ['tag1', 'tag2'])
  */
  this.findPostsWithTags = function findPostsWithTags(blog, tags, config) {
    return new Promise(function(resolve, reject) {

      var sorted = tags.sort();
      var methodTypes = this.getMethods(config);

      // find posts with the first tag, then check for the others
      this.findPostsWithTag(blog, tags[0], config)
      .then(function(results) {
        var filteredResults = Object.assign({}, results);

        // compare post tags to our tags
        function filterPosts(post) {
          if (_.isEqual(
            _.intersection(post.tags.slice().sort(), sorted),
            sorted
          )) {
            return true;
          } else {
            return false;
          }
        }

        methodTypes.forEach(function(type) {
          filteredResults[type.arrayKey] = filteredResults[type.arrayKey].filter(filterPosts);
        });

        resolve(filteredResults);
      });
    }.bind(this));
  }

  /*
    replaces tags on an array of post ids
    replaceTags('blog', 'tag1', 'tag2')
    find and replace can both be either a string or array
  */
  this.replaceTags = function replaceTags(blog, find, replace, config) {
    return new Promise(function(resolveAll, rejectAll) {

      var findFunction = this.findPostsWithTag;
      if (Array.isArray(find)) {
        findFunction = this.findPostsWithTags;
      }

      var methodTypes = this.getMethods(config);

      // get all posts with tag(s)
      findFunction(blog, find, config)
      .then(function(results) {
        return results;
      }).catch(function(error) {
        rejectAll(error);
      }).then(function(results) {
        // map posts to edit function
        var actions = methodTypes.map(function(type) {
          return results[type.arrayKey].map(function(post) {
            return makePromise(post);
          });
        }).reduce(function(a, b) {
          return a.concat(b);
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
          var tags = post.tags.slice();
          replace.forEach(function(tag, index) {
            var tagIndex = tags.indexOf(diff[index]);
            if (tagIndex > -1) {
              tags.splice(tagIndex, 1, tag);
            } else {
              tags.push(tag);
            }
          });
          tags = _.difference(tags, diff);
          var joined = tags.join(',');

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
