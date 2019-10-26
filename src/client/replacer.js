import React, { Component } from 'react';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { flow, values, map, sum } from 'lodash/fp';

import Options from './options';
import Results from './components/results';
import TagInput from './components/tagInput';
import BlogSelect from './components/blogSelect';

import { find, replace, reset } from './state/actions';

const LOADING = 'https://media.giphy.com/media/l3fQv3YSQZwlTTbC8/200.gif';

const mapStateToProps = state => ({
  blogs: state.tumblr.blogs,
  options: state.options,
  blog: state.form.blog,
  find: state.form.find,
  replace: state.form.replace,
  foundPosts: (
    state.tumblr.posts.length > 0 ||
    state.tumblr.queued.length > 0 ||
    state.tumblr.drafts.length > 0
  ),
  loading: state.loading,
});

const mapDispatchToProps = {
  dispatchFind: find,
  dispatchReplace: replace,
  dispatchReset: reset,
};

class Replacer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: undefined,
      posts: [],
      queued: [],
      drafts: [],
      replaced: [],
    };

    this.inputs = {};

    autobind(this);
  }

  // helpers

  mapForSelect(value) {
    return { label: value, value: value };
  }

  formatTags(tags) {
    if (tags.length === 0) {
      return 'tag';
    } else {
      return '#' + tags.join(', #');
    }
  }

  find(event) {
    if (event) {
      event.preventDefault();
    }

    this.props.dispatchFind()
      .then(() => {
        this.inputs.replace.select.focus();
      });
  }

  replace(event) {
    if (event) {
      event.preventDefault();
    }

    this.props.dispatchReplace()
      .then(action => {
        this.setState({
          replaced: action.response,
        });
      });
  }

  reset(event) {
    if (event) {
      event.preventDefault();
    }

    this.props.dispatchReset();

    this.setState({
      replaced: {},
    });
  }

  // render

  renderReplaced() {
    const { find, replace, options } = this.props;
    const { replaced } = this.state;
    const totalReplaced = flow([
      values,
      map('length'),
      sum,
    ])(replaced);
    console.log({totalReplaced})

    if (totalReplaced === 0) return;

    if (replace.length === 0 && options.allowDelete) {
      return (
        <h2>
          deleted {this.formatTags(find)} for {totalReplaced} posts
        </h2>
      );
    } else {
      return (
        <h2>
          replaced {this.formatTags(find)} with&nbsp;
          {this.formatTags(replace)} for&nbsp;
          {totalReplaced} posts
        </h2>
      );
    }
  }

  renderReset() {
    if (this.props.foundPosts) {
      return (
        <button className="reset" onClick={this.reset}>
          reset
        </button>
      );
    }
  }

  render() {
    const { loading, foundPosts, options, blog, find, replace } = this.props;

    const disableBlog = !!foundPosts;
    const disableFind = !blog || !!foundPosts;
    const disableReplace = !foundPosts;

    const disableFindButton = find.length === 0 || disableFind;
    const disableReplaceButton = replace.length === 0 && !options.allowDelete;
    const deleteMode = replace.length === 0 && options.allowDelete;

    return (
      <div className="replacer">
        {loading && (
          <div className="loading">
            <p>loading</p>
            <img src={LOADING} width="100" />
          </div>
        )}

        <div className="form">
          <Options />

          <form className={classNames('blog', { disabled: disableBlog })}>
            <label>blog</label>
            <BlogSelect disabled={disableBlog} />
          </form>

          <form className={classNames('find', { disabled: disableFind })} onSubmit={this.find}>
            <label htmlFor="find">find tag</label>
            <TagInput
              name="find"
              disabled={disableFind}
              setRef={ref => {
                this.inputs.find = ref;
              }}
            />
            <button
              type="submit"
              className="find"
              onClick={this.find}
              disabled={disableFindButton}
            >
              find
            </button>
          </form>

          <form className={classNames('replace', { disabled: disableReplace })} onSubmit={this.replace}>
            <label htmlFor="replace">
              {deleteMode ? 'delete' : 'replace'}&nbsp;
              {this.formatTags(this.props.find)}&nbsp;
              {deleteMode ? 'or replace with' : 'with'}
            </label>
            <TagInput
              name="replace"
              disabled={disableReplace}
              setRef={ref => {
                this.inputs.replace = ref;
              }}
            />
            <button
              type="submit"
              className="replace"
              onClick={this.replace}
              disabled={disableReplace || disableReplaceButton}
            >
              {deleteMode ? 'delete' : 'replace'}
            </button>
          </form>
        </div>

        <div className="result">
          {foundPosts && (
            <div>
              {this.renderReplaced()}
              {this.renderReset()}
            </div>
          )}
          <Results name="posts" />
          {options.includeQueue && <Results name="queued" />}
          {options.includeDrafts && <Results name="drafts" />}
        </div>
      </div>
    );
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Replacer);
