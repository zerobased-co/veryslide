import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons'

import { SignInLink } from './SignIn';
import Footer from './Footer';
import { AuthUserContext } from './Session';
import * as ROUTES from './constants/routes';

const Landing = () => (
  <div className="VerySlideWeb">
    <div className="Landing">
      <div className="Title">
        <div className="Hero">
          <h1>Veryslide</h1>
          <h2>Forge and share versatile slides.</h2>
          <AuthUserContext.Consumer>
            {authUser =>
              authUser ? 

              <div>
                <p>Welcome back, {authUser.displayName}.</p>
                <Link to={ROUTES.HOME} className="Button Primary Large">
                  Go to my page
                    <FontAwesomeIcon icon={faArrowCircleRight} className="right" />
                </Link>
              </div>

              : 

              <div>
                <Link to={ROUTES.SIGNUP} className="Button Primary Large">
                  Sign up
                    <FontAwesomeIcon icon={faArrowCircleRight} className="right" />
                </Link>
                <SignInLink />
              </div>
            }
          </AuthUserContext.Consumer>
        </div>
      </div>
      <div className="Intro">
        <div className="Content">
          <h1>What is Veryslide?</h1>
          <p>Description goes here.</p>
          <h1>Discover slides</h1>
          <p>Slides goes here.</p>
        </div>
        <Footer />
      </div>
    </div>
  </div>
);

export default Landing;
