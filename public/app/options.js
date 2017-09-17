var React = require('react');
var createReactClass = require('create-react-class');

var Options = createReactClass({

  getInitialState: function() {
    return {
      open: false
    }
  },

  toggleOptions: function() {
    this.setState(function(prevState) {
      return { open: !prevState.open }
    });
  },

  renderField: function(field, label) {
    var id = 'options-' + field;

    return (<div>
      <label htmlFor={id}>{label}</label>
      <input
        type="checkbox"
        checked={!!this.props.options[field]}
        id={id}
        data-field={field}
        onChange={this.props.handleOptions}
      />
    </div>);
  },

  render: function() {
    return (<div className="options">
      <button onClick={this.toggleOptions} className="toggleOptions">
        options
      </button>
      {this.state.open && (<div className="optionsForm">
        {this.renderField('includeQueue', 'Include queued posts')}
        {this.renderField('includeDrafts', 'Include drafted posts')}
      </div>)}
    </div>);
  }

});


module.exports = Options;
