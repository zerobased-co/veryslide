import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons'

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

function SignInFormBase(props) {
  const [state, setState] = React.useState(INITIAL_STATE);
  const navigate = useNavigate();

  const onSubmit = event => {
    const { email, password } = state;

    props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
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

  const { email, password, error } = state;
  const isInvalid = password === '' || email === '';

  return (
    <div>
      {error && <p className="Label Error">{error.message}</p>}
      <form onSubmit={onSubmit}>
        <div className="InputGroup">
          <FontAwesomeIcon icon={faEnvelope} />
          <input name="email" value={email} onChange={onChange} type="text" placeholder="Email Address" required />
        </div>
        <div className="InputGroup">
          <FontAwesomeIcon icon={faKey} />
          <input name="password" value={password} onChange={onChange} type="password" placeholder="Password" required />
        </div>
        <button className="Primary" disabled={isInvalid} type="submit">
          Sign In
        </button>
      </form>
    </div>
  );
}

const SignInForm = withFirebase(SignInFormBase);

const SignInLink = () => (
  <p>
    Already have an account? <Link to={ROUTES.SIGNIN}>Sign in</Link>.
  </p>
);

export default SignInPage;

export { SignInForm, SignInLink };
