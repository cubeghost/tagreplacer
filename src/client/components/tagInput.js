import React, { Component } from 'react';
import autobind from 'class-autobind';
import PropTypes from 'prop-types';

import { Creatable } from 'react-select';


class TagInput extends Component {

  constructor(props) {
    super(props);
    autobind(this);
  }

  handleSelect(select) {
    this.props.onChange(this.props.name, select);
  }

  render() {
    const { value, disabled, setRef } = this.props;

    return (
      <Creatable
        ref={setRef}
        multi={true}
        value={value}
        onChange={this.handleSelect}
        valueRenderer={value => `#${value.label}`}
        disabled={disabled}
        placeholder=""
        noResultsText="type to add a tag"
        promptTextCreator={label => `add #${label}`}
        arrowRenderer={() => null}
        clearable={false}
      />
    );
  }

}

TagInput.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  setRef: PropTypes.func,
};

export default TagInput;
