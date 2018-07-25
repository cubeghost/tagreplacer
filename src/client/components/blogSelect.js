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

const BlogSelect = ({ blogs, value, disabled, setFormValue }) => {
  return (
    <Select
      value={value}
      options={blogs.map(blog => ({
        label: blog.name,
        value: blog.name,
      }))}
      onChange={setFormValue}
      disabled={disabled}
      clearable={false}
      autoBlur
    />
  );
};

BlogSelect.propTypes = {
  value: PropTypes.string,
  disabled: PropTypes.bool,
};

export default connect(mapStateToProps, mapDispatchToProps)(BlogSelect);
