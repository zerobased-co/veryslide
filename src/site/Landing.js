import React from 'react';
import { Link } from 'react-router-dom';
import { SignInLink } from './SignIn';
import { AuthUserContext } from './Session';
import * as ROUTES from './constants/routes';

const Landing = () => (
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
              <Link to={ROUTES.HOME} className="Button">
                Go to my page&nbsp;<i className="fas fa-arrow-circle-right"></i>
              </Link>
            </div>

            : 

            <div>
              <Link to={ROUTES.SIGNUP} className="Button">
                Sign up&nbsp;<i className="fas fa-arrow-circle-right"></i>
              </Link>
              <SignInLink />
            </div>
          }
        </AuthUserContext.Consumer>
      </div>
    </div>
    <div className="Intro">
      <article>
        <h1>What is Veryslide?</h1>
        <p>Description goes here.</p>
        <h1>Discover slides</h1>
        <p>Slides goes here.</p>
      </article>
      <div className="Footer">
        <p>This site brought to you by <a href="https://zerobased.co">zerobased.co</a></p>
      </div>
    </div>
  </div>
);

export default Landing;
