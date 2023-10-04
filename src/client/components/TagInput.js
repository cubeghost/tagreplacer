import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import Creatable from 'react-select/creatable';

import { selectStyles, selectTheme } from './Select';
import { setFormValue } from '../state/actions';
import { mapForSelect } from '../util';

const valueRenderer = value => `#${value.label}`;
const noOptionsMessage = () => 'type to add a tag';
const formatCreateLabel = label => `add #${label}`;
const arrowRenderer = () => null;

const TagInput = ({ name, disabled, setRef }) => {
  const dispatch = useDispatch();
  const value = useSelector(state => state.form[name].map(mapForSelect));

  const onChange = useCallback((value) => {
    dispatch(setFormValue(
      name,
      value.map(v => v.value)
    ));
  }, [dispatch, name]);

  return (
    <Creatable
      ref={setRef}
      id={name}
      isMulti={true}
      value={value}
      onChange={onChange}
      valueRenderer={valueRenderer}
      isDisabled={disabled}
      placeholder=""
      noOptionsMessage={noOptionsMessage}
      formatCreateLabel={formatCreateLabel}
      arrowRenderer={arrowRenderer}
      isClearable={false}
      theme={selectTheme}
      styles={selectStyles}
    />
  );
}

TagInput.propTypes = {
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  setRef: PropTypes.func,
};

export default React.memo(TagInput);
