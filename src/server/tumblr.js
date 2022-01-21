require('dotenv').config();

const _ = require('lodash');
const tumblr = require('tumblr.js');
const Sentry = require('@sentry/node');

const Tags = require('./tags');
const logger = require('./logger');

const POST_LIMIT = 20;
const REPLACE_SOFT_LIMIT = 500 - POST_LIMIT;

/**
 * @typedef {Object} Options
 * @property {boolean} [caseSensitive=false] case sensitive tag matching
 * @property {boolean} [allowDelete=false]   allow deleting tags
 */
const DEFAULT_OPTIONS = {
  caseSensitive: false,
  allowDelete: false,
};

/**
 * @typedef MethodName
 * @property {string} POSTS posts
 * @property {string} QUEUED queued
 * @property {string} DRAFTS drafts
 */
const METHODS = {
  POSTS: 'posts',
  QUEUED: 'queued',
  DRAFTS: 'drafts',
};

/**
 * @typedef {Object} Method
 * @property {MethodName} key
 * @property {string}     clientMethod  tumblr.js client method name
 * @property {string}     nextParam     pagination key found in _links.next.query_params
 */
const METHODS_CONFIG = {
  // https://www.tumblr.com/docs/en/api/v2#posts
  [METHODS.POSTS]: {
    key: METHODS.POSTS,
    clientMethod: 'blogPosts',
    nextParam: 'page_number',
  },
  // https://www.tumblr.com/docs/en/api/v2#blog-queue
  [METHODS.QUEUED]: {
    key: METHODS.QUEUED,
    clientMethod: 'blogQueue',
    nextParam: 'offset',
  },
  // https://www.tumblr.com/docs/en/api/v2#blog-drafts
  [METHODS.DRAFTS]: {
    key: METHODS.DRAFTS,
    clientMethod: 'blogDrafts',
    nextParam: 'before_id',
  }
};

/**
 * @typedef Post
 * @property id
 * @property id_string
 * @property post_url
 * @property state
 * @property slug
 * @property tags
 * @property timestamp
 */
const POST_PROPERTIES = ['id', 'id_string', 'post_url', 'state', 'slug', 'tags', 'timestamp'];
/**
 * Trim properties from Tumblr API post object to match our slimmer Post
 * @param {Object} post Tumblr API response post
 * @returns {Post}
 */
const trimPost = post => _.pick(post, POST_PROPERTIES);

/**
 * @typedef TinyPost
 * @property id
 * @property id_string
 * @property tags
 */
const TINY_POST_PROPERTIES = ['id', 'id_string', 'tags'];
/**
 * Trim properties from Tumblr API Post object to match our itty bitty TinyPost
 * @param {Object|Post} post Tumblr API response post or Post
 * @returns {TinyPost}
 */
const tinyTrimPost = post => _.pick(post, TINY_POST_PROPERTIES);

class TumblrClient {
  /**
   * @param {string} token     oAuth access token
   * @param {string} blog      blog identifier
   * @param {Options} options  api options
   */
  constructor({ token, blog, options = {} }) {
    this.client = this.wrapClient(new tumblr.Client({
      credentials: {
        consumer_key: process.env.TUMBLR_API_KEY,
        consumer_secret: process.env.TUMBLR_API_SECRET,
        // this is not officially supported
        bearer: token,
      },
      returnPromises: true
    }));
    
    this.tags = new Tags(options);

    this.blog = blog;
    this.options = _.assign({}, DEFAULT_OPTIONS, options);
  }

  static methods = METHODS;

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
   * get authenticated user's info
   * https://www.tumblr.com/docs/en/api/v2#user-methods
   * @return {Promise<object>} API response
   */
  getUserInfo() {
    this.log('getUserInfo');
    return this.client.userInfo();
  }

  /**
   * @typedef FindResponse
   * @property {Post[]}   posts
   * @property {Object}   params next page params
   * @property {boolean}  complete
   */

  /**
   * find all posts with a tag and method
   * @param  {Method} methodName      method to use
   * @param  {String[]} tags          tags to find
   * @param  {Object} params          api params
   * @return {Promise<FindResponse>}
   */
  async findPostsWithTags(methodName, tags, params = {}) {
    const method = METHODS_CONFIG[methodName];

    const sortedTags = _.chain(tags)
      .sortBy()
      .value();
    const firstTag = sortedTags[0];

    const response = await this.client[method.clientMethod](this.blog, {
      tag: firstTag,
      limit: POST_LIMIT,
      filter: 'text',
      ...params,
    });

    let posts;
    if (method.key !== METHODS.posts) {
      // draft and queue methods don't support the tag param 🙄
      posts = _.filter(response.posts, post => (
        _.includes(post.tags.map(t => t.toLowerCase()), firstTag.toLowerCase())
      ));
    } else {
      posts = response.posts;
    }

    let filteredPosts = posts;
    if (this.options.caseSensitive) {
      filteredPosts = _.filter(posts, post => {
        const sortedPostTags = _.sortBy(post.tags);
        return _.isEqual(
          _.intersection(sortedPostTags, tags),
          tags
        );
      });
    } else if (tags.length > 1) {
      const lowerCaseTags = _.map(tags, t => t.toLowerCase());
      filteredPosts = _.filter(posts, post => {
        const sortedLowerCasePostTags = _.chain(post.tags).map(t => t.toLowerCase()).sortBy().value();
        return _.isEqual(
          _.intersection(sortedLowerCasePostTags, lowerCaseTags),
          lowerCaseTags,
        );
      });
    }

    let returnValue = {
      posts: filteredPosts.map(trimPost),
      params: {},
      complete: false,
    };

    if (_.get(response, '_links.next')) {
      returnValue.params[method.nextParam] = response._links.next.query_params[method.nextParam];
    } else {
      returnValue.complete = true;
    }

    this.log('findPostsWithTags', {
      methodName,
      tags,
    });

    return returnValue;
  }

  /**
   * replace tags on a post
   * @param {String}   postId
   * @param {String[]} find
   * @param {String[]} replace
   * @return {Promise<TinyPost>}
   */
  // TODO is there a way we can do this without 2 api calls?
  async replacePostTags(postId, find, replace) {
    if (!_.isArray(find)) throw new Error(`expected 'find' to be an Array, but it was ${typeof find}`);
    if (!_.isArray(replace)) throw new Error(`expected 'replace' to be an Array, but it was ${typeof find}`);

    const post = await this.client.blogPosts(this.blog, postId);
    const replacedTags = this.tags.replace({
      tags: post.tags,
      find,
      replace,
    });

    const response = await this.client.editPost(this.blog, {
      id: postId,
      tags: replacedTags.join(','),
    });

    this.log('replacePostTags', {
      postId,
      find,
      replace,
    });

    return {
      ...response,
      tags: replacedTags,
    };
  }
}

module.exports = TumblrClient;