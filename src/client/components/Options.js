import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { setOption } from '../state/actions';

import Checkbox from './CheckboxInput';

const Options = ({ disabled }) => {
  const dispatch = useDispatch();
  const {
    includeQueue,
    includeDrafts,
    caseSensitive,
    allowDelete,
  } = useSelector(state => state.options);

  const onChange = useCallback((event) => (
    dispatch(setOption(event.target.name, event.target.checked))
  ), [dispatch]);

  return (
    <fieldset className="section" disabled={disabled}>
      <legend>options</legend>
      <Checkbox
        name="includeQueue"
        label="include queued posts"
        value={includeQueue}
        onChange={onChange}
      />
      <Checkbox
        name="includeDrafts"
        label="include drafted posts"
        value={includeDrafts}
        onChange={onChange}
      />
      <Checkbox
        name="caseSensitive"
        label="case-sensitive"
        value={caseSensitive}
        onChange={onChange}
      />
      <Checkbox
        name="allowDelete"
        label="allow deleting tags"
        value={allowDelete}
        onChange={onChange}
      />
    </fieldset>
  );
};

export default React.memo(Options);
