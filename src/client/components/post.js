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
  post: PropTypes.object.isRequired,
};

export default Post;
