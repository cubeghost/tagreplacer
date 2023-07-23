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
import { find as findPosts, nextStep, replace as replacePosts, reset } from '../state/actions';
import { useStep, useCan } from '../steps';

const Replacer = () => {
  const dispatch = useDispatch();

  const blogContainerRef = useRef();
  const findContainerRef = useRef();
  const replaceContainerRef = useRef();

  const step = useStep();

  const canFind = useCan('find');
  const canReplace = useCan('replace');
  const canOptions = useCan('options');
  const canNext = useCan('next');
  console.log('step', step)
  const isPreviewing = step.key === 'replace';
  const isReplaced = step.key === 'replaced';

  // const { blog, find, replace } = useSelector(state => state.form);

  const isLoading = useSelector(state => state.posts.loading);
  const [showOptions, setShowOptions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  // const [canFind, setCanFind] = useState(true);
  // const [canReplace, setCanReplace] = useState(false);
  // const [previewReplace, setPreviewReplace] = useState(false);
  // const [isReplaced, setIsReplaced] = useState(false);

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

    // setCanFind(false);
    // setCanReplace(true);
    setShowResults(true);
  }, []);

  const doPreview = useCallback(async () => {
    await dispatch(nextStep());
  }, []);

  const doReplace = useCallback(async () => {
    // setPreviewReplace(false);
    // setCanReplace(false);
    
    await dispatch(replacePosts());

    // setIsReplaced(true);
  }, []);

  const doReset = useCallback(() => {
    dispatch(reset());
    // setPreviewReplace(false);
    // setCanFind(true);
    // setCanReplace(false);
  }, []);

  return (
    <main>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div className="column sticky" style={{ paddingRight: "1.5rem" }}>
          <form
            className="section"
            ref={blogContainerRef}
            disabled={!canOptions}
            onSubmit={preventFormSubmit}
          >
            <div className="row form-row">
              <div className="field">
                <label htmlFor="blog">blog</label>
                <BlogSelect disabled={!canOptions} />
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
          {showOptions && <Options disabled={!canOptions} />}
          <Connector
            startRef={blogContainerRef}
            endRef={findContainerRef}
            side="left"
            setDrawRef={setDrawConnectorRef}
          />
          <form
            disabled={!canFind}
            ref={findContainerRef}
            onSubmit={preventFormSubmit}
          >
            <fieldset className={clsx(
              "section",
              canFind ? "section-enabled" : "section-disabled"
            )}>
              <legend><label htmlFor="find">find</label></legend>
              <TagInput name="find" disabled={!canFind} />
              <button onClick={doFind} disabled={canFind && !canNext}>
                go
                <img
                  src="https://unpkg.com/pixelarticons@latest/svg/search.svg"
                  height="12"
                  alt="find"
                />
              </button>

            </fieldset>
          </form>
          <Connector
            startRef={findContainerRef}
            endRef={replaceContainerRef}
            side="right"
            disabled={!canReplace}
            setDrawRef={setDrawConnectorRef}
          />
          <form
            disabled={!canReplace}
            ref={replaceContainerRef}
            onSubmit={preventFormSubmit}
          >
            <fieldset 
              className={clsx(
                "section",
                canReplace ? "section-enabled" : "section-disabled"
              )} 
              style={{ opacity: canReplace ? 1 : 0.25 }}
            >
              <legend><label htmlFor="replace">replace</label></legend>
              <TagInput name="replace" disabled={!canReplace} />
              <button onClick={doPreview} disabled={canReplace && !canNext}>
                {isPreviewing ? "cancel" : "preview"}
              </button>
              {isPreviewing && (
                <button onClick={doReplace} disabled={canReplace && !canNext}>replace</button>
              )}
            </fieldset>
          </form>
          {step.index > 0 && <button onClick={doReset}>start over</button>}
        </div>

        <div className="column">
          <ResultsHeader
            isPreview={isPreviewing}
            isReplaced={isReplaced}
          />
          {isLoading && <Loading />}
          <div>
            {showResults && (
              <Posts isPreview={isPreviewing} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Replacer;
