import React, { useCallback, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { flow, values, map, sum } from 'lodash/fp';

import Options from './options';
import Results from './components/Results';
import TagInput from './components/TagInput';
import BlogSelect from './components/BlogSelect';

import { formatTags } from './util';
import * as actions from './state/actions';

const LOADING = 'https://media.giphy.com/media/l3fQv3YSQZwlTTbC8/200.gif';

const Replaced = ({ replaced }) => {
  const options = useSelector(state => state.options);
  const find = useSelector(state => state.form.find);
  const replace = useSelector(state => state.form.replace);

  const totalReplaced = flow([
    values,
    map('length'),
    sum,
  ])(replaced);

  if (totalReplaced === 0) return null;

  if (replace.length === 0 && options.allowDelete) {
    return (
      <h2>
        deleted {formatTags(find)} for {totalReplaced} posts
      </h2>
    );
  } else {
    return (
      <h2>
        replaced {formatTags(find)} with&nbsp;
        {formatTags(replace)} for&nbsp;
        {totalReplaced} posts
      </h2>
    );
  }

};

const Replacer = () => {
  const dispatch = useDispatch();

  const options = useSelector(state => state.options);

  const blog = useSelector(state => state.form.blog);
  const find = useSelector(state => state.form.find);
  const replace = useSelector(state => state.form.replace);

  const foundPosts = useSelector(state => (
    state.tumblr.posts?.length > 0 ||
    state.tumblr.queued?.length > 0 ||
    state.tumblr.drafts?.length > 0
  ));
  const isLoading = useSelector(state => state.loading);
  const [replaced, setReplaced] = useState([]); // TODO why isnt this in redux

  const replaceInputRef = useRef();

  const disableBlog = !!foundPosts;
  const disableFind = !blog || !!foundPosts;
  const disableReplace = !foundPosts;

  const disableFindButton = find.length === 0 || disableFind;
  const disableReplaceButton = replace.length === 0 && !options.allowDelete;
  const deleteMode = replace.length === 0 && options.allowDelete;

  const handleFind = useCallback((event) => {
    if (event) event.preventDefault();

    dispatch(actions.find())
      .then(() => {
        replaceInputRef.current?.select.focus();
      });
  }, [dispatch])

  const handleReplace = useCallback((event) => {
    if (event) event.preventDefault();

    dispatch(actions.replace())
      .then(action => setReplaced(action.response));
  }, [dispatch]);

  const handleReset = useCallback((event) => {
    if (event) event.preventDefault();

    dispatch(actions.reset());
    setReplaced([]);
  }, [dispatch]);

  return (
    <div className="replacer">
      {isLoading && (
        <div className="loading">
          <p>loading</p>
          <img src={LOADING} width="100" alt="spinning overlapping computers" />
        </div>
      )}

      <div className="window form">
        <Options />

        <form className={classNames('blog', { disabled: disableBlog })}>
          <label htmlFor="blog">blog</label>
          <BlogSelect disabled={disableBlog} />
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
              {formatTags(find)}&nbsp;
              {deleteMode ? 'or replace with' : 'with'}
          </label>
          <TagInput
            name="replace"
            disabled={disableReplace}
            setRef={ref => {
              replaceInputRef.current = ref;
            }}
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
        {foundPosts && (
          <div>
            <Replaced replaced={replaced} />
            <button className="reset" onClick={handleReset}>
              reset
              </button>
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
