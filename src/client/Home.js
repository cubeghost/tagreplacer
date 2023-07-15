import React from 'react';
import { useSelector } from 'react-redux';

import ConnectButton from './components/ConnectButton';

const Home = () => {
  const isLoading = useSelector(state => state.tumblr.loading);

  if (isLoading) {
    return (
      <div className="loading">
        <p>loading</p>
        <img
          src="https://media.giphy.com/media/B6sl8C4moPBGo/giphy.gif"
          className="pixel-perfect"
          alt="homer simpson floor spinning"
        />
      </div>
    );
  } else {
    return <ConnectButton />;
  }
};

export default React.memo(Home);
