import React from 'react';
import PropTypes from 'prop-types';

import postTypeSprites from '../../assets/postTypes.svg';

const Post = ({ id, legacy_type, post_url, replaced, slug, summary, tags, thumbnail }) => {
  // TODO trunace summary much earlier

  return (
    <div className="post">
      <a className="post-permalink" href={post_url} target="_blank" rel="noopener noreferrer">
        {thumbnail && (thumbnail === 'icon' ? (
          <svg className="post-thumbnail" alt={`${legacy_type} icon`}><use href={`${postTypeSprites}#${legacy_type}`} /></svg>
        ) : (
          <img src={thumbnail} className="post-thumbnail" alt="TODO media thumbnail" />
        ))}
        <span>{summary || (thumbnail ? '' : slug || id)}</span>
      </a>
      <div className="post-tags">{tags}</div>
      {true && <div className="post-checkmark">✅</div>}

    </div>
  );
};

Post.propTypes = {
  id: PropTypes.string.isRequired,
  legacy_type: PropTypes.string.isRequired,
  post_url: PropTypes.string.isRequired,
  replaced: PropTypes.bool,
  slug: PropTypes.string,
  summary: PropTypes.string,
  tags: PropTypes.node.isRequired,
  thumbnail: PropTypes.string,
};

export default React.memo(Post);
