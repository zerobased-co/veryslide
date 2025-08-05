import React from "react";
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';

import "./App.scss";
import Navigation from './Navigation';
import Landing from './Landing';
import SignUp from './SignUp';
import SignIn from './SignIn';
import PasswordForget from './PasswordForget';
import Home from './Home';
import Account from './Account';
import Admin from './Admin';
import Footer from './Footer';
import Slide, { SlideNew } from './Slide';

import { withAuthentication } from './Session';
import * as ROUTES from './constants/routes';


const NavLayout = () => (
  <div className="VerySlideWeb">
    <Navigation/>
    <div className="Content">
      <Outlet />
    </div>
    <Footer/>
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.LANDING} element={<Landing />} />
        <Route path="/" element={<NavLayout />}>
          <Route path={ROUTES.SIGNUP} element={<SignUp />} />
          <Route path={ROUTES.SIGNIN} element={<SignIn />} />
          <Route path={ROUTES.PASSWORD_FORGET} element={<PasswordForget />} />
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ACCOUNT} element={<Account />} />
          <Route path={ROUTES.ADMIN} element={<Admin />} />
          <Route path={ROUTES.SLIDE_NEW} element={<SlideNew />} />
        </Route>
        <Route path={ROUTES.SLIDE} element={<Slide />} />
      </Routes>
    </Router>
  );
};


export default withAuthentication(App);
