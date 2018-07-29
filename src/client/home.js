import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading,
});

const Home = ({ loading }) => {
  if (loading) {
    return (
      <div className="loading">
        <p>loading</p>
      </div>
    );
  } else {
    return (
      <a href="/connect/tumblr" className="connect">
        connect to tumblr
      </a>
    );
  }
};

export default connect(mapStateToProps)(Home);
