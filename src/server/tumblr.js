require('dotenv').config();

const _ = require('lodash');
const tumblr = require('tumblr.js');
const Sentry = require('@sentry/node');

const logger = require('./logger');

const POST_LIMIT = 20;

/**
 * @typedef {Object} Options
 * @property {boolean} [includeQueue=false]  include queued posts
 * @property {boolean} [includeDrafts=false] include drafted posts
 * @property {boolean} [caseSensitive=false] case sensitive tag matching
 * @property {boolean} [allowDelete=false]   allow deleting tags
 */
const DEFAULT_OPTIONS = {
  includeQueue: false,
  includeDrafts: false,
  caseSensitive: false,
  allowDelete: false,
};

const EMPTY_RESPONSE = {
  posts: [],
  queued: [],
  drafts: [],
};


class TumblrClient {
  /**
   * @param {string} token          oAuth access token
   * @param {string} secret         oAuth access secret
   * @param {string} [blog]         blog identifier
   * @param {Options} [options={}]  api options
   */
  constructor({ token, secret, blog, options = {} }) {
    this.client = this.wrapClient(new tumblr.Client({
      credentials: {
        consumer_key: process.env.TUMBLR_API_KEY,
        consumer_secret: process.env.TUMBLR_API_SECRET,
        token: token,
        token_secret: secret
      },
      returnPromises: true
    }));

    this.blog = blog;
    this.options = _.assign({}, DEFAULT_OPTIONS, options);
  }

  /**
   * wrap default logger with blog and options context
   */
  log(message, context = {}) {
    logger.info(`Tumblr.${message}`, Object.assign({
      blog: this.blog,
      options: this.options,
    }, context));
  }

  wrapClient(client) {
    const proxyHandler = {
      get: function (target, prop, receiver) {
        const promise = Reflect.get(...arguments);
        return function() {
          return promise(...arguments).catch((error) => {
            Sentry.captureException(error, {
              contexts: {
                tumblr: { response: JSON.stringify(error.body, null, 2) },
              },
            });
            throw error;
          });
        };
      },
    };
    return new Proxy(client, proxyHandler);
  }

  /**
   * @typedef {Object} Method
   * @property {string} key           key to use in results object
   * @property {string} clientMethod  tumblr.js client method name
   */

  /**
   * array of enabled API methods for fetching posts
   * @return {Method[]}  array of method definitions
   */
  get methods() {
    var methods = [
      {
        // https://www.tumblr.com/docs/en/api/v2#posts
        key: 'posts',
        clientMethod: 'blogPosts',
      }
    ];

    if (this.options.includeQueue) {
      methods.push({
        // https://www.tumblr.com/docs/en/api/v2#blog-queue
        key: 'queued',
        clientMethod: 'blogQueue',
      });
    }

    if (this.options.includeDrafts) {
      // https://www.tumblr.com/docs/en/api/v2#blog-drafts
      methods.push({
        key: 'drafts',
        clientMethod: 'blogDrafts',
      });
    }

    return methods;
  }

  /**
   * get authenticated user's info
   * https://www.tumblr.com/docs/en/api/v2#user-methods
   * @return {Promise<object>} API response
   */
  getUserInfo() {
    return this.client.userInfo();
  }

  /**
   * find all posts with a tag and method
   * @param  {string} tag             tag to find
   * @param  {Method} method          method to use
   * @param  {Number} [offset=0]      post offset
   * @param  {Array}  [results=[]]    previous results
   * @param  {Object} [params={}]     additional parameters
   * @param  {boolean} [retry=false]  whether this attempt is a retry
   * @return {Promise<Object[]>}      promise resolving an array of posts
   */
  findPosts({ tag, method, offset = 0, results = [], params = {}, retry = false }) {
    return this.client[method.clientMethod](this.blog, _.assign({
      tag: tag,
      offset: offset,
      limit: POST_LIMIT,
      filter: 'text',
    }, params)).then(response => {

      let posts;
      if (this.options.caseSensitive) {
        posts = _.filter(response.posts, post => _.includes(post.tags, tag));
      } else if (method.key !== 'posts') {
        // draft and queue methods don't actually support the tag param 🙄
        posts = _.filter(response.posts, post => (
          _.includes(post.tags.map(t => t.toLowerCase()), tag.toLowerCase())
        ));
      } else {
        posts = response.posts;
      }
      const appendedResults = results.concat(posts);

      if (response.total_posts) {
        if (response.total_posts > POST_LIMIT && offset < response.total_posts) {
          return this.findPosts({
            tag,
            method,
            offset: offset + POST_LIMIT,
            results: appendedResults // is passing this around recursively causing the memory leak?
          });
        } else {
          return appendedResults;
        }
      } else {
        if (response.posts.length > 0) {
          if (method.key === 'drafts') {
            // i hate this
            var before_id = response.posts[response.posts.length - 1].id;
            return this.findPosts({
              tag,
              method,
              offset: offset + POST_LIMIT,
              results: appendedResults,
              params: { before_id: before_id },
            });
          } else {
            return this.findPosts({
              tag,
              method,
              offset: offset + POST_LIMIT,
              results: appendedResults,
            });
          }
        } else {
          return appendedResults;
        }
      }
    }).catch(error => {
      // retry once
      if (!retry) {
        return this.findPosts({
          tag,
          method,
          offset,
          retry: true
        });
      } else {
        throw error;
      }
    });
  }

