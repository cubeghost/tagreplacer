var React = require('react');
var ReactDOM = require('react-dom');
var { Router, Route, IndexRoute, browserHistory } = require('react-router');
var _ = require('lodash');

require('whatwg-fetch');

var Replacer = require('./replacer');
var Options = require('./options');
var { apiFetch, debugError } = require('./util');


var App = React.createClass({

  getInitialState: function() {
    return {
      showOptions: true,
      loading: true,
      auth: false, // have we oauthed?
      user: {},
      options: {
        includeQueue: false,
        includeDrafts: true
      },
      error: undefined
    }
  },

  componentWillMount: function() {

    this.replaceHash();
    this.getUser();

  },

  // remove the #_=_ that comes back from tumblr oauth
  replaceHash: function() {
    if (window.location.hash && window.location.hash == '#_=_') {
      window.history.pushState('', document.title, window.location.pathname);
    }
  },

  // get user data
  // this will also check to see if we've already oauthed
  getUser: function() {
    apiFetch('GET', '/user')
    .then(function(user) {
      this.setState({
        auth: true,
        loading: false,
        user: {
          name: user.name,
          blogs: user.blogs
        }
      });
    }.bind(this))
    .catch(function(error) {
      debugError(error);
      this.setState({
        error: error,
        loading: false,
        auth: false
      });
    }.bind(this));
  },

  toggleOptions: function() {
    this.setState({
      showOptions: !this.state.showOptions
    });
  },

  handleOptions: function(event) {
    var options = _.extend({}, this.state.options);
    var field = event.target.dataset.field;

    options[field] = event.target.checked;

    this.setState({
      options: options
    });
  },

  // render

  renderError: function() {
    if (this.state.error !== undefined) {
      if (this.state.error.message !== 'No user session') {
        return (<div className="error">{this.state.error.message}</div>);
      }
    }
  },

  renderLoadingState: function() {
    if (this.state.loading) {
      return (<div className="loading">
        <p>loading</p>
      </div>);
    }
  },

  render: function() {
    var authLink = <a href="/connect/tumblr" className="connect">connect to tumblr</a>;

    return (<div className="app">
      <header>
        <h1>tag replacer</h1>
        <nav>
          <a onClick={this.toggleHelp}>help</a>
          {this.state.auth && !this.state.loading ? <a onClick={this.toggleOptions}>options</a> : null}
          {this.state.auth && !this.state.loading ? <a href="/disconnect">disconnect</a> : null}
        </nav>
      </header>
      {this.renderError()}
      {this.renderLoadingState()}
      {this.state.auth && !this.state.loading && this.state.showOptions ? <Options options={this.state.options} handleOptions={this.handleOptions} /> : null}
      {!this.state.auth && !this.state.loading ? authLink : null}
      {this.state.auth && !this.state.loading ? <Replacer blogs={this.state.user.blogs} options={this.state.options} /> : null}
    </div>);
  }

});




ReactDOM.render(<App />, document.querySelector('.container'));
