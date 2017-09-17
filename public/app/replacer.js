require('whatwg-fetch');

var React = require('react');
var createReactClass = require('create-react-class');
var _ = require('lodash');
var { MultiSelect, SimpleSelect } = require('./react-selectize');

var Options = require('./options');
var { apiFetch, mapForSelectize, labelFromSelectize } = require('./util');


var LOADING = 'https://media.giphy.com/media/l3fQv3YSQZwlTTbC8/200.gif';

function notempty(value) {
  if (value !== null && value !== undefined && /\S/.test(value)) {
    return true;
  } else {
    return false;
  }
}

var DEFAULT_BLOG = process.env.NODE_ENV === 'development' ? process.env.TESTING_BLOG : undefined;

var Replacer = createReactClass({

  getInitialState: function() {
    return {
      loading: false,
      error: undefined,
      options: {
        includeQueue: false,
        includeDrafts: false
      },
      blog: DEFAULT_BLOG || this.props.blogs[0].name || undefined,
      find: [],
      replace: [],
      posts: [],
      queued: [],
      drafts: [],
      replaced: []
    }
  },

  // helpers

  mapForSelectize: function(value) {
    return { label: value, value: value };
  },

  labelFromSelectize: function(value) {
    return value.label;
  },

  formatTags: function(tags) {
    return '#' + tags.join(', #');
  },

  // handlers

  handleSelect: function(input, value) {
    var state = {};
    state[input] = value;
    this.setState(state, function() {
      this.refs[input].blur();
      if (input !== 'blog') {
        this.refs[input].focus();
      }
    }.bind(this));
  },

  removeTag: function(event) {
    var state = this.state;
    var input = event.target.dataset.input;
    var tags = _.without(this.state[input], event.target.dataset.tag);
    state[input] = tags;
    this.setState(state);
  },

  handleOptions: function(event) {
    var options = _.extend({}, this.state.options);
    var field = event.target.dataset.field;

    options[field] = event.target.checked;

    this.setState({
      options: options
    });
  },

  find: function(event) {

    if (event) {
      event.preventDefault();
    }

    if (this.state.loading) {
      return;
    }

    if (notempty(this.state.blog) && notempty(this.state.find)) {

      this.setState({
        loading: true
      });

      apiFetch('POST', '/find', {
        blog: this.state.blog,
        find: this.state.find,
        config: this.state.options
      }).then(function(json){
        if (
          json.posts.length > 0 ||
          json.queued.length > 0 ||
          json.drafts.length > 0
        ) {
          this.setState({
            loading: false,
            error: undefined,
            posts: json.posts,
            queued: json.queued,
            drafts: json.drafts
          }, function() {
            this.refs.replace.focus();
          }.bind(this));
        } else {
          this.setState({
            loading: false,
            error: 'didn\'t find any posts tagged ' + this.formatTags(this.state.find)
          });
        }
      }.bind(this))
      .catch(function(error){
        this.setState({
          loading: false,
          error: error.message
        });
      }.bind(this));

    } else {

      this.setState({
        error: 'blog and tag to find are required'
      });

    }

  },

  replace: function(event) {

    if (event) {
      event.preventDefault();
    }

    if (this.state.loading) {
      return;
    }

    if (notempty(this.state.blog) && notempty(this.state.find) && notempty(this.state.replace)) {

      this.setState({
        loading: true
      });

      apiFetch('POST', '/replace', {
        blog: this.state.blog,
        find: this.state.find,
        replace: this.state.replace,
        config: this.state.options
      }).then(function(json){
        this.setState({
          loading: false,
          error: undefined,
          replaced: json
        });
      }.bind(this))
      .catch(function(error){
        this.setState({
          loading: false,
          error: error.message
        });
      }.bind(this));

    } else {

      this.setState({
        error: 'blog, tag to find, and tag to replace are required'
      });

    }

  },

  reset: function(event) {
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
      replaced: []
    });

  },

  // render

  renderBlogs: function() {
    if (this.props.blogs) {
      return (<SimpleSelect
        ref="blog"
        value={{ label: this.state.blog, value: this.state.blog }}
        options={this.props.blogs.map(function(blog) {
          return { label: blog.name, value: blog.name }
        })}
        onValueChange={function(select) {
          this.handleSelect('blog', select.value);
        }.bind(this)}
      />);
    }
  },

  renderMultiSelect: function(input, parentClassNames) {
    return (<MultiSelect
      values={this.state[input].map(this.mapForSelectize)}
      disabled={parentClassNames.indexOf('disabled') > -1}
      delimiters={[188]}
      ref={input}
      createFromSearch={function(options, tags, search) {
        var labels = tags.map(this.labelFromSelectize);
        if (search.trim().length === 0 || labels.indexOf(search.trim()) !== -1) {
          return null;
        }
        return { label: search.trim(), value: search.trim() };
      }.bind(this)}
      valuesFromPaste={function(options, tags, pastedText){
        return pastedText.split(',')
        .filter(function(text){
          var labels = tags.map(this.labelFromSelectize);
          return labels.indexOf(text) === -1;
        }).map(this.mapForSelectize);
      }.bind(this)}
      renderValue={function(tag) {
        return (<div className="select-tag">
          <span>#{tag.label}</span>
          <span className="delete" onClick={this.removeTag} data-tag={tag.label} data-input={input}>&times;</span>
        </div>);
      }.bind(this)}
      renderOption={function(tag) {
        return (<div className="simple-option">
          <div>{!!tag.newOption ? "add #" + tag.label : tag.label}</div>
        </div>);
      }}
      renderNoResultsFound={function(tags, search) {
        if (search.trim().length === 0) {
          return null;
        } else if (tags.map(this.labelFromSelectize).indexOf(search.trim()) != -1) {
          <div className="no-results-found">Tag already exists</div>
        }
      }.bind(this)}
      onBlur={function(event) {
        // HAHA WOW
        var search = event.search.trim();
        if (search.length > 0 &&
          (event.values.map(this.labelFromSelectize).indexOf(search) === -1)
        ) {
          var values = event.values.map(this.labelFromSelectize);
          values.push(search);
          this.refs[input].setState({
            search: '',
            anchor: { label: search, value: search }
          });
          this.handleSelect(input, values);
        }
      }.bind(this)}
      onBlurResetsInput={false}
      onValuesChange={function(select) {
        this.handleSelect(input, select.map(this.labelFromSelectize));
      }.bind(this)}
    />)
  },

  renderFound: function(key) {
    if (this.state[key].length > 0) {
      return (<h2>
        found {this.state[key].length}&nbsp;
        {(key === 'queued' ? 'queued posts' : key)} tagged #{this.state.find}
      </h2>);
    }
  },

  renderReplaced: function() {
    if (this.state.replaced.length > 0) {
      return (<div>
        <h2>
          replaced {this.formatTags(this.state.find)}&nbsp;
          with {this.formatTags(this.state.replace)}&nbsp;
          for {this.state.replaced.length} posts
          <br/>
        </h2>
      </div>);
    }
  },

  renderPosts: function() {
    if (this.state.posts.length > 0) {
      return this.state.posts.map(function(post) {
        var key = 'post-' + post.id;
        return (<div className="post" key={key}>
          <a href={post.post_url} target="_blank">{post.id}/{post.slug}</a>
          <span className="tags">{this.formatTags(post.tags)}</span>
        </div>);
      }.bind(this));
    }
  },

  renderQueued: function() {
    if (this.state.queued.length > 0) {
      return this.state.queued.map(function(post) {
        var key = 'post-' + post.id;
        return (<div className="post" key={key}>
          <a href={post.post_url} target="_blank">{post.id}/{post.slug}</a>
          <span className="tags">{this.formatTags(post.tags)}</span>
        </div>);
      }.bind(this));
    }
  },

  renderDrafts: function() {
    if (this.state.drafts.length > 0) {
      return this.state.drafts.map(function(post) {
        var key = 'post-' + post.id;
        return (<div className="post" key={key}>
          <a href={post.post_url} target="_blank">{post.id}/{post.slug}</a>
          <span className="tags">{this.formatTags(post.tags)}</span>
        </div>);
      }.bind(this));
    }
  },

  renderLoadingState: function() {
    if (this.state.loading) {
      return (<div className="loading">
        <p>loading</p>
        <img src={LOADING} width="100" />
      </div>);
    }
  },

  renderReset: function() {
    if (this.state.posts.length || this.state.queued.length || this.state.drafts.length) {
      return (<button className="reset" onClick={this.reset}>find a different tag?</button>);
    }
  },

  renderError: function() {
    if (this.state.error) {
      return (<div className="error">{this.state.error}</div>);
    }
  },

  render: function() {
    var foundPosts = this.state.posts.length > 0 ? true : false;

    // gotta be a better way here
    var blogClassNames = [
      'blog',
      (foundPosts ? 'disabled' : '')
    ].join(' ');
    var findClassNames = [
      'find',
      (this.state.blog ? '' : 'disabled'),
      (foundPosts ? 'disabled' : '')
    ].join(' ');
    var replaceClassNames = [
      'replace',
      (foundPosts ? '' : 'disabled')
    ].join(' ');

    return (<div className="replacer">
      {this.renderLoadingState()}
      {this.renderError()}

      <div className="form">

        <Options options={this.state.options} handleOptions={this.handleOptions} />

        <form className={blogClassNames}>
          <label>blog</label>
          {this.renderBlogs()}
        </form>

        <form className={findClassNames} onSubmit={this.find}>
          <label htmlFor="find">find tag</label>
          {this.renderMultiSelect('find', findClassNames)}
          <button type="submit" className="find" onClick={this.find} disabled={findClassNames.indexOf('disabled') > -1}>find</button>
        </form>

        <form className={replaceClassNames} onSubmit={this.replace}>
          <label htmlFor="replace">replace {this.state.find.length > 0 ? this.formatTags(this.state.find) : 'tag'} with</label>
          {this.renderMultiSelect('replace', replaceClassNames)}
          <button type="submit" className="replace" onClick={this.replace} disabled={replaceClassNames.indexOf('disabled') > -1}>replace</button>
        </form>

      </div>

      <div className="result">
        {this.renderReplaced()}
        {this.renderReset()}
        {this.renderFound('posts')}
        {this.renderPosts()}
        {this.state.options.includeQueue && this.renderFound('queued')}
        {this.state.options.includeQueue && this.renderQueued()}
        {this.state.options.includeDrafts && this.renderFound('drafts')}
        {this.state.options.includeDrafts && this.renderDrafts()}
      </div>


    </div>);
  }

});

module.exports = Replacer;
