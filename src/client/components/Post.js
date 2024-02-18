import React from 'react';
import PropTypes from 'prop-types';

import postTypeSprites from '../../assets/postTypes.svg';

const STATE_EMOJI = {
  queued: '🕓',
  draft: '📝',
  private: '🔒',
};

const Post = ({ id, legacy_type, post_url, state, replaced, slug, summary, tags, thumbnail }) => {
  return (
    <div className="post">
      <a className="post-permalink" href={post_url} target="_blank" rel="noopener noreferrer">
        {thumbnail && (
          <div className="post-thumbnail">
            {thumbnail === 'icon' ? (
              <svg alt={`${legacy_type} icon`}><use href={`${postTypeSprites}#${legacy_type}`} /></svg>
            ) : (
              <img src={thumbnail} alt="TODO media thumbnail" />
            )}
            {state && state !== 'published' && STATE_EMOJI[state] && (
              <span role="img" aria-label={state} title={state} className="post-thumbnail-state">{STATE_EMOJI[state]}</span>
            )}
          </div>
        )}
        <span className="post-permalink-label">{summary || (thumbnail ? '' : slug || id)}</span>
      </a>
      <div className="post-tags display-tag">{tags}</div>
      {replaced && (
        <div className="post-checkmark">
          <span role="img" aria-label="Checkmark">✅</span>
        </div>
      )}
    </div>
  );
};

Post.propTypes = {
  id: PropTypes.string.isRequired,
  legacy_type: PropTypes.string.isRequired,
  post_url: PropTypes.string.isRequired,
  state: PropTypes.oneOf(['published', 'queued', 'draft', 'private']),
  replaced: PropTypes.bool,
  slug: PropTypes.string,
  summary: PropTypes.string,
  tags: PropTypes.node.isRequired,
  thumbnail: PropTypes.string,
};

export default React.memo(Post);
