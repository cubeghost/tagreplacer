import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';

import { setFormValue } from '../state/actions';

const BlogSelect = ({ disabled }) => {
  const dispatch = useDispatch();
  const blogs = useSelector(state => state.tumblr.blogs);
  const value = useSelector(state => state.form.blog);

  const onChange = useCallback(select => (
    dispatch(setFormValue('blog', select.value))
  ), [dispatch]);

  return (
    <Select
      id="blog"
      value={{ value: value, label: value }}
      options={blogs.map(blog => ({
        label: blog.name,
        value: blog.name,
      }))}
      onChange={onChange}
      isDisabled={disabled}
      isClearable={false}
      className="react-select _specific"
      classNamePrefix="react-select"
      blurInputOnSelect
    />
  );
};

BlogSelect.propTypes = {
  disabled: PropTypes.bool,
};

export default React.memo(BlogSelect);
