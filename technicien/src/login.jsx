import React from 'react';
import { useState, useEffect } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebaseConfig';

import { useDispatch } from 'react-redux';
import { setCurrentGestionnaireId } from './features/calendar/CalendarSlice';

import {
    Typography,
    TextField,
    Button,
    Grow,
} from '@material-ui/core';

export default function Login(props) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [errorLogin, setErrorLogin] = useState(false);
    const [cn, setCn] = useState("");

    const dispatch = useDispatch();

    const logUser = () => {
        if (login === '' || password === '') return;

        signInWithEmailAndPassword(auth, login, password).then((userCredential) => {
            setErrorLogin(false);
            var user = userCredential.user;
            dispatch(setCurrentGestionnaireId(user.uid));
            props.userId(user.uid);
            props.setLogged(true);
            setCn('logged');
        }).catch((error) => {
            console.log(error.code, error.message);
            setErrorLogin(true);
            props.setLogged(false);
        });
    };

    return (
        <div className={cn} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999999, background: '#f1f9f9', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h2 style={{ color: '#3f51b5' }}>Marcel rénovation</h2>
            <div style={{ border: '1px solid #3f51b5', width: 420, padding: '24px', background: '#fff', borderRadius: 8, boxShadow: '0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%)' }}>
                <h4 style={{ textAlign: 'center', color: '#3f51b5' }}>Connectez-vous</h4>
                <form onSubmit={logUser} style={{ display: 'flex', flexDirection: 'column' }}>
                    <TextField onKeyUp={e => { if (e.key === 'Enter' || e.keyCode === 13) logUser(); }} label="Adresse e-mail" value={login} onChange={e => setLogin(e.target.value)} style={{ margin: '24px 24px 0 24px' }} />
                    <TextField onKeyUp={e => { if (e.key === 'Enter' || e.keyCode === 13) logUser(); }} label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ margin: '24px' }} />
                    <Grow in={errorLogin} timeout={{ enter: 500, exit: 250 }} mountOnEnter unmountOnExit>
                        <Typography style={{ color: '#dc3545', margin: '0 24px 24px 24px' }}>Login ou mot de passe incorrect !</Typography>
                    </Grow>
                    <Button onClick={logUser} variant="outlined" color="primary" style={{ margin: '24px' }}>Se connecter</Button>
                </form>
            </div>
        </div>
    )
}