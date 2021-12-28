import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Post from './post';
import { formatTags } from '../util';

const mapStateToProps = (state, ownProps) => ({
  find: state.tumblr.find,
  results: state.tumblr[ownProps.name]
});

const Results = ({ name, find, results }) => {
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

export default connect(mapStateToProps)(Results);
