import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';

const mapStateToProps = (state) => ({
  blogs: state.tumblr.blogs,
});

const BlogSelect = ({ blogs, value, disabled, onChange }) => {
  return (
    <Select
      value={value}
      options={blogs.map(blog => ({
        label: blog.name,
        value: blog.name,
      }))}
      onChange={onChange}
      disabled={disabled}
      clearable={false}
      autoBlur
    />
  );
};

BlogSelect.propTypes = {
  value: PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  }),
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(BlogSelect);
