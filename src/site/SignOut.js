import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from './Firebase';
import * as ROUTES from './constants/routes';

class SignOutButton extends Component {
  constructor(props) {
    super(props);
  }

  onSignOut = event => {
    event.preventDefault();

    this.props.firebase.doSignOut().then(() => {
      this.props.history.push(ROUTES.LANDING);
    });
  };

  render() {
    return (
      <button className="Button" type="button" onClick={this.onSignOut}>
        Sign Out
      </button>
    );
  }
}

export default compose(withRouter, withFirebase)(SignOutButton);
