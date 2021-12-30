require('dotenv').config();

const EventEmitter = require('events');
const _ = require('lodash');
const tumblr = require('tumblr.js');
const Sentry = require('@sentry/node');

const Tags = require('./tags');
const logger = require('./logger');

const POST_LIMIT = 20;
const REPLACE_SOFT_LIMIT = 500 - POST_LIMIT;

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

const sleep = ms => new Promise(resolve => {
  setTimeout(resolve, ms);
});

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
        // this is not officially supported
        bearer: token,
      },
      returnPromises: true
    }));
    
    const tags = new Tags(options);
    this.replaceTags = tags.replace;

    this.blog = blog;
    this.options = _.assign({}, DEFAULT_OPTIONS, options);
  }

  static methods = METHODS_CONFIG;

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
    return this.client.userInfo();
  }

  /**
   * find all posts with a tag and method
   * @param  {String} tag             tag to find
   * @param  {Method} method          method to use
   * @return {EventEmitter}
   */
  findPosts({ tag, method }) {
    const results = [];
    const emitter = new EventEmitter();

    (async () => {
      let next = undefined;
      let retry = false;

      while (next !== false) {
        try {
          const response = await this.client[method.clientMethod](this.blog, {
            tag: tag,
            limit: POST_LIMIT,
            filter: 'text',
            [method.nextParam]: next,
          });

          let posts;
          if (this.options.caseSensitive) {
            posts = _.filter(response.posts, post => _.includes(post.tags, tag));
          } else if (method.key !== METHODS.posts) {
            // draft and queue methods don't support the tag param 🙄
            posts = _.filter(response.posts, post => (
              _.includes(post.tags.map(t => t.toLowerCase()), tag.toLowerCase())
            ));
          } else {
            posts = response.posts;
          }

          results.push(...posts);
          emitter.emit('data', posts);

          if (_.get(response, '_links.next')) {
            next = response._links.next.query_params[method.nextParam];
            await sleep(500);
          } else {
            next = false;
            emitter.emit('end', results);
          }
        } catch (error) {
          // retry once
          if (!retry) {
            retry = true;
            await sleep(500);
          } else {
            emitter.emit('error', error);
            break;
          }
        }
      }
    })();

    return emitter;
  }

  /**
   * [findPostsWithTags description]
   * @param  {MethodName}  methodName
   * @param  {String[]}    find 
   * @return {EventEmitter}
   */
  findPostsWithTags(methodName, find) {
    if (!_.isArray(find)) throw new Error(`expected 'find' to be an Array, but it was ${typeof find}`);

    const emitter = new EventEmitter();

    const tags = _.chain(find)
      .sortBy()
      .value();
    const firstTag = tags[0];
    const method = METHODS_CONFIG[methodName];

    this.findPosts({ tag: firstTag, method })
      .on('data', (posts) => {
        // if multiple tags, filter on results from first tag
        if (tags.length > 1) {
          const postsWithAllTags = _.filter(posts, post => {
            const sortedPostTags = _.sortBy(post.tags);
            return _.isEqual(
              _.intersection(sortedPostTags, tags),
              tags
            );
          });
          emitter.emit('data', postsWithAllTags);
        } else {
          emitter.emit('data', posts);
        }
      })
      .on('error', error => (
        emitter.emit('error', error)
      ))
      .on('end', posts => (
        emitter.emit('end', posts)
      ));

    return emitter;
  }

  /**
   * [findAndReplaceTags description]
   * @param  {MethodName}  methodName
   * @param  {String[]}    find    
   * @param  {String[]}    replace
   * @return {EventEmitter}
   */
  findAndReplaceTags(methodName, find, replace) {
    if (!_.isArray(find)) throw new Error(`expected 'find' to be an Array, but it was ${typeof find}`);
    if (!_.isArray(replace)) throw new Error(`expected 'replace' to be an Array, but it was ${typeof find}`);

    const emitter = new EventEmitter();

    this.findPostsWithTags(methodName, find)
      .on('end', (posts) => {
        const promises = posts
          .slice(0, REPLACE_SOFT_LIMIT)
          .map(post => {
            const replacedTags = this.replaceTags({
              tags: post.tags,
              find,
              replace,
            });

            return this.client.editPost(this.blog, {
              id: post.id,
              tags: replacedTags.join(','),
            }).then((response) => {
              emitter.emit('data', response);
              return response;
            });
          });

        Promise.all(promises)
          .then(replaced => (
            emitter.emit('end', replaced)
          ));
      });

    return emitter;
  }
}

module.exports = TumblrClient;