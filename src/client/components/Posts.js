import React from 'react';
import { useSelector } from 'react-redux';
import orderBy from 'lodash-es/orderBy';

import Post from './Post';
import { joinReactNodes } from '../util';
import { useStep } from '../steps';
import { replaceTags } from '../../tags.mjs';

/** TODO use actual Tags module for preview
 * const Tags = require('./tags');
 * tags = new Tags(options)
 */

const Posts = () => {
  const step = useStep();
  const isPreviewReplace = step.key === 'replace';

  const { find, replace } = useSelector((state) => state.form);
  const { caseSensitive, allowDelete } = useSelector((state) => state.options);
  const posts = useSelector((state) => state.posts.entities);

  return orderBy(Object.values(posts), ['timestamp'], ['desc']).map((post) => {
    const tags = isPreviewReplace
      ? replaceTags(
          {
            tags: post.tags,
            find,
            replace,
          },
          { caseSensitive, allowDelete }
        )
      : post.tags;

    const renderedTags = tags.flatMap((tag) => {
      if (post.replaced && replace.includes(tag)) {
        return <strong key={tag}>#{tag}</strong>;
      }
      if (find.includes(tag)) {
        return <strong key={tag}>#{tag}</strong>;
      }
      if (replace.includes(tag)) {
        return <em key={tag}>#{tag}</em>;
      }
      return '#' + tag;
    });

    return (
      <Post
        id={post.id_string}
        key={post.id_string}
        legacy_type={post.legacy_type}
        post_url={post.post_url}
        state={post.state}
        replaced={post.replaced}
        slug={post.slug}
        summary={post.summary}
        tags={joinReactNodes(renderedTags, ', ')}
        thumbnail={post.thumbnail}
      />
    );
  });
};

export default React.memo(Posts);
