import React, { useEffect } from 'react';
import { Route, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { getUser, websocketConnect } from './state/actions';

import Home from './Home';
import Replacer from './Replacer';
import Help from './Help';
import Privacy from './Privacy';

const replaceHash = () => {
  const location = window.location;
  if (location.hash && location.hash === '#_=_') {
    location.replace(location.origin + location.pathname);
  }
};

const Errors = () => {
  const errors = useSelector(state => state.errors);
  return errors.map((error, i) => (
    <div className="error" key={`error-${i}`}>
      {JSON.stringify(error)}
    </div>
  ));
}

const App = () => {
  const dispatch = useDispatch();
  
  const isAuthed = useSelector(state => Boolean(state.tumblr.username));
  const isLoading = useSelector(state => state.loading);

  useEffect(() => {
    replaceHash();
    dispatch(websocketConnect());
    dispatch(getUser());
  }, [dispatch]);

  return (
    <div className="app">
      <header>
        <h1>
          <Link to="/">tag replacer</Link>
        </h1>
        <nav>
          <Link to="/help">help</Link>
          {(isAuthed && !isLoading) && (
            <a href="/disconnect">disconnect</a>
          )}
        </nav>
      </header>

      <div className="content">
        <Errors />

        <Route path="/help" component={Help} />
        <Route path="/privacy" component={Privacy} />

        <Route
          exact
          path="/"
          render={(routeProps) => {
            if (isAuthed) {
              return <Replacer {...routeProps} />;
            } else {
              return <Home {...routeProps} />;
            }
          }}
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
};

export default React.memo(App);
