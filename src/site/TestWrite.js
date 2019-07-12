import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

import { withFirebase } from './Firebase';
import { AuthUserContext } from './Session';

const TestWrite = () => (
  <div>
    <h2>TestWrite</h2>
    <TestWriteForm />
  </div>
);

const INITIAL_STATE = {
  value: '',
  error: null,
};

class TestWriteFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { value } = this.state;
    event.preventDefault();

    this.props.firebase.currentUser()
      .update({
        value,
      }).then(ref => {
        console.log("Document", ref);
      }).catch(error => {
        this.setState({ error });
      });
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      value,
      error,
    } = this.state;

    const isInvalid =
      value === '';

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <span>Write to {authUser.uid} DB</span>
            <form onSubmit={this.onSubmit}>
              <input
                name="value"
                value={value}
                onChange={this.onChange}
                type="text"
                placeholder="Value Name"
              />
              <button disabled={isInvalid} type="submit">
                Write
              </button>

              {error && <p>{error.message}</p>}
            </form>
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}


const TestWriteForm = withFirebase(TestWriteFormBase);

export { TestWriteForm };
