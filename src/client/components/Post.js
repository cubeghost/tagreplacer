import React from 'react';
import PropTypes from 'prop-types';

import { formatTags } from '../util';

const Post = ({ post }) => (
  <div className="post">
    <a href={post.post_url} target="_blank" rel="noopener noreferrer">
      {post.id}/{post.slug}
    </a>
    <span className="tags">
      {post.tags.length > 0 && formatTags(post.tags)}
    </span>
  </div>
);

Post.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number.isRequired,
    slug: PropTypes.string,
    post_url: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default React.memo(Post);
