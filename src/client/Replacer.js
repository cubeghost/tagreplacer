import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { flow, values, map, sum } from 'lodash/fp';

import Options from './Options';
import Results from './components/Results';
import TagInput from './components/TagInput';
import BlogSelect from './components/BlogSelect';

import * as actions from './state/actions';

const LOADING = 'https://media.giphy.com/media/l3fQv3YSQZwlTTbC8/200.gif';

const Tags = ({tags}) => {
  if (tags.length === 0) {
    return 'tag';
  } else {
    return '#' + tags.join(', #');
  }
};

const Replacer = () => {
  const dispatch = useDispatch();

  const [replaced, setReplaced] = useState({}); // move to redux?

  const options = useSelector(state => state.options);
  const isLoading = useSelector(state => state.loading);
  const hasFoundPosts = useSelector(state => (
    state.tumblr.posts.length > 0 ||
    state.tumblr.queued.length > 0 ||
    state.tumblr.drafts.length > 0
  ));

  const blog = useSelector(state => state.form.blog);
  const find = useSelector(state => state.form.find);
  const replace = useSelector(state => state.form.replace);

  const replaceInputRef = useRef();

  const disableBlog = !!hasFoundPosts;
  const disableFind = !blog || !!hasFoundPosts;
  const disableReplace = !hasFoundPosts;

  const disableFindButton = find.length === 0 || disableFind;
  const disableReplaceButton = replace.length === 0 && !options.allowDelete;
  const deleteMode = replace.length === 0 && options.allowDelete;

  const handleFind = useCallback((event) => {
    if (event) event.preventDefault();
    dispatch(actions.find()).then(() => {
      if (replaceInputRef) {
        replaceInputRef.current.select.focus();
      }
    });
  }, [dispatch]);

  const handleReplace = useCallback((event) => {
    if (event) event.preventDefault();
    dispatch(actions.replace()).then((action) => {
      setReplaced(action.response);
    });
  }, [dispatch]);

  const handleReset = useCallback((event) => {
    if (event) event.preventDefault();
    dispatch(actions.reset());
    setReplaced({});
  }, [dispatch]);

  const totalReplaced = useMemo(() => (
    flow([
      values,
      map('length'),
      sum,
    ])(replaced)
  ), [replaced]);

  return (
    <div className="replacer">
      {isLoading && (
        <div className="loading">
          <p>loading</p>
          <img src={LOADING} width="100" alt="Loading..." />
        </div>
      )}

      <div className="window form">
        <Options />

        <form className={classNames('blog', { disabled: disableBlog })}>
          <label htmlFor="blog">blog</label>
          <BlogSelect id="blog" disabled={disableBlog} />
        </form>

        <form className={classNames('find', { disabled: disableFind })} onSubmit={handleFind}>
          <label htmlFor="find">find tag</label>
          <TagInput
            name="find"
            disabled={disableFind}
          />
          <button
            type="submit"
            className="find"
            onClick={handleFind}
            disabled={disableFindButton}
          >
            find
          </button>
        </form>

        <form className={classNames('replace', { disabled: disableReplace })} onSubmit={handleReplace}>
          <label htmlFor="replace">
            {deleteMode ? 'delete' : 'replace'}&nbsp;
              <Tags tags={find} />&nbsp;
              {deleteMode ? 'or replace with' : 'with'}
          </label>
          <TagInput
            name="replace"
            disabled={disableReplace}
            ref={((ref) => {
              replaceInputRef.current = ref;
            })}
          />
          <button
            type="submit"
            className="replace"
            onClick={handleReplace}
            disabled={disableReplace || disableReplaceButton}
          >
            {deleteMode ? 'delete' : 'replace'}
          </button>
        </form>
      </div>

      <div className="window result">
        {hasFoundPosts && (
          <div>
            {totalReplaced > 0 && (
              deleteMode ? (
                <h2>
                  deleted <Tags tags={find} /> for {totalReplaced} posts
                </h2>
              ) : (
                <h2>
                  replaced <Tags tags={find} /> with&nbsp;
                  <Tags tags={replace} /> for&nbsp;
                  {totalReplaced} posts
                </h2>
              )
            )}
            {hasFoundPosts && (
              <button className="reset" onClick={handleReset}>
                reset
              </button>
            )}
          </div>
        )}
        <Results name="posts" />
        {options.includeQueue && <Results name="queued" />}
        {options.includeDrafts && <Results name="drafts" />}
      </div>
    </div>
  );
};

export default React.memo(Replacer);
