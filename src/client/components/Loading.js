import React from 'react';

const Loading = () => (
  <div style={{ textAlign: "center" }}>
    <img
      src="https://i.imgur.com/I5D2NXj.gif"
      className="pixel-perfect"
      alt="loading"
      height={48}
    />
  </div>
);

export default React.memo(Loading);