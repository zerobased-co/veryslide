import React from 'react';
import { Link } from 'react-router-dom';

import { AuthUserContext } from './Session';
import * as ROUTES from './constants/routes';

const Navigation = () => (
  <div className="Navigation">
    <Link className="Brand" to={ROUTES.LANDING}>
      Veryslide
    </Link>
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? <NavigationAuth /> : <NavigationNonAuth />
      }
    </AuthUserContext.Consumer>
  </div>
);

const NavigationAuth = () => (
  <ul>
    <li>
      <Link to={ROUTES.HOME}>Home</Link>
    </li>
    <li>
      <Link to={ROUTES.SLIDE_NEW}>New Slide</Link>
    </li>
    <li>
      <Link to={ROUTES.ACCOUNT}>Account</Link>
    </li>
  </ul>
);

const NavigationNonAuth = () => (
  <ul>
    <li>
      <Link to={ROUTES.SIGNIN}>Sign In</Link>
    </li>
  </ul>
);

export default Navigation;
