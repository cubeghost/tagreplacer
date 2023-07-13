import React from 'react';
import PropTypes from 'prop-types';

const Post = ({ id, tags, permalink, replaced }) => (
  <div className="post">
    {replaced && "✅"}
    <a className="post-permalink" href={permalink} target="_blank" rel="noopener noreferrer">
      {id}
    </a>
    <div className="post-tags">{tags}</div>
  </div>
);

Post.propTypes = {
  id: PropTypes.string.isRequired,
  // slug: PropTypes.string,
  post_url: PropTypes.string,
  tags: PropTypes.node,
  replaced: PropTypes.bool,
};

export default React.memo(Post);
