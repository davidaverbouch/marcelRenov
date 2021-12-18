import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { FirebaseAppProvider } from 'reactfire';

const firebaseConfig = {
  apiKey: "AIzaSyCFPNMql3KPUtk4BblwcznqlaQaCNn2wq8",
  authDomain: "marcelrenovation-5c0dd.firebaseapp.com",
  databaseURL: "https://marcelrenovation-5c0dd-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "marcelrenovation-5c0dd",
  storageBucket: "marcelrenovation-5c0dd.appspot.com",
  messagingSenderId: "670924331540",
  appId: "1:670924331540:web:63407693ee908c30a96501",
  measurementId: "G-0XPH876H64"
};

ReactDOM.render(
  <FirebaseAppProvider firebaseConfig={firebaseConfig}>
    <App />
  </FirebaseAppProvider>,
  document.getElementById('root')
);
