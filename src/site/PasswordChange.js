import React, { useState } from 'react';
import { withFirebase } from './Firebase';

const PasswordChangePage = () => (
  <div>
    <h2>PasswordChange</h2>
    <PasswordChangeForm />
  </div>
);

const INITIAL_STATE = {
  passwordOne: '',
  passwordTwo: '',
  error: null,
};

const PasswordChangeFormBase = ({ firebase }) => {
  const [state, setState] = useState({ ...INITIAL_STATE });
  const { passwordOne, passwordTwo, error } = state;

  const onSubmit = event => {
    firebase
      .doPasswordUpdate(passwordOne)
      .then(() => {
        setState({ ...INITIAL_STATE });
      })
      .catch(error => {
        setState(prevState => ({ ...prevState, error }));
      });

    event.preventDefault();
  };

  const onChange = event => {
    setState(prevState => ({
      ...prevState,
      [event.target.name]: event.target.value
    }));
  };

  const isInvalid = passwordOne !== passwordTwo || passwordOne === '';

  return (
    <div>
      {error && <p className="Label Error">{error.message}</p>}
      <form className="Horizon" onSubmit={onSubmit}>
        <input
          name="passwordOne"
          value={passwordOne}
          onChange={onChange}
          type="password"
          placeholder="New Password"
        />
        <input
          name="passwordTwo"
          value={passwordTwo}
          onChange={onChange}
          type="password"
          placeholder="Confirm New Password"
        />
        <button disabled={isInvalid} type="submit">
          Reset My Password
        </button>
      </form>
    </div>
  );
};

const PasswordChangeForm = withFirebase(PasswordChangeFormBase);

export { PasswordChangeForm };