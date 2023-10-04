import React from 'react';

const ConnectButton = () => (
  <a href="/connect/tumblr" className="connect">
    <span>connect to tumblr</span>
    <svg viewBox="0 0 120 20">
      <rect className="dashed" height="18" width="118" x="1" y="1" rx="10" ry="10" fill="none" />
      <rect className="stroke" height="18" width="118" x="1" y="1" rx="10" ry="10" fill="none" />
    </svg>
  </a>
);

export default React.memo(ConnectButton);