import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons'

import { withFirebase } from './Firebase';
import * as ROUTES from './constants/routes';

const SignUpPage = () => (
  <div className="Center">
    <div>
      <h2>Welcome to Veryslide!</h2>
      <p>Create an account and bake your ideas into awesome slides.</p>
      <SignUpForm />
    </div>
  </div>
);

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
};

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { username, email, passwordOne } = this.state;

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        // TBD: now we're writing profile on both sides.

        this.props.firebase.auth.currentUser.updateProfile({
          displayName: username,
        });

        return this.props.firebase
          .currentUser()
          .set({
            username,
            email,
          });
      })
      .then(authUser => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <div>
        {error && <p className="Label Error">{error.message}</p>}
        <form onSubmit={this.onSubmit}>
          <div className="InputGroup">
            <FontAwesomeIcon icon={faUser} />
            <input name="username" value={username} onChange={this.onChange} type="text" placeholder="Full Name" required />
          </div>
          <div className="InputGroup">
            <FontAwesomeIcon icon={faEnvelope} />
            <input name="email" value={email} onChange={this.onChange} type="text" placeholder="Email Address" required />
          </div>
          <div className="InputGroup">
            <FontAwesomeIcon icon={faCheck} />
            <input name="passwordOne" value={passwordOne} onChange={this.onChange} type="password" placeholder="Password" required />
          </div>
          <div className="InputGroup">
            <FontAwesomeIcon icon={faCheckDouble} />
            <input name="passwordTwo" value={passwordTwo} onChange={this.onChange} type="password" placeholder="Confirm Password" required />
          </div>
          <button className="Primary" disabled={isInvalid} type="submit">
            Sign Up
          </button>
        </form>
      </div>
    );
  }
}


const SignUpForm = compose(
  withRouter,
  withFirebase,
)(SignUpFormBase);

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGNUP}>Sign Up</Link>.
  </p>
);

export default SignUpPage;

export { SignUpForm, SignUpLink };