  /**
   * find and replace in array of tags
   * @param  {string[]} tags    post tags
   * @param  {string[]} find    tags to find
   * @param  {string[]} replace replacement tags
   * @return {string[]}         replaced tags
   */
  replaceTags({ tags, find, replace }) {
    /* eslint-disable prefer-const */
    let replaceableTags = _.concat([], replace);
    let result = _.concat([], tags);

    // loop through find to get matches
    _.each(find, findTag => {
      const matchIndex = _.findIndex(result, tag => {
        if (this.options.caseSensitive) {
          return tag === findTag;
        } else {
          return (
            (tag && tag.toLowerCase()) ===
            (findTag && findTag.toLowerCase())
          );
        }
      });

      if (matchIndex > -1) {
        const replaceTag = replaceableTags.shift();
        result.splice(matchIndex, 1, replaceTag);
      }
    });

    // if anything left over to replace, append to end
    result = _.concat(result, replaceableTags);

    result = _.compact(result);
    return result;
  }

  /**
   * [findPostsWithTags description]
   * @param  {[type]} input [description]
   * @return {[type]}       [description]
   */
  findPostsWithTags(find) {
    if (!_.isArray(find)) return Promise.reject(`expected 'find' to be an Array, but it was ${typeof find}`);

    const tags = _.chain(find)
      .sortBy()
      .value();
    const firstTag = tags[0];

    var promises = this.methods.map(method => {
      return this.findPosts({ tag: firstTag, method })
        .then(posts => {
          // if multiple tags, filter on results from first tag
          if (tags.length > 1) {
            return _.filter(posts, post => {
              const sortedPostTags = _.sortBy(post.tags);
              return _.isEqual(
                _.intersection(sortedPostTags, tags),
                tags
              );
            });
          } else {
            return posts;
          }
        })
        .then(posts => ({
          [method.key]: posts
        }));
    });

    return Promise.all(promises)
      .then(results => results.reduce((a, v) => _.assign(a, v), {}))
      .then(results => _.assign({}, EMPTY_RESPONSE, results))
      .then(results => {
        this.log('find', {
          find,
          results: {
            length: Object.keys(results).reduce((a, v) => a + results[v].length, 0)
          }
        });
        return results;
      });
  }

  /**
   * [findAndReplaceTags description]
   * @param  {[type]} find    [description]
   * @param  {[type]} replace [description]
   * @return {[type]}         [description]
   */
  findAndReplaceTags(find, replace) {
    if (!_.isArray(find)) return Promise.reject(`expected 'find' to be an Array, but it was ${typeof find}`);
    if (!_.isArray(replace)) return Promise.reject(`expected 'replace' to be an Array, but it was ${typeof find}`);

    return this.findPostsWithTags(find)
      .then(results => {
        const promises = _.chain(this.methods)
          .flatMap(method => results[method.key])
          .map(post => {
            const replacedTags = this.replaceTags({
              tags: post.tags,
              find,
              replace,
            });

            return this.client.editPost(this.blog, {
              id: post.id,
              tags: replacedTags.join(',')
            });
          })
          .value();

        return Promise.all(promises)
        .then(replaced => {
          this.log('replace', {
            find,
            replace,
            replaced: {
              length: replaced.length
            }
          });
          return results;
        });
      });
  }
}


module.exports = TumblrClient;
