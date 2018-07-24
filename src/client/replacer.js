import React, { Component } from 'react';
import autobind from 'class-autobind';
import _ from 'lodash';
import { connect } from 'react-redux';
import classNames from 'classnames';

import Select, { Creatable } from 'react-select';

import Options from './options';
import TagInput from './components/tagInput';
import BlogSelect from './components/blogSelect';

import { apiFetch } from './util';

const LOADING = 'https://media.giphy.com/media/l3fQv3YSQZwlTTbC8/200.gif';

const notempty = value => {
  if (value !== null && value !== undefined && /\S/.test(value)) {
    return true;
  } else {
    return false;
  }
};

const PRODUCTION = process.env.NODE_ENV === 'production';
const DEFAULT_BLOG = PRODUCTION ? undefined : process.env.TESTING_BLOG;

const mapStateToProps = state => ({
  blogs: state.tumblr.blogs,
  options: state.options,
});

const mapDispatchToProps = dispatch => ({
});

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

  // handlers

  handleSelect(input, value) {
    this.setState({
      [input]: _.isArray(value) ? value.map(s => s.value.trim()) : value.trim()
    }, () => {
      if (this.inputs[input]) {
        this.inputs[input].focus();
      }
    });
  }

  handleOptions(event) {
    var options = _.extend({}, this.state.options);
    var field = event.target.dataset.field;

    options[field] = event.target.checked;

    this.setState({
      options: options,
    });
  }

  find(event) {
    if (event) {
      event.preventDefault();
    }

    if (this.state.loading) {
      return;
    }

    if (notempty(this.state.blog) && notempty(this.state.find)) {
      this.setState({
        loading: true,
      });

      apiFetch('POST', '/find', {
        blog: this.state.blog,
        find: this.state.find,
        config: this.state.options,
      })
        .then(
          function(json) {
            if (
              json.posts.length > 0 ||
              json.queued.length > 0 ||
              json.drafts.length > 0
            ) {
              this.setState(
                {
                  loading: false,
                  error: undefined,
                  posts: json.posts,
                  queued: json.queued,
                  drafts: json.drafts,
                },
                function() {
                  this.inputs.replace.focus();
                }.bind(this)
              );
            } else {
              this.setState({
                loading: false,
                error:
                  "didn't find any posts tagged " +
                  this.formatTags(this.state.find),
              });
            }
          }.bind(this)
        )
        .catch(
          function(error) {
            this.setState({
              loading: false,
              error: error.message,
            });
          }.bind(this)
        );
    } else {
      this.setState({
        error: 'blog and tag to find are required',
      });
    }
  }

  replace(event) {
    if (event) {
      event.preventDefault();
    }

    if (this.state.loading) {
      return;
    }

    if (
      notempty(this.state.blog) &&
      notempty(this.state.find) //&&
      // notempty(this.state.replace)
    ) {
      this.setState({
        loading: true,
      });

      apiFetch('POST', '/replace', {
        blog: this.state.blog,
        find: this.state.find,
        replace: this.state.replace,
        config: this.state.options,
      })
        .then(
          function(json) {
            this.setState({
              loading: false,
              error: undefined,
              replaced: json,
            });
          }.bind(this)
        )
        .catch(
          function(error) {
            this.setState({
              loading: false,
              error: error.message,
            });
          }.bind(this)
        );
    } else {
      this.setState({
        error: 'blog, tag to find, and tag to replace are required',
      });
    }
  }

  reset(event) {
    if (event) {
      event.preventDefault();
    }

    this.setState({
      find: [],
      replace: [],
      error: undefined,
      posts: [],
      queued: [],
      drafts: [],
      replaced: [],
    });
  }

  // render

  renderBlogs(blogClassNames) {
    if (this.props.blogs) {
      return (
        <Select
          value={{ label: this.state.blog, value: this.state.blog }}
          options={this.props.blogs.map(blog => ({
            label: blog.name,
            value: blog.name,
          }))}
          onChange={_.partial(this.handleSelect, 'blog')}
          disabled={blogClassNames.indexOf('disabled') > -1}
          clearable={false}
          autoBlur
        />
      );
    }
  }

  renderMultiSelect(input, parentClassNames) {
    return (
      <Creatable
        ref={input}
        multi={true}
        value={this.state[input].map(this.mapForSelect)}
        onChange={_.partial(this.handleSelect, input)}
        valueRenderer={value => `#${value.label}`}
        disabled={parentClassNames.indexOf('disabled') > -1}
        placeholder=""
        noResultsText="type to add a tag"
        promptTextCreator={label => `add #${label}`}
        arrowRenderer={() => null}
        clearable={false}
      />
    );
  }

  renderFound(key) {
    if (this.state[key].length > 0) {
      return (
        <h2>
          found {this.state[key].length}&nbsp;
          {key === 'queued' ? 'queued posts' : key} tagged #{this.state.find}
        </h2>
      );
    }
  }

  renderReplaced() {
    if (this.state.replaced.length > 0) {
      return (
        <div>
          <h2>
            replaced {this.formatTags(this.state.find)}&nbsp; with{' '}
            {this.formatTags(this.state.replace)}&nbsp; for{' '}
            {this.state.replaced.length} posts
            <br />
          </h2>
        </div>
      );
    }
  }

  renderPosts() {
    if (this.state.posts.length > 0) {
      return this.state.posts.map(
        function(post) {
          var key = 'post-' + post.id;
          return (
            <div className="post" key={key}>
              <a href={post.post_url} target="_blank">
                {post.id}/{post.slug}
              </a>
              <span className="tags">{this.formatTags(post.tags)}</span>
            </div>
          );
        }.bind(this)
      );
    }
  }

  renderQueued() {
    if (this.state.queued.length > 0) {
      return this.state.queued.map(
        function(post) {
          var key = 'post-' + post.id;
          return (
            <div className="post" key={key}>
              <a href={post.post_url} target="_blank">
                {post.id}/{post.slug}
              </a>
              <span className="tags">{this.formatTags(post.tags)}</span>
            </div>
          );
        }.bind(this)
      );
    }
  }

  renderDrafts() {
    if (this.state.drafts.length > 0) {
      return this.state.drafts.map(
        function(post) {
          var key = 'post-' + post.id;
          return (
            <div className="post" key={key}>
              <a href={post.post_url} target="_blank">
                {post.id}/{post.slug}
              </a>
              <span className="tags">{this.formatTags(post.tags)}</span>
            </div>
          );
        }.bind(this)
      );
    }
  }

  renderLoadingState() {
    if (this.state.loading) {
      return (
        <div className="loading">
          <p>loading</p>
          <img src={LOADING} width="100" />
        </div>
      );
    }
  }

  renderReset() {
    if (
      this.state.posts.length ||
      this.state.queued.length ||
      this.state.drafts.length
    ) {
      return (
        <button className="reset" onClick={this.reset}>
          find a different tag?
        </button>
      );
    }
  }

  renderError() {
    if (this.state.error) {
      return <div className="error">{this.state.error}</div>;
    }
  }

  render() {
    const { options } = this.props;

    const foundPosts =
      this.state.posts.length > 0 ||
      this.state.queued.length > 0 ||
      this.state.drafts.length > 0;

    const disableBlog = !!foundPosts;
    const disableFind = !this.state.blog || !!foundPosts;
    const disableReplace = !foundPosts;

    return (
      <div className="replacer">
        {this.renderLoadingState()}
        {this.renderError()}

        <div className="form">
          <Options
            options={this.state.options}
            handleOptions={this.handleOptions}
          />

          <form className={classNames('blog', { disabled: disableBlog })}>
            <label>blog</label>
            <BlogSelect
              value={{ value: this.state.blog, label: this.state.blog }}
              disabled={disableBlog}
              onChange={_.partial(this.handleSelect, 'blog')}
            />
          </form>

          <form className={classNames('find', { disabled: disableFind })} onSubmit={this.find}>
            <label htmlFor="find">find tag</label>
            <TagInput
              name="find"
              value={this.state.find.map(this.mapForSelect)}
              disabled={disableFind}
              onChange={this.handleSelect}
              setRef={ref => {
                this.inputs.find = ref;
              }}
            />
            <button
              type="submit"
              className="find"
              onClick={this.find}
              disabled={disableFind}
            >
              find
            </button>
          </form>

          <form className={classNames('replace', { disabled: disableReplace })} onSubmit={this.replace}>
            <label htmlFor="replace">
              replace {this.formatTags(this.state.find)} with
            </label>
            <TagInput
              name="replace"
              value={this.state.replace.map(this.mapForSelect)}
              disabled={disableReplace}
              onChange={this.handleSelect}
              setRef={ref => {
                this.inputs.replace = ref;
              }}
            />
            <button
              type="submit"
              className="replace"
              onClick={this.replace}
              disabled={disableReplace}
            >
              replace
            </button>
          </form>
          {/* <p className="delete-option">
            or <a href="#">delete {this.formatTags(this.state.find)}</a>
          </p> */}
        </div>

        <div className="result">
          {this.renderReplaced()}
          {this.renderReset()}
          {this.renderFound('posts')}
          {this.renderPosts()}
          {options.includeQueue && this.renderFound('queued')}
          {options.includeQueue && this.renderQueued()}
          {options.includeDrafts && this.renderFound('drafts')}
          {options.includeDrafts && this.renderDrafts()}
        </div>
      </div>
    );
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Replacer);
