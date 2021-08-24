import React, { Component } from 'react';
import autobind from 'class-autobind';
import { connect } from 'react-redux';

import { setOption } from './state/actions';

import Checkbox from './components/CheckboxInput';

// google material icon 'tune'
const optionsIcon = (
  <svg
    height="24"
    width="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Options</title>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
  </svg>
);

const mapStateToProps = state => ({
  options: state.options,
});

const mapDispatchToProps = dispatch => ({
  setOption: (key, value) => dispatch(setOption(key, value)),
});

class Options extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };

    autobind(this);
  }

  toggle() {
    this.setState((prevState) => ({ open: !prevState.open }));
  }

  onChange(event) {
    this.props.setOption(event.target.name, event.target.checked);
  }

  render() {
    const { options } = this.props;
    const buttonTitle = this.state.open ? 'Hide options' : 'Show options';


    return (
      <div className="options">
        <button
          title={buttonTitle}
          onClick={this.toggle}
          className="toggleOptions"
          ref="toggleOptions"
        >
          {optionsIcon}
        </button>
        {this.state.open && (
          <div className="optionsForm">
            <Checkbox
              name="includeQueue"
              label="Include queued posts"
              value={options.includeQueue}
              onChange={this.onChange}
            />
            <Checkbox
              name="includeDrafts"
              label="Include drafted posts"
              value={options.includeDrafts}
              onChange={this.onChange}
            />
            <Checkbox
              name="caseSensitive"
              label="Case sensitive"
              value={options.caseSensitive}
              onChange={this.onChange}
            />
            <Checkbox
              name="allowDelete"
              label="Allow deleting tags"
              value={options.allowDelete}
              onChange={this.onChange}
            />
          </div>
        )}
      </div>
    );
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Options);
