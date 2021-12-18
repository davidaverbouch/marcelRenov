import React from 'react';
import { useState, useEffect } from "react";

import 'firebase/firestore';
import firebase from 'firebase/app';

import {
    Typography,
    TextField,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Slide,
    Grow,
} from '@material-ui/core';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Login(props) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [errorLogin, setErrorLogin] = useState(false);

    const logUser = () => {
        firebase.auth().signInWithEmailAndPassword(login, password).then((userCredential) => {
            setErrorLogin(false);
            var user = userCredential.user;
            // console.log(user, user.uid);
            props.userId(user.uid);
            props.setLogged(true);
        }).catch((error) => {
            // console.log(error.code, error.message);
            setErrorLogin(true);
            props.setLogged(false);
        });
    };

    return (
        <Dialog className="loginModal" open={props.open} TransitionComponent={Transition} fullWidth keepMounted onClose={props.close} >
            <DialogTitle style={{ textAlign: 'center' }}>Connectez-vous</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
                <TextField label="Adresse e-mail" value={login} onChange={e => setLogin(e.target.value)} style={{ margin: '24px 24px 0 24px' }} />
                <TextField label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ margin: '24px' }} />
                <Grow in={errorLogin} timeout={{ enter: 500, exit: 250 }} mountOnEnter unmountOnExit>
                    <Typography style={{ color: '#dc3545', margin: '0 24px 24px 24px' }}>Login ou mot de passe incorrect !</Typography>
                </Grow>
                <Button onClick={logUser} variant="outlined" color="primary" style={{ margin: '24px' }}>Se connecter</Button>
            </DialogContent>
        </Dialog>
    )
}