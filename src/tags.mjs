import compact from 'lodash-es/compact.js';
import sortBy from 'lodash-es/sortBy.js';
import isEqual from 'lodash-es/isEqual.js';
import intersection from 'lodash-es/intersection.js';

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
 * Replaces a set of tags with other tags
 * @param {object} params
 * @param {String[]} params.tags
 * @param {String[]} params.find
 * @param {String[]} params.replace 
 * @param {Options} options
 */
export function replaceTags({ tags, find, replace }, options = {}) {
  const { caseSensitive, allowDelete } = {...DEFAULT_OPTIONS, ...options};

  let replaceableTags = [...replace];
  let result = [...tags];

  if (replaceableTags.length === 0 && !allowDelete) {
    throw new Error(`Can't replace tags with nothing unless deleting tags is allowed`);
  }

  // TODO use Set?

  // loop through find to get matches
  find.forEach((findTag) => {
    const matchIndex = result.findIndex((tag) => {
      if (caseSensitive) {
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

  // dedupe existing tags
  replaceableTags = replaceableTags.filter((replaceTag) => {
    const matchIndex = result.findIndex((tag) => {
      if (caseSensitive) {
        return tag === replaceTag;
      } else {
        return (
          (tag && tag.toLowerCase()) ===
          (replaceTag && replaceTag.toLowerCase())
        );
      }
    });

    return matchIndex === -1;
  });

  // if anything left over to replace, append to end
  result = [...result, ...replaceableTags];

  result = compact(result);
  return result;
}

/**
 * TODO what was this for? replacing the logic in TumblrClient.findPostsWithTags?
 * @param {String[]} find   tags to find
 * @param {Object[]} posts  tumblr posts
 * @param {Options} options
 */
export function filterPosts({ find, posts }, options = {}) {
  const { caseSensitive } = {...DEFAULT_OPTIONS, ...options};
  const tags = sortBy(find);

  if (caseSensitive) {
    return posts.filter(post => {
      const sortedPostTags = sortBy(post.tags);
      return isEqual(
        intersection(sortedPostTags, tags),
        tags
      );
    });
  } else if (tags.length > 1) {
    const lowerCaseTags = tags.map(t => t.toLowerCase());
    return posts.filter(post => {
      const sortedLowerCasePostTags = sortBy(post.tags.map(t => t.toLowerCase()))
      return isEqual(
        intersection(sortedLowerCasePostTags, lowerCaseTags),
        lowerCaseTags,
      );
    });
  } else {
    return posts;
  }
}