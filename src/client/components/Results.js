import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Post from './Post';
import { formatTags } from '../util';

const Results = ({ name }) => {
  const find = useSelector(state => state.tumblr.find);
  const results = useSelector(state => state.tumblr[name]);

  if (results) {
    const noun = name === 'queued' ? 'queued posts' : name;

    return (
      <div>
        <h2>
          found {results.length} {noun} tagged {formatTags(find)}
        </h2>
        {results.map(result => (
          <Post post={result} key={`result-${name}-${result.id}`} />
        ))}
      </div>
    );
  } else {
    return null;
  }
};

Results.propTypes = {
  name: PropTypes.string.isRequired,
};

export default React.memo(Results);
