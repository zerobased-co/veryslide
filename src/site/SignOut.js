import React from 'react';
import { useNavigate } from 'react-router-dom';

import { withFirebase } from './Firebase';
import * as ROUTES from './constants/routes';

function SignOutButton(props) {
  const navigate = useNavigate();

  const onSignOut = event => {
    event.preventDefault();

    props.firebase.doSignOut().then(() => {
      navigate(ROUTES.LANDING);
    });
  };

  return (
    <button className="Button" type="button" onClick={onSignOut}>
      Sign Out
    </button>
  );
}

export default withFirebase(SignOutButton);