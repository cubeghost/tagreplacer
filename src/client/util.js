export const mapForSelect = value => ({ label: value, value: value });

export const formatTags = (tags) => {
  if (tags.length === 0) {
    return 'tag';
  } else {
    return '#' + tags.join(', #');
  }
};