import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Post from './Post';

const mapStateToProps = (state, ownProps) => ({
  find: state.form.find,
  results: state.tumblr[ownProps.name]
});

const Results = ({ name, find, results }) => {
  if (results.length) {
    const noun = name === 'queued' ? 'queued posts' : name;

    return (
      <div>
        <h2>
          found {results.length} {noun} tagged #{find}
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
