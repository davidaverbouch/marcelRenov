// import 'firebase/auth';
// import 'firebase/firestore';
// import * as firebase from 'firebase';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}

export const fs = firestore();
export const fa = auth();
export const fstorage = storage();
export const fb = firebase;
export const fbs = firestore;
