import React from "react";
import ReactDOM from "react-dom";
import '@fortawesome/fontawesome-free/js/all';
import '@fortawesome/fontawesome-free/js/solid';

import App from "./site/App.js";
import Firebase, { FirebaseContext } from './site/Firebase';

ReactDOM.render(
  <FirebaseContext.Provider value={new Firebase()}>
    <App />
  </FirebaseContext.Provider>
  , document.getElementById("root")
);
