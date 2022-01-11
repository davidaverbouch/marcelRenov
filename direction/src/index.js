import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { FirebaseAppProvider } from 'reactfire';

const firebaseConfig = {
  apiKey: "AIzaSyBLZSubv92m22fEDq0Ok25fO0FBboVP4NE",
  authDomain: "marcelrenov-web.firebaseapp.com",
  projectId: "marcelrenov-web",
  storageBucket: "marcelrenov-web.appspot.com",
  messagingSenderId: "286713953813",
  appId: "1:286713953813:web:2a542ad866caaa033c181c",
  measurementId: "G-BR21R83LHZ"
};

ReactDOM.render(
  <FirebaseAppProvider firebaseConfig={firebaseConfig}>
    <App />
  </FirebaseAppProvider>,
  document.getElementById('root')
);
