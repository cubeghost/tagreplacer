import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import Creatable from 'react-select/creatable';
import { map } from 'lodash/fp';

import { setFormValue } from '../state/actions';
import { mapForSelect } from '../util';

const TagInput = React.forwardRef(({ name, disabled }, ref) => {
  const dispatch = useDispatch();
  const value = useSelector(state => state.form[name].map(mapForSelect));

  const onChange = useCallback((value) => {
    dispatch(setFormValue(name, map('value')(value)));
  });

  return (
    <Creatable
      ref={ref}
      isMulti={true}
      value={value}
      onChange={onChange}
      valueRenderer={v => `#${v.label}`}
      isDisabled={disabled}
      placeholder=""
      noOptionsMessage={() => 'type to add a tag'}
      formatCreateLabel={label => `add #${label}`}
      arrowRenderer={() => null}
      isClearable={false}
      className="react-select _specific"
      classNamePrefix="react-select"
    />
  );
});

TagInput.propTypes = {
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

export default React.memo(TagInput);