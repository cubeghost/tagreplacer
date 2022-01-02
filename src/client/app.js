import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Route, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';

import { getUser } from './state/actions';

import Home from './Home';
import Replacer from './Replacer';
import Help from './Help';
import Privacy from './Privacy';

import noticeMarkdown from './2021-12-26-notice.md';

const mapStateToProps = state => ({
  authed: !!state.tumblr.username,
  loading: state.loading,
  errors: state.errors,
});

const mapDispatchToProps = dispatch => ({
  getUser: () => dispatch(getUser()),
});

const socket = new WebSocket(process.env.WEBSOCKET_HOST);
socket.onopen = (event) => {
  console.log('event', event)
  console.log('socket', socket)
};
socket.addEventListener('message', (event) => {
  console.log('ws', event.data);
});

class App extends Component {

  componentDidMount() {
    this.replaceHash();
    this.props.getUser();
  }

  // remove the #_=_ that comes back from tumblr oauth
  replaceHash() {
    const { location, history } = this.props;
    if (location.hash && location.hash === '#_=_') {
      history.replace(location.pathname);
    }
  }

  // render

  renderErrors() {
    return this.props.errors.map((error, i) => {
      if (error.body.message === 'No user session') return null;
      return (
        <div className="error" key={`error-${i}`}>
          {JSON.stringify(error)}
        </div>
      );
    });
  }

  render() {
    return (
      <div className="app">
        <header>
          <h1>
            <Link to="/">tag replacer</Link>
          </h1>
          <nav>
            <Link to="/help">help</Link>
            {this.props.authed && !this.props.loading ? (
              <a href="/disconnect">disconnect</a>
            ) : null}
          </nav>
        </header>

        <div className="window markdown">
          <ReactMarkdown source={noticeMarkdown} escapeHtml={true} />
        </div>

        <div className="content">
          {this.renderErrors()}

          <Route path="/help" component={Help} />
          <Route path="/privacy" component={Privacy} />

          <Route
            exact
            path="/"
            render={function(routeProps) {
              if (this.props.authed) {
                return <Replacer {...routeProps} />;
              } else {
                return <Home {...routeProps} />;
              }
            }.bind(this)}
          />
        </div>

        <footer>
          <p>
            by <a href="https://cubegho.st/">alex</a>
          </p>
          <nav>
            <Link to="/privacy">privacy</Link>
            <a href="https://github.com/cubeghost/tagreplacer">github</a>
            <a href="https://tagreplacer.tumblr.com">changelog</a>
          </nav>
        </footer>
      </div>
    );
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
