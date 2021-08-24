import React from 'react';
import PropTypes from 'prop-types';

const Post = ({ post }) => (
  <div className="post">
    <a href={post.post_url} target="_blank">
      {post.id}/{post.slug}
    </a>
    <span className="tags">
      {'#' + post.tags.join(', #')}
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

export default Post;
