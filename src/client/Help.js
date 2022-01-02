import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import helpMarkdown from './help.md';

const Help = () => (
  <div className="window markdown">
    <Link to="/" className="back">
      &larr; back
    </Link>
    <h2>help</h2>
    <ReactMarkdown source={helpMarkdown} escapeHtml={true} />
  </div>
);

export default React.memo(Help);
