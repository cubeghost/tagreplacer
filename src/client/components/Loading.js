import React from 'react';

import fileTransfer from '../../assets/filetransfer.gif';

const Loading = () => (
  <div style={{ textAlign: 'center' }}>
    <img
      src={fileTransfer}
      className="pixel-perfect"
      alt="loading"
      height={48}
    />
  </div>
);

export default React.memo(Loading);
