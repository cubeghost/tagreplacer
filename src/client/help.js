import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import helpMarkdown from './help.md';

const Help = createReactClass({
  render: function() {
    return (
      <div className="help">
        <Link to="/" className="back">
          &larr; back
        </Link>
        <h2>help</h2>
        <ReactMarkdown source={helpMarkdown} escapeHtml={true} />
      </div>
    );
  },
});

export default Help;
