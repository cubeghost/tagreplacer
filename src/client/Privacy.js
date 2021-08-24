import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import privacyMarkdown from './privacy.md';

const Privacy = () => (
  <div className="window markdown">
    <Link to="/" className="back">
      &larr; back
    </Link>
    <h2>privacy</h2>
    <ReactMarkdown source={privacyMarkdown} escapeHtml={true} />
  </div>
);

export default Privacy;
