import React from 'react';
import { useSelector } from 'react-redux';
import orderBy from 'lodash/orderBy';

import Post from './Post';
import {joinReactNodes} from '../util'
import { useStep } from '../steps';

/** TODO use actual Tags module for preview
 * const Tags = require('./tags');
 * tags = new Tags(options)
 */

const Posts = () => {
  const step = useStep();
  const isPreviewReplace = step.key === 'replace';

  const { find, replace } = useSelector(state => state.form);
  const posts = useSelector((state) => state.posts.entities);

  return orderBy(Object.values(posts), ['timestamp']).map((post) => {
    const tags = post.tags.map((tag) => {
      if (isPreviewReplace && find.includes(tag)) {
        return <strong key={tag}>#{replace}</strong>;
      }
      if (post.replaced && replace.includes(tag)) {
        return <strong key={tag}>#{tag}</strong>;
      }
      if (find.includes(tag)) {
        return <strong key={tag}>#{tag}</strong>;
      }
      if (replace.includes(tag)) {
        return <em key={tag}>#{tag}</em>;
      }
      return "#" + tag;
    });

    return (
      <Post
        id={post.id_string}
        key={post.id_string}
        legacy_type={post.legacy_type}
        post_url={post.post_url}
        replaced={post.replaced}
        slug={post.slug}
        summary={post.summary}
        tags={joinReactNodes(tags, ', ')}
        thumbnail={post.thumbnail}
      />
    );
  });
};

export default React.memo(Posts);