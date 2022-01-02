import React from 'react';
import { useSelector } from 'react-redux';

const Home = () => {
  const isLoading = useSelector(state => state.loading);

  if (isLoading) {
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

export default React.memo(Home);
