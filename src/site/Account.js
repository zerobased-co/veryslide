import React, { Component } from 'react';
import { compose } from 'recompose';

import { PasswordForgetForm } from './PasswordForget';
import { PasswordChangeForm } from './PasswordChange';
import { TestWriteForm } from './TestWrite';
import { withFirebase } from './Firebase';
import { AuthUserContext, withAuthorization } from './Session';

class AccountPageBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: null,
    };
  }

  componentDidMount() {
    var docRef = this.props.firebase.currentUser();

    docRef.get().then(doc => {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        this.setState({value: doc.data().value });
      } else {
        console.log("No such document!");
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
  }

  render() {
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <h2>Account Page</h2>
            <p>Account: {authUser.email}</p>
            <p>Value: {this.state.value}</p>
            <TestWriteForm />
            <hr />
            <PasswordForgetForm />
            <PasswordChangeForm />
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}


const condition = authUser => !!authUser;

const AccountPage = compose(
  withFirebase,
  withAuthorization(condition),
)(AccountPageBase);

export default AccountPage;
