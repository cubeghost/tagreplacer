const _ = require('lodash');

class Tags {
  constructor(options = {}) {
    this.caseSensitive = options.caseSensitive || false;
    this.allowDelete = options.allowDelete || false;
  }

  /**
   * Replaces a set of tags with other tags
   * @param {String[]} tags
   * @param {String[]} find
   * @param {String[]} replace 
   */
  replace({ tags, find, replace }) {
    /* eslint-disable prefer-const */
    let replaceableTags = _.concat([], replace);
    let result = _.concat([], tags);

    if (replaceableTags.length === 0 && !this.allowDelete) {
      throw new Error(`Can't replace tags with nothing unless deleting tags is allowed`);
    }

    // loop through find to get matches
    _.each(find, findTag => {
      const matchIndex = _.findIndex(result, tag => {
        if (this.caseSensitive) {
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
   * Tags.filterPost
   * @param {String[]} find   tags to find
   * @param {Object[]} posts  tumblr posts
   */
  filterPosts({ find, posts }) {
    const tags = _.sortBy(find);

    if (this.options.caseSensitive) {
      return _.filter(posts, post => {
        const sortedPostTags = _.sortBy(post.tags);
        return _.isEqual(
          _.intersection(sortedPostTags, tags),
          tags
        );
      });
    } else if (tags.length > 1) {
      const lowerCaseTags = _.map(tags, t => t.toLowerCase());
      return _.filter(posts, post => {
        const sortedLowerCasePostTags = _.chain(post.tags).map(t => t.toLowerCase()).sortBy().value();
        return _.isEqual(
          _.intersection(sortedLowerCasePostTags, lowerCaseTags),
          lowerCaseTags,
        );
      });
    } else {
      return posts;
    }
  }

}

module.exports = Tags;