const initialState = {
  tumblr: {
    username: undefined,
    blogs: [],
    posts: [],
    queued: [],
    drafts: [],
  },
  form: {
    blog: undefined,
    find: [],
    replace: [],
  },
  options: {
    includeQueue: false,
    includeDrafts: false,
    caseSensitive: false,
  },
  errors: [],
  loading: false,
};

export default initialState;
