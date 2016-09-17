var React = require('react');
var _ = require('lodash');
var { MultiSelect, SimpleSelect } = require('./react-selectize');

require('whatwg-fetch');

var { apiFetch, mapForSelectize, labelFromSelectize } = require('./util');


var LOADING = 'https://media.giphy.com/media/l3fQv3YSQZwlTTbC8/200.gif';

function notempty(value) {
  if (value !== null && value !== undefined && /\S/.test(value)) {
    return true;
  } else {
    return false;
  }
}


var Replacer = React.createClass({

  getInitialState: function() {
    return {
      loading: false,
      error: undefined,
      blog: this.props.blogs[0].name || undefined,
      find: [],
      replace: [],
      posts: [],
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
        find: this.state.find
      }).then(function(json){
        if (json.posts.length > 0) {
          this.setState({
            loading: false,
            error: undefined,
            posts: json.posts
          }, function() {
            this.refs.replace.focus();
          }.bind(this));
        } else {
          this.setState({
            loading: false,
            error: 'didnt find any posts tagged #' + this.state.find.join(', #')
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
        replace: this.state.replace
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

  renderMultiSelect: function(input) {
    return (<MultiSelect
      values={this.state[input].map(this.mapForSelectize)}
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

  renderFound: function() {
    if (this.state.posts.length > 0) {
      return <p>found {this.state.posts.length} posts tagged {this.state.find}</p>
    }
  },

  renderReplaced: function() {
    if (this.state.replaced.length > 0) {
      return <p>replaced {this.state.find} with {this.state.replace} for {this.state.replaced.length} posts</p>
    }
  },

  renderPosts: function() {
    if (this.state.posts.length > 0 /*&& viewPOsts == true*/) {
      return this.state.posts.map(function(post) {
        var key = 'post-' + post.id;
        return (<div className="post" key={key}>
          <a href={post.post_url} target="_blank">/{post.id}/{post.slug}</a>
          <span>#{post.tags.join(', #')}</span>
        </div>);
      });
    }
  },

  renderReset: function() {
    if (this.state.posts.length > 0) {
      return (<div><button className="reset" onClick={this.reset}>find a different tag?</button></div>);
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
      {this.state.loading ? 'loading' : null}
      {this.state.loading ? <img src={LOADING} width="100" /> : null}
      {this.state.error}

      <form className={blogClassNames}>
        <label>blog</label>
        {this.renderBlogs()}
      </form>

      <form className={findClassNames} onSubmit={this.find}>
        <label htmlFor="find">find tag</label>
        {this.renderMultiSelect('find')}
        <button type="submit" className="find" onClick={this.find}>find</button>
      </form>

      <form className={replaceClassNames} onSubmit={this.replace}>
        <label htmlFor="replace">replace {this.state.find.length > 0 ? ('#' + this.state.find.join(', #')) : 'tag'} with</label>
        {this.renderMultiSelect('replace')}
        <button type="submit" className="replace" onClick={this.replace}>replace</button>
      </form>

      {this.renderFound()}
      {this.renderPosts()}
      {this.renderReplaced()}
      {this.renderReset()}
    </div>);
  }

});

module.exports = Replacer;
