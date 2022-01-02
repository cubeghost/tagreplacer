import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import { setOption } from './state/actions';

import Checkbox from './components/CheckboxInput';

/* eslint-disable react/no-multi-comp */
// Google Material icon 'tune'
const OptionsIcon = () => (
  <svg
    height="24"
    width="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Options</title>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
  </svg>
);

const Options = () => {
  const dispatch = useDispatch();
  const {
    includeQueue,
    includeDrafts,
    caseSensitive,
    allowDelete,
  } = useSelector(state => state.options, shallowEqual);

  const [isOpen, setOpen] = useState(false);

  const toggleOpen = useCallback(() => setOpen(s => !s), []);
  const onChange = useCallback((event) => (
    dispatch(setOption(event.target.name, event.target.checked))
  ), [dispatch]);

  return (
    <div className="options">
      <button
        title={isOpen ? 'Hide options' : 'Show options'}
        onClick={toggleOpen}
        className="toggleOptions"
      >
        <OptionsIcon />
      </button>
      {isOpen && (
        <div className="optionsForm">
          <Checkbox
            name="includeQueue"
            label="Include queued posts"
            value={includeQueue}
            onChange={onChange}
          />
          <Checkbox
            name="includeDrafts"
            label="Include drafted posts"
            value={includeDrafts}
            onChange={onChange}
          />
          <Checkbox
            name="caseSensitive"
            label="Case sensitive"
            value={caseSensitive}
            onChange={onChange}
          />
          <Checkbox
            name="allowDelete"
            label="Allow deleting tags"
            value={allowDelete}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(Options);
