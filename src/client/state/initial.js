const initialState = {
  tumblr: {
    loading: false,
    username: undefined,
    blogs: [],
  },
  posts: {
    loading: false,
    entities: {},
  },
  form: {
    step: 0,
    blog: undefined,
    find: [],
    replace: [],
  },
  options: {
    includeQueue: false,
    includeDrafts: false,
    caseSensitive: false,
    allowDelete: false,
  },
  errors: [],
};

export default initialState;
