require('dotenv').config();

const _ = require('lodash');
const tumblr = require('tumblr.js');

const POST_LIMIT = 20;


class TumblrAPI {
  constructor({ token, secret, blog, options }) {
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
    this.options = options;
  }

  get methods() {
    var methods = [
      {
        apiMethod: 'blogPosts',
        arrayKey: 'posts',
      }
    ];

    if (this.options.includeQueue) {
      methods.push({
        apiMethod: 'blogQueue',
        arrayKey: 'queued',
      });
    }

    if (this.options.includeDrafts) {
      methods.push({
        apiMethod: 'blogDrafts',
        arrayKey: 'drafts',
      });
    }

    return methods;
  }

  getUserInfo() {
    return this.client.userInfo();
  }

  /**
   * [findPosts description]
   * @param  {[type]} tag          [description]
   * @param  {[type]} method       [description]
   * @param  {Number} [offset=0]   [description]
   * @param  {Array}  [results=[]] [description]
   * @param  {Object} [params={}]  [description]
   * @param  {[type]} [retry=false }]            [description]
   * @return {[type]}              [description]
   */
  findPosts({ tag, method, offset = 0, results = [], params = {}, retry = false }) {

    return this.client[method.apiMethod](this.blog, _.assign({
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
          if (method.apiMethod === 'blogDrafts') { // seriously, what the fuck
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
          [method.arrayKey]: result
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
