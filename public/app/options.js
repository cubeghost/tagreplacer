var React = require('react');
var createReactClass = require('create-react-class');

// google material icon 'tune'
const optionsIcon = (<svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <title>Options</title>
  <path d="M0 0h24v24H0z" fill="none"/>
  <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
</svg>);


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

    return (<div className="field checkboxField">
      <input
        type="checkbox"
        checked={!!this.props.options[field]}
        id={id}
        data-field={field}
        onChange={this.props.handleOptions}
      />
      <label htmlFor={id}>{label}</label>
    </div>);
  },

  render: function() {
    var buttonTitle = this.state.open ? 'Hide options' : 'Show options';

    return (<div className="options">
      <button title={buttonTitle} onClick={this.toggleOptions} className="toggleOptions" ref="toggleOptions">
        {optionsIcon}
      </button>
      {this.state.open && (<div className="optionsForm">
        {this.renderField('includeQueue', 'Include queued posts')}
        {this.renderField('includeDrafts', 'Include drafted posts')}
      </div>)}
    </div>);
  }

});


module.exports = Options;
