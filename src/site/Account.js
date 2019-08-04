import React, { Component } from 'react';
import { compose } from 'recompose';

import { PasswordForgetForm } from './PasswordForget';
import { PasswordChangeForm } from './PasswordChange';
import { AuthUserContext, withAuthorization } from './Session';

class AccountPageBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      slides: [],
    };
  }

  render() {
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <h2>Account Page</h2>
            <p>Account: {authUser.email}</p>
            <hr />
            <PasswordForgetForm />
            <hr />
            <PasswordChangeForm />
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}


const condition = authUser => !!authUser;

const AccountPage = compose(
  withAuthorization(condition),
)(AccountPageBase);

export default AccountPage;
