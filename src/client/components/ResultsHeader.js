import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { formatTags } from '../util';

const ResultsHeader = ({ isPreview, isReplaced }) => {
  const { includeQueue, includeDrafts } = useSelector(state => state.options);
  const { blog, find, replace } = useSelector(state => state.form);
  const postsCount = useSelector(state => Object.keys(state.posts.entities).length);

  return (
    <div className="section sticky" style={{ top: "1rem" }}>
      <div>
        found {postsCount} results for{" "}
        <a
          href={`https://${blog}.tumblr.com/tagged/${find}`}
          className="external-link"
        >
          {formatTags(find)}
        </a>
      </div>
      {isPreview && (
        <div>
          <br />
          replacing with{" "}
          <a
            href={`https://${blog}.tumblr.com/tagged/${replace}`}
            className="external-link"
          >
            {formatTags(replace)}
          </a>{" "}
          (preview)
        </div>
      )}
      {isReplaced && (
        <div>
          <br />
          replaced with{" "}
          <a
            href={`https://${blog}.tumblr.com/tagged/${replace}`}
            className="external-link"
          >
            {formatTags(replace)}
          </a>{" "}
        </div>
      )}
    </div>
  );
};

ResultsHeader.propTypes = {
  isPreview: PropTypes.bool,
  isReplaced: PropTypes.bool,
};

export default React.memo(ResultsHeader);