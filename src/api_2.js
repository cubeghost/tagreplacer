require('dotenv').config();

const _ = require('lodash');
const tumblr = require('tumblr.js');

const POST_LIMIT = 20;

/**
 * @typedef {Object} Options
 * @property {boolean} [includeQueue=false]  include queued posts
 * @property {boolean} [includeDrafts=false] include drafted posts
 * @property {boolean} [caseSensitive=true]  case sensitive tag matching
 */
const DEFAULT_OPTIONS = {
  includeQueue: false,
  includeDrafts: false,
  caseSensitive: true,
}


class TumblrAPI {
  /**
   * @param {string} token          oAuth access token
   * @param {string} secret         oAuth access secret
   * @param {string} [blog]         blog identifier
   * @param {Options} [options={}]  api options
   */
  constructor({ token, secret, blog, options = {} }) {
    this.client = new tumblr.Client({
      credentials: {
        consumer_key: process.env.TUMBLR_API_KEY,
        consumer_secret: process.env.TUMBLR_API_SECRET,
        token: token,
        token_secret: secret
      },
      returnPromises: true
    });

    this.blog = blog;
    this.options = _.assign({}, DEFAULT_OPTIONS, options);
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
    }, params)).then(response => {

      const appendedResults = results.concat(response.posts);

      if (response.total_posts) {
        if (response.total_posts > POST_LIMIT && offset < response.total_posts) {
          return this.findPosts({
            tag,
            method,
            offset: offset + POST_LIMIT,
            results: appendedResults
          });
        } else {
          return appendedResults;
        }
      } else {
        if (response.posts.length > 0) {
          if (method.clientMethod === 'blogDrafts') {
            // i hate this
            var before_id = response.posts[response.posts.length - 1].id;
            return this.findPosts({
              tag,
              method,
              offset: offset + POST_LIMIT,
              results: appendedResults,
              params: { before_id: before_id },
            })
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
   * [findPostsWithTag description]
   * @param  {[type]} tag [description]
   * @return {[type]}     [description]
   */
  findPostsWithTag(tag) {
    var promises = this.methods.map(method => {
      return this.findPosts({ tag, method })
        .then(result => ({
          [method.key]: result
        }));
    });

    return Promise.all(promises)
      .then(results => results.reduce((a, v) => _.assign(a, v), {}));
  }

  /**
   * [findPostsWithTags description]
   * @param  {[type]} input [description]
   * @return {[type]}       [description]
   */
  findPostsWithTags(input) {
    const tags = _.chain(input)
      .thru(value => (
        _.isArray(value) ? value : [value]
      ))
      .sortBy()
      .value();
    const firstTag = tags[0];

    if (tags.length > 1) {
      // get first tag then filter
      return this.findPostsWithTag(firstTag)
        .then(results => (
          _.mapValues(results, posts => (
            _.filter(posts, post => {
              const sortedPostTags = _.sortBy(post.tags);
              return _.isEqual(
                _.intersection(sortedPostTags, tags),
                tags
              );
            })
          ))
        ));
    } else {
      return this.findPostsWithTag(firstTag);
    }
  }
}


module.exports = TumblrAPI;
