var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');
var { BrowserRouter, Route, Link } = require('react-router-dom');
var _ = require('lodash');

require('whatwg-fetch');

var Home = require('./home');
var Replacer = require('./replacer');
var Help = require('./help');
var { apiFetch, debugError, formatPosts } = require('./util');


var App = createReactClass({

  getInitialState: function() {
    return {
      loading: true,
      auth: false, // have we oauthed?
      user: {},
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

  // render

  renderError: function() {
    if (this.state.error !== undefined) {
      if (this.state.error.message !== 'No user session') {
        return (<div className="error">{this.state.error.message}</div>);
      }
    }
  },

  renderLoadingState: function() {
    if (this.state.loading && location.pathname.indexOf('/help') < 0) {
      return (<div className="loading">
        <p>loading</p>
      </div>);
    }
  },

  render: function() {

    return (<BrowserRouter>
      <div className="app">
        <header>
          <h1><Link to="/">tag replacer</Link></h1>
          <nav>
            <Link to="/help">help</Link>
            {this.state.auth && !this.state.loading ? <a href="/disconnect">disconnect</a> : null}
          </nav>
        </header>

        <div className="content">
          {this.renderError()}

          {this.renderLoadingState()}

          <Route path="/help" component={Help} />

          {!this.state.loading && (
            <Route exact path="/" render={function(routeProps) {
              if (this.state.auth) {
                return (<Replacer blogs={this.state.user.blogs} {...routeProps} />);
              } else {
                return (<Home {...routeProps} />);
              }
            }.bind(this)} />
          )}
        </div>

        <footer>
          <p>by <a href="https://bldwn.co/">alex</a></p>
          <nav>
            <a href="https://github.com/cubeghost/tagreplacer">github</a>
            <a href="https://tagreplacer.tumblr.com">changelog</a>
          </nav>
        </footer>
      </div>
    </BrowserRouter>);
  }

});



ReactDOM.render(<App />, document.querySelector('.container'));
