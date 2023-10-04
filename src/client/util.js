export const mapForSelect = value => ({ label: value, value: value });

export const formatTags = (tags) => {
  if (tags.length === 0) {
    return 'tag';
  } else {
    return '#' + tags.join(', #');
  }
};

export const joinReactNodes = (nodes, separator) =>
  nodes
    .reduce((previousValue, currentValue) => {
      return [...previousValue, currentValue, separator];
    }, [])
    .slice(0, -1);

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
