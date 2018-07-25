import React, { Component } from 'react';
import autobind from 'class-autobind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Creatable } from 'react-select';

import { setFormValue } from '../state/actions';
import { mapForSelect } from '../util';

const mapStateToProps = (state, ownProps) => ({
  value: state.form[ownProps.name].map(mapForSelect)
});

const mapDispatchToProps = {
  setFormValue: setFormValue,
};

class TagInput extends Component {

  constructor(props) {
    super(props);
    autobind(this);
  }

  onChange(value) {
    this.props.setFormValue(
      this.props.name,
      value.map(v => v.value)
    );
  }

  render() {
    const { value, disabled, setRef } = this.props;

    return (
      <Creatable
        ref={setRef}
        multi={true}
        value={value}
        onChange={this.onChange}
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
  name: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  disabled: PropTypes.bool,
  setRef: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(TagInput);
