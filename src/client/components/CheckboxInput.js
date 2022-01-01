import React from 'react';
import PropTypes from 'prop-types';

const CheckboxInput = ({ name, label, value, onChange }) => {
  const id = `checkbox-${name}`;

  return (
    <div className="field checkboxField">
      <input
        type="checkbox"
        name={name}
        id={id}
        checked={value}
        onChange={onChange}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

CheckboxInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(CheckboxInput);
