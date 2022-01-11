const initialState = {
  tumblr: {
    username: undefined,
    blogs: [],
    find: [],
    posts: undefined,
    queued: undefined,
    drafts: undefined,
    replaced: undefined,
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
    allowDelete: false,
  },
  errors: [],
  loading: false,
};

export default initialState;
