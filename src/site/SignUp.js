import React, { Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

function SignUpFormBase(props) {
  const [state, setState] = React.useState(INITIAL_STATE);
  const navigate = useNavigate();

  const onSubmit = event => {
    const { username, email, passwordOne } = state;

    props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        props.firebase.auth.currentUser.updateProfile({
          displayName: username,
        });

        return props.firebase
          .currentUser()
          .set({
            username,
            email,
          });
      })
      .then(authUser => {
        setState({ ...INITIAL_STATE });
        navigate(ROUTES.HOME);
      })
      .catch(error => {
        setState(prev => ({ ...prev, error }));
      });

    event.preventDefault();
  };

  const onChange = event => {
    setState(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const {
    username,
    email,
    passwordOne,
    passwordTwo,
    error,
  } = state;

  const isInvalid =
    passwordOne !== passwordTwo ||
    passwordOne === '' ||
    email === '' ||
    username === '';

  return (
    <div>
      {error && <p className="Label Error">{error.message}</p>}
      <form onSubmit={onSubmit}>
        <div className="InputGroup">
          <FontAwesomeIcon icon={faUser} />
          <input name="username" value={username} onChange={onChange} type="text" placeholder="Full Name" required />
        </div>
        <div className="InputGroup">
          <FontAwesomeIcon icon={faEnvelope} />
          <input name="email" value={email} onChange={onChange} type="text" placeholder="Email Address" required />
        </div>
        <div className="InputGroup">
          <FontAwesomeIcon icon={faCheck} />
          <input name="passwordOne" value={passwordOne} onChange={onChange} type="password" placeholder="Password" required />
        </div>
        <div className="InputGroup">
          <FontAwesomeIcon icon={faCheckDouble} />
          <input name="passwordTwo" value={passwordTwo} onChange={onChange} type="password" placeholder="Confirm Password" required />
        </div>
        <button className="Primary" disabled={isInvalid} type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
}

const SignUpForm = withFirebase(SignUpFormBase);

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGNUP}>Sign Up</Link>.
  </p>
);

export default SignUpPage;

export { SignUpForm, SignUpLink };