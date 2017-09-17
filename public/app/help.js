var React = require('react');
var createReactClass = require('create-react-class');
var { Link } = require('react-router-dom');
var ReactMarkdown = require('react-markdown');

var helpMarkdown = require('./help.md');

var Help = createReactClass({

  render: function() {
    return (<div className="help">
      <Link to="/" className="back">&larr; back</Link>
      <h2>help</h2>
      <ReactMarkdown
        source={helpMarkdown}
        escapeHtml={true}
      />
    </div>);
  }

});



module.exports = Help;
