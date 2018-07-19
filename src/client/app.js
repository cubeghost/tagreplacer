import React from 'react';
import createReactClass from 'create-react-class';
import { BrowserRouter, Route, Link } from 'react-router-dom';

import Home from './home';
import Replacer from './replacer';
import Help from './help';
import { apiFetch, debugError } from './util';

const App = createReactClass({
  getInitialState: function() {
    return {
      loading: true,
      auth: false, // have we oauthed?
      user: {},
      error: undefined,
    };
  },

  componentDidMount: function() {
    this.replaceHash();
    this.getUser();
  },

  // remove the #_=_ that comes back from tumblr oauth
  replaceHash: function() {
    if (window.location.hash && window.location.hash === '#_=_') {
      window.history.pushState('', document.title, window.location.pathname);
    }
  },

  // get user data
  // this will also check to see if we've already oauthed
  getUser: function() {
    apiFetch('GET', '/user')
      .then(
        function(user) {
          this.setState({
            auth: true,
            loading: false,
            user: {
              name: user.name,
              blogs: user.blogs,
            },
          });
        }.bind(this)
      )
      .catch(
        function(error) {
          debugError(error);
          this.setState({
            error: error,
            loading: false,
            auth: false,
          });
        }.bind(this)
      );
  },

  // render

  renderError: function() {
    if (this.state.error !== undefined) {
      if (this.state.error.message !== 'No user session') {
        return <div className="error">{this.state.error.message}</div>;
      }
    }
  },

  renderLoadingState: function() {
    if (this.state.loading && location.pathname.indexOf('/help') < 0) {
      return (
        <div className="loading">
          <p>loading</p>
        </div>
      );
    }
  },

  render: function() {
    return (
      <BrowserRouter>
        <div className="app">
          <header>
            <h1>
              <Link to="/">tag replacer</Link>
            </h1>
            <nav>
              <Link to="/help">help</Link>
              {this.state.auth && !this.state.loading ? (
                <a href="/disconnect">disconnect</a>
              ) : null}
            </nav>
          </header>

          <div className="content">
            {this.renderError()}

            {this.renderLoadingState()}

            <Route path="/help" component={Help} />

            {!this.state.loading && (
              <Route
                exact
                path="/"
                render={function(routeProps) {
                  if (this.state.auth) {
                    return (
                      <Replacer blogs={this.state.user.blogs} {...routeProps} />
                    );
                  } else {
                    return <Home {...routeProps} />;
                  }
                }.bind(this)}
              />
            )}
          </div>

          <footer>
            <p>
              by <a href="https://cubegho.st/">alex</a>
            </p>
            <nav>
              <a href="https://github.com/cubeghost/tagreplacer">github</a>
              <a href="https://tagreplacer.tumblr.com">changelog</a>
            </nav>
          </footer>
        </div>
      </BrowserRouter>
    );
  },
});

export default App;
