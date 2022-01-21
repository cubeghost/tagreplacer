import React from 'react';
import PropTypes from 'prop-types';

import { formatTags } from '../util';

const Post = ({ id, slug, post_url, tags }) => (
  <div className="post">
    <a href={post_url} target="_blank" rel="noopener noreferrer">
      {id}/{slug}
    </a>
    <span className="tags">
      {tags.length > 0 && formatTags(tags)}
    </span>
  </div>
);

Post.propTypes = {
  id: PropTypes.string.isRequired,
  slug: PropTypes.string,
  post_url: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
};

export default React.memo(Post);
