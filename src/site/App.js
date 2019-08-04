import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import "./App.scss";
import Navigation from './Navigation';
import Landing from './Landing';
import SignUp from './SignUp';
import SignIn from './SignIn';
import PasswordForget from './PasswordForget';
import Home from './Home';
import Account from './Account';
import Admin from './Admin';
import Slide, { SlideNew } from './Slide';

import { withAuthentication } from './Session';
import * as ROUTES from './constants/routes';


const NavRoute = ({exact, path, component: Component}) => (
  <Route exact={exact} path={path} render={(props) => (
    <div>
      <Navigation/>
      <Component {...props}/>
    </div>
  )}/>
)

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authUser: null,
    };
  }

  render() {
    return (
      <Router>
        <div className="VerySlideWeb">
          <Switch>
            <Route exact path={ROUTES.LANDING} component={Landing} />
            <NavRoute path={ROUTES.SIGNUP} component={SignUp} />
            <NavRoute path={ROUTES.SIGNIN} component={SignIn} />
            <NavRoute path={ROUTES.PASSWORD_FORGET} component={PasswordForget} />
            <Route path={ROUTES.HOME} component={Home} />
            <NavRoute path={ROUTES.ACCOUNT} component={Account} />
            <NavRoute path={ROUTES.ADMIN} component={Admin} />
            <NavRoute path={ROUTES.SLIDE_NEW} component={SlideNew} />
            <NavRoute path={ROUTES.SLIDE} component={Slide} />
          </Switch>
        </div>
      </Router>
    );
  }
}


export default hot(module)(withAuthentication(App));
