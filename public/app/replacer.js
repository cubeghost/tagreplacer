var React = require('react');

require('whatwg-fetch');


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
      blog: 'tagreplacertest' ,//this.props.blogs[0].name || undefined,
      find: undefined,
      replace: undefined,
      posts: [],
      replaced: []
    }
  },

  // handlers

  handleInput: function(event) {
    var state = this.state;
    if (event.target.type === 'checkbox') {
      state[event.target.name] = event.target.checked;
    } else if (event.target.type === 'text') {
      state[event.target.name] = event.target.value;
    }
    this.setState(state);
  },

  handleSelect: function(event) {
    this.setState({
      blog: event.target.value
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

      fetch('/api/posts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blog: this.state.blog,
          tag: this.state.find
        })
      }).then(function(response){
        if (!response.ok) { throw Error(response.statusText); }
        return response.json();
      }).then(function(json){
        if (json.posts.length > 0) {
          this.setState({
            loading: false,
            posts: json.posts
          }, function() {
            this.refs.replaceInput.focus();
          }.bind(this));
        } else {
          this.setState({
            loading: false,
            error: 'didnt find any posts with that tag'
          });
        }
      }.bind(this)).catch(function(error){
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

      fetch('/api/replace', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blog: this.state.blog,
          find: this.state.find,
          replace: this.state.replace
        })
      }).then(function(response){
        if (!response.ok) { throw Error(response.statusText); }
        return response.json();
      }).then(function(json){
        this.setState({
          loading: false,
          replaced: json
        });
      }.bind(this)).catch(function(error){
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
      find: undefined,
      replace: undefined,
      posts: []
    });

  },

  // render

  renderBlogs: function() {
    if (this.props.blogs) {
      var options = this.props.blogs.map(function(blog){
        var key = 'option-blog-' + blog.name;
        return (<option key={key} value={blog.name}>{blog.name}</option>);
      });
      return (<select value={this.state.blog} onChange={this.handleSelect}>{options}</select>);
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
      {this.state.loading ? <img src="https://media.giphy.com/media/l3fQv3YSQZwlTTbC8/200.gif" width="100" /> : null}
      {this.state.error}

      <h2>blog</h2>
      <form className={blogClassNames}>
        {this.renderBlogs()}
      </form>

      <h2>find</h2>
      <form className={findClassNames} onSubmit={this.find}>
        <input type="text" name="find" value={this.state.find || ''} onChange={this.handleInput} />
        <button type="submit" className="find" onClick={this.find}>find</button>
      </form>

      {foundPosts ? ('found ' + this.state.posts.length + ' posts tagged ' + this.state.find) : null}
      {foundPosts ? <a className="edit" onClick={this.reset}>find a different tag?</a> : null}

      <h2>replace</h2>
      <form className={replaceClassNames} onSubmit={this.replace}>
        <p>replace {this.state.find ? ('#' + this.state.find) : 'tag'} with</p>
        <input type="text" name="replace" value={this.state.replace || ''} onChange={this.handleInput} ref="replaceInput" />
        <button type="submit" className="replace" onClick={this.replace}>replace</button>
      </form>

      {this.state.replaced.length > 0 ? ('replaced #' + this.state.find + ' with #' + this.state.replace + ' for ' + this.state.replaced.length + ' posts') : null }

    </div>);
  }

});

module.exports = Replacer;
