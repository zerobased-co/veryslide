import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { SignUpLink } from './SignUp';
import { PasswordForgetLink } from './PasswordForget';
import { withFirebase } from './Firebase';
import * as ROUTES from './constants/routes';

const SignInPage = () => (
  <div className="Center">
    <div>
      <h2>SignIn</h2>
      <SignInForm />
      <hr />
      <PasswordForgetLink />
      <SignUpLink />
    </div>
  </div>
);

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};

class SignInFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { email, password } = this.state;

    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, password, error } = this.state;

    const isInvalid = password === '' || email === '';

    return (
      <div>
        {error && <p className="Label Error">{error.message}</p>}
        <form onSubmit={this.onSubmit}>
          <div className="InputGroup">
            <i className="fas fa-envelope"/>
            <input name="email" value={email} onChange={this.onChange} type="text" placeholder="Email Address" required />
          </div>
          <div className="InputGroup">
            <i className="fas fa-key"/>
            <input name="password" value={password} onChange={this.onChange} type="password" placeholder="Password" required />
          </div>
          <button className="Primary" disabled={isInvalid} type="submit">
            Sign In
          </button>
        </form>
      </div>
    );
  }
}

const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);

const SignInLink = () => (
  <p>
    Already have an account? <Link to={ROUTES.SIGNIN}>Sign in</Link>.
  </p>
);

export default SignInPage;

export { SignInForm, SignInLink };
