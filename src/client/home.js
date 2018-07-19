import React from 'react';
import createReactClass from 'create-react-class';

const Home = createReactClass({
  render: function() {
    return (
      <a href="/connect/tumblr" className="connect">
        connect to tumblr
      </a>
    );
  },
});

export default Home;
