import React, { Component } from 'react';

import SignOutButton from './SignOut';
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
            <h3>Change Password</h3>
            <PasswordChangeForm />
            <hr />
            <SignOutButton />
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}


const condition = authUser => !!authUser;

const AccountPage = withAuthorization(condition)(AccountPageBase);

export default AccountPage;
