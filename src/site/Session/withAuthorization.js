import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../constants/routes';

const withAuthorization = condition => Component => {
  function WithAuthorization(props) {
    const navigate = useNavigate();
    const { firebase } = props;

    useEffect(() => {
      const unsubscribe = firebase.auth.onAuthStateChanged(authUser => {
        if (!condition(authUser)) {
          navigate(ROUTES.SIGNIN);
        }
      });
      return () => unsubscribe();
    }, [firebase, navigate]);

    return (
      <AuthUserContext.Consumer>
        {authUser =>
          condition(authUser)
            ? <Component {...props} />
            : null
        }
      </AuthUserContext.Consumer>
    );
  }

  return withFirebase(WithAuthorization);
};

export default withAuthorization;
