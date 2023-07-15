import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';

import OptionsIcon from './OptionsIcon';
import Connector from './Connector';
import Loading from './Loading';
import Posts from './Posts';
import Options from './Options';
import BlogSelect from './BlogSelect';
import TagInput from './TagInput';
import ResultsHeader from './ResultsHeader';
import { find as findPosts, replace as replacePosts, reset } from '../state/actions';

const Replacer = () => {
  const dispatch = useDispatch();

  const blogContainerRef = useRef();
  const findContainerRef = useRef();
  const replaceContainerRef = useRef();

  // const { blog, find, replace } = useSelector(state => state.form);

  const isLoading = useSelector(state => state.posts.loading);
  const [showOptions, setShowOptions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [canFind, setCanFind] = useState(true);
  const [canReplace, setCanReplace] = useState(false);
  const [previewReplace, setPreviewReplace] = useState(false);
  const [isReplaced, setIsReplaced] = useState(false);

  const preventFormSubmit = (event) => event.preventDefault();

  const drawConnectorRefs = useRef({});
  const setDrawConnectorRef = useCallback((ref) => {
    drawConnectorRefs.current = {
      ...drawConnectorRefs.current,
      ...ref
    };
  }, []);
  const redraw = useCallback(() => {
    Object.values(drawConnectorRefs.current).forEach((f) => f && f());
  }, []);

  useEffect(() => {
    redraw();
  }, [showOptions]);

  const doFind = useCallback(async () => {
    await dispatch(findPosts());

    setCanFind(false);
    setCanReplace(true);
    setShowResults(true);
  }, []);

  const doReplace = useCallback(async () => {
    setPreviewReplace(false);
    setCanReplace(false);
    
    await dispatch(replacePosts());

    setIsReplaced(true);
  }, []);

  const doReset = useCallback(() => {
    dispatch(reset());
    setPreviewReplace(false);
    setCanFind(true);
    setCanReplace(false);
  }, []);

  return (
    <main>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div className="column sticky" style={{ paddingRight: "1.5rem" }}>
          <form
            className="section"
            ref={blogContainerRef}
            disabled={!canFind}
            onSubmit={preventFormSubmit}
          >
            <div className="row form-row">
              <div className="field">
                <label htmlFor="blog">blog</label>
                <BlogSelect disabled={!canFind} />
              </div>
              <button
                onClick={() => setShowOptions((s) => !s)}
                className="image-button"
                style={{ marginLeft: "auto" }}
              >
                <OptionsIcon active={showOptions} />
              </button>
            </div>
          </form>
          {showOptions && <Options disabled={!canFind} />}
          <Connector
            startRef={blogContainerRef}
            endRef={findContainerRef}
            side="left"
            setDrawRef={setDrawConnectorRef}
          />
          <form
            className={clsx(
              "section",
              canFind ? "section-enabled" : "section-disabled"
            )}
            disabled={!canFind}
            ref={findContainerRef}
            onSubmit={preventFormSubmit}
          >
            <div className="field">
              <label htmlFor="find">find</label>
              <TagInput name="find" disabled={!canFind} />
              <button onClick={doFind}>
                go
                <img
                  src="https://unpkg.com/pixelarticons@latest/svg/search.svg"
                  height="12"
                  alt="find"
                />
              </button>
            </div>
          </form>
          <Connector
            startRef={findContainerRef}
            endRef={replaceContainerRef}
            side="right"
            disabled={!canReplace}
            setDrawRef={setDrawConnectorRef}
          />
          <form
            className={clsx(
              "section",
              canReplace ? "section-enabled" : "section-disabled"
            )}
            disabled={!canReplace}
            ref={replaceContainerRef}
            style={{ opacity: canReplace ? 1 : 0.25 }}
            onSubmit={preventFormSubmit}
          >
            <div className="field">
              <label htmlFor="replace">replace</label>
              <TagInput name="replace" disabled={!canReplace} />
              <button onClick={() => setPreviewReplace((s) => !s)}>
                {previewReplace ? "cancel" : "preview"}
              </button>
              {previewReplace && (
                <button onClick={doReplace}>replace</button>
              )}
            </div>
          </form>
          {!canFind && canReplace && <button onClick={doReset}>start over</button>}
        </div>

        <div className="column">
          <ResultsHeader
            isPreview={previewReplace}
            isReplaced={isReplaced}
          />
          {isLoading && <Loading />}
          <div>
            {showResults && (
              <Posts isPreview={previewReplace} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Replacer;
