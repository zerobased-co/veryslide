import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'

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
        <FontAwesomeIcon icon={faPlusCircle} />
        New Slide
      </Link>
    </li>
    <li>
      <Link className="Button" to={ROUTES.HOME}>My Page</Link>
    </li>
    <li>
      <Link className="Button" to={ROUTES.ACCOUNT}>Account</Link>
    </li>
  </ul>
);

const NavigationNonAuth = () => (
  <ul>
    <li>
      <Link className="Button" to={ROUTES.SIGNIN}>Sign In</Link>
    </li>
  </ul>
);

export default Navigation;