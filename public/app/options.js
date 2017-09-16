var React = require('react');


var Options = React.createClass({

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
      {this.renderField('includeQueue', 'Include queued posts')}
      {this.renderField('includeDrafts', 'Include drafted posts')}
    </div>);
  }

});


module.exports = Options;
