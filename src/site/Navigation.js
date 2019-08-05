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
      <Link className="Button Primary" to={ROUTES.SLIDE_NEW}>
        <i className="fas fa-plus-circle"/>&nbsp;New Slide
      </Link>
    </li>
    <li>
      <Link className="Button" to={ROUTES.HOME}>My page</Link>
    </li>
    <li>
      <Link className="Button" to={ROUTES.ACCOUNT}>Account</Link>
    </li>
  </ul>
);

const NavigationNonAuth = () => (
  <div/>
);

export default Navigation;
