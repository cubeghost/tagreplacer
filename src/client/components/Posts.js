import React from 'react';
import { useSelector } from 'react-redux';

import Post from './Post';
import {joinReactNodes} from '../util'

const Posts = ({ isPreview }) => {
  const { find, replace } = useSelector(state => state.form);
  const posts = useSelector((state) => state.posts.entities);

  return Object.values(posts).map((post) => {
    const tags = post.tags.map((tag) => {
      if (isPreview && find.includes(tag)) {
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
        id={post.id}
        key={post.id}
        permalink={post.post_url}
        tags={joinReactNodes(tags, ', ')}
        replaced={post.replaced}
      />
    );
  });
};

export default React.memo(Posts);