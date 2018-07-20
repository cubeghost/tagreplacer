require('dotenv').config();

const createDebug = require('debug');
const _ = require('lodash');
const tumblr = require('tumblr.js');

const POST_LIMIT = 20;

/**
 * @typedef {Object} Options
 * @property {boolean} [includeQueue=false]  include queued posts
 * @property {boolean} [includeDrafts=false] include drafted posts
 * @property {boolean} [caseSensitive=false] case sensitive tag matching
 */
const DEFAULT_OPTIONS = {
  includeQueue: false,
  includeDrafts: false,
  caseSensitive: false,
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
    const debug = createDebug('tagreplacer:TumblrClient');

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

    debug('options %o', this.options);
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

  static castToArray(value) {
    return _.isArray(value) ? value : [value];
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
   * [findPostsWithSingleTag description]
   * @param  {[type]} tag [description]
   * @return {[type]}     [description]
   */
  findPostsWithSingleTag(tag) {
    var promises = this.methods.map(method => {
      return this.findPosts({ tag, method })
        .then(result => {
          if (this.options.caseSensitive) {
            return _.filter(result, post =>  _.includes(post.tags, tag));
          } else {
            return result;
          }
        })
        .then(result => ({
          [method.key]: result
        }));
    });

    return Promise.all(promises)
      .then(results => results.reduce((a, v) => _.assign(a, v), {}))
      .then(results => _.assign({}, EMPTY_RESPONSE, results));
  }

  /**
   * [findPostsWithTags description]
   * @param  {[type]} input [description]
   * @return {[type]}       [description]
   */
  findPostsWithTags(find) {
    if (!_.isArray(find)) return Promise.reject(`expected 'find' to be an Array, but it was ${typeof find}`);

    const tags = _.chain(find)
      .thru(TumblrClient.castToArray)
      .sortBy()
      .value();
    const firstTag = tags[0];

    if (tags.length > 1) {
      // get first tag then filter
      return this.findPostsWithSingleTag(firstTag)
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
      return this.findPostsWithSingleTag(firstTag);
    }
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
          return tag.toLowerCase() === findTag.toLowerCase();
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

        return Promise.all(promises);
      });
  }
}


module.exports = TumblrClient;
