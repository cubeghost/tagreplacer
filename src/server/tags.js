const _ = require('lodash');

class Tags {
  constructor(options = {}) {
    this.caseSensitive = options.caseSensitive || false;
    this.allowDelete = options.allowDelete || false;
  }
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

}

module.exports = Tags;