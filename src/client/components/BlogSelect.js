import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';

import { setFormValue } from '../state/actions';


const mapStateToProps = (state) => ({
  blogs: state.tumblr.blogs,
  value: state.form.blog,
});

const mapDispatchToProps = dispatch => ({
  setFormValue: select => dispatch(setFormValue('blog', select.value)),
});

const BlogSelect = ({ id, blogs, value, disabled, setFormValue }) => {
  return (
    <Select
      id={id}
      value={{ value: value, label: value }}
      options={blogs.map(blog => ({
        label: blog.name,
        value: blog.name,
      }))}
      onChange={setFormValue}
      isDisabled={disabled}
      isClearable={false}
      className="react-select _specific"
      classNamePrefix="react-select"
      blurInputOnSelect
    />
  );
};

BlogSelect.propTypes = {
  value: PropTypes.string,
  disabled: PropTypes.bool,
};

export default connect(mapStateToProps, mapDispatchToProps)(BlogSelect);
