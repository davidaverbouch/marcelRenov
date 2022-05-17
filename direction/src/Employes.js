/** Objet Employés */
import { useEffect, useState, forwardRef } from 'react';
import 'firebase/firestore';
import "firebase/database";
import firebase from 'firebase';
import { Button, Container, TextField, Typography, Tooltip, IconButton, FormControl, InputLabel, Select, MenuItem, Grow, Dialog, Slide, DialogTitle } from '@material-ui/core';
import { withStyles, makeStyles } from '@material-ui/core/styles';

import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import NotificationsIcon from '@material-ui/icons/Notifications';
import CagnotteChart from './CagnotteChart';

const TooltipBtn = withStyles((theme) => ({
    tooltip: {
        backgroundColor: '#3f50b5',
        color: '#fff',
        padding: '.5em 1em',
        boxShadow: theme.shadows[1],
        fontSize: 14,
    },
}))(Tooltip);

const useStyles = makeStyles({
    root: {
        background: 'transparent',
        borderRadius: 3,
        border: '2px solid #3f51b5',
        color: '#3f51b5',
        padding: '8px 30px',

        '&:hover': {
            background: '#3f51b5',
            color: '#fff'
        }
    },
    label: {
        textTransform: 'capitalize',
        fontWeight: '700'
    },
    text: {
        sm: {
            fontSize: '.75rem'
        },
        md: {
            fontSize: '1rem'
        },
        lg: {
            fontSize: '1.12rem'
        }
    }
});

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function Employes() {
    const classes = useStyles();
    const [menu, setMenu] = useState("employes");
    const [users, setUsers] = useState([]);
    const [syndics, setSyndics] = useState([]);
    const [newUserId, setNewUserId] = useState('');
    const [dateEntree, setDateEntree] = useState(new Date());
    const [dateNaissance, setDateNaissance] = useState(new Date());
    const [role, setRole] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [mail, setMail] = useState('');
    const [mobile, setMobile] = useState('');
    const [nomSyndic, setNomSyndic] = useState('');
    const [addrSyndic, setAddrSyndic] = useState('');
    const [mobileSyndic, setMobileSyndic] = useState('');
    const [userIdentity, setUserIdentity] = useState();
    const [notifyModalOpening, setNotifyModalOpening] = useState(false);
    const [notificationMsg, setNotificationMsg] = useState('');
    const [notificationDestinataire, setNotificationDestinataire] = useState('');
    const [editModalOpening, setEditModalOpening] = useState(false);
    const [editDateEntree, setEditDateEntree] = useState(new Date());
    const [editDateNaissance, setEditDateNaissance] = useState(new Date());
    const [editRole, setEditRole] = useState('');
    const [editNom, setEditNom] = useState('');
    const [editPrenom, setEditPrenom] = useState('');
    const [editMail, setEditMail] = useState('');
    const [editMobile, setEditMobile] = useState('');
    const [cagnotte, setCagnotte] = useState(0);
    const [nbIntervention, setNbIntervention] = useState(0);
    const [editUser, setEditUser] = useState();

    /**
     * @method
     * init {void} initialise les employés et les syndics
     *   - recupère la liste des utilisateurs ainsi que la liste des syndics
     */
    const init = () => {
        setEditModalOpening(false);
        firebase.firestore().collection('users').get().then((o) => {
            let u = o.docs.map((doc, i) => {
                return { ...doc.data(), id: doc.id };
            });
            console.log('Firebase - Liste des utilisateurs', u);
            setUsers(u);
        });

        firebase.firestore().collection('syndics').get().then((o) => {
            let s = o.docs.map((doc, i) => {
                return { ...doc.data(), id: doc.id };
            });
            console.log('Firebase - Liste des syndics', s);
            setSyndics(s);
        });
    };

    /**
     * @method
     * addSyndic {void} ajoute un nouveau syndic en base de donnée
     * 
     * @param nom {string} correspond au nom du syndic
     * @param addr {string} correspond a l'adresse du syndic
     * @param telephone {string} correspond au telephone du syndic
     * @param contact {string} correspond au contact du syndic
     * @returns void
     */
    const addSyndic = () => {
        if (!(nomSyndic && addrSyndic && mobileSyndic)) return;
        console.log('syndic');
        console.log({ nomSyndic, addrSyndic, mobileSyndic })
        firebase.firestore().collection('syndics').doc().set({
            nom: nomSyndic,
            addr: addrSyndic,
            telephone: mobileSyndic,
            contacts: ["Clara"]
        }).then(init);
    };

    const deleteSyndic = (u) => {
        firebase.firestore().collection('syndics').doc(u.id).delete().then(() => {
            console.log('Syndic supprimé');
            init();
        }).catch(e => console.log(e));
    };

    const getPassword = (u) => {
        let dateE = u.dateEntree.toDate();
        let d = (dateE.getDate() < 10) ? '0' + dateE.getDate() : dateE.getDate();
        let m = (dateE.getMonth() + 1 < 10) ? '0' + (dateE.getMonth() + 1) : dateE.getMonth() + 1;
        let password = u.nom.substring(0, 1) + u.prenom.substring(0, 1) + d + m;
        return password;
    };

    /**
     * @method
     * createUser {void} ajoute un nouvel utilisateur en base de données
     * 
     * créer un nouvel utilisateur a partir de son mail et génère son mot de passe automatiquement
     * le mot de passe est construit de la manière suivante : 1ere lettre du nom + 1ere lettre du prenom + le jour d'entrée(2 caractères) + le mois d'entée (2 caractères)
     *  - ex : AD0510
     */
    const createUser = () => {
        let d = (dateEntree.getDate() < 10) ? '0' + dateEntree.getDate() : dateEntree.getDate();
        let m = (dateEntree.getMonth() + 1 < 10) ? '0' + (dateEntree.getMonth() + 1) : dateEntree.getMonth() + 1;
        let password = nom.substring(0, 1) + prenom.substring(0, 1) + d + m;
        console.log('auth id');
        console.log(mail, password)
        firebase.auth().createUserWithEmailAndPassword(mail, password).then((userCredential) => {
            setNewUserId(userCredential.user.uid);
        }).catch(error => console.log(error));
    };

    const addUser = () => {
        if (!(nom && prenom && mail && dateEntree && mobile && dateNaissance && role)) return;
        console.log('user');
        console.log({ nom, prenom, mail, mobile, dateEntree, dateNaissance, cagnotte: 0, nbInter: 0, completionInter: 0, interventionsList: {}, messagesId: [], notifications: [] })
        firebase.firestore().collection('users').doc(newUserId).set({
            nom,
            prenom,
            mail,
            role,
            mobile,
            dateEntree,
            dateNaissance,
            cagnotte: 0,
            nbInter: 0,
            completionInter: 0,
            interventionsList: {},
            messagesId: [],
            notifications: []
        }).then(init);
    };

    const editUserFirebase = () => {
        console.log('edit user');
        console.log({ editNom, editPrenom, editMail, editMobile, editDateEntree, editDateNaissance })
        firebase.firestore().collection('users').doc(editUser.id).update({
            nom: editNom,
            prenom: editPrenom,
            role: editRole,
            mobile: editMobile,
            dateEntree: editDateEntree,
            dateNaissance: editDateNaissance,
            cagnotte: parseInt(cagnotte),
            nbInter: parseInt(nbIntervention)
        }).then(init);
    };

    const deleteUser = (u) => {
        firebase.firestore().collection('users').doc(u.id).delete().then(() => {
            console.log('user supprimé');
            init();
        }).catch(e => console.log(e));
    };

    const editUserModal = (user) => {
        console.log("here", user)
        setEditDateEntree(user.dateEntree);
        setEditDateNaissance(user.dateNaissance);
        setEditRole(user.role);
        setEditNom(user.nom);
        setEditPrenom(user.prenom);
        setEditMail(user.mail);
        setEditMobile(user.mobile);
        setCagnotte(user.cagnotte);
        setNbIntervention(user.nbInter);
        setEditUser(user);
        setEditModalOpening(true);
    };

    const notifyUserModal = (userIdentity, uid) => {
        setNotifyModalOpening(true);
        setUserIdentity(userIdentity);
        setNotificationDestinataire(uid);
    };

    const notifyUser = () => {
        console.log(notificationMsg);


        firebase.firestore().collection('users').doc(notificationDestinataire).update({
            notifications: firebase.firestore.FieldValue.arrayUnion({
                deQui: 'C5ZGq5OHveZRbeR1G7LilK2NqGI3',
                etat: "unread",
                quand: firebase.firestore.Timestamp.fromDate(new Date()),
                quoi: { msg: notificationMsg },
                type: "msgDirection"
            })
        }).then(function () {
            console.log('Firebase - Notification à l\'utilisateur : ' + notificationDestinataire);
            setNotifyModalOpening(false);
        }).catch(function (error) {
            console.error("Firebase - Erreur lors de l'ajout de l'intervention: ", error);
        });
    };

    useEffect(() => console.log(users), [users]);
    useEffect(addUser, [newUserId]);
    useEffect(init, []);
    return (
        <Container maxWidth={false} >
            <div className="MenuWrapper">
                <div onClick={() => setMenu('employes')} className={(menu == 'employes') ? 'menuItemWrapper selected' : 'menuItemWrapper'}>Employés ({users.filter(u => u.role !== 'dev').length})</div>
                <div onClick={() => setMenu('syndics')} className={(menu == 'syndics') ? 'menuItemWrapper selected' : 'menuItemWrapper'}>Syndics ({syndics.length})</div>
                {/* <div onClick={() => setMenu('clients')} className={(menu == 'clients') ? 'menuItemWrapper selected' : 'menuItemWrapper'}>Clients</div> */}
                {/* <div className="menuItemWrapper">Stocks</div> */}
            </div>
            <div className="detailsWrapper">
                <Grow in={menu === 'employes'} unmountOnExit mountOnEnter>
                    <div className="detailsEmployes">
                        <Typography component="h3" className="encadreBlue">Ajouter un employé</Typography>
                        <br />
                        <div className="ajoutEmploye">
                            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                                <KeyboardDatePicker
                                    style={{ flex: 1, marginRight: '16px' }}
                                    label="Date d'entrée"
                                    variant="inline"
                                    format="dd/MM/yyyy"
                                    openTo="date"
                                    value={dateEntree}
                                    onChange={setDateEntree}
                                />
                            </MuiPickersUtilsProvider>
                            <FormControl style={{ flex: 1, marginRight: '16px' }}>
                                <InputLabel id="heureFinLabel">Role</InputLabel>
                                <Select labelId="heureFinLabel" value={role} onChange={event => setRole(event.target.value)} >
                                    <MenuItem value={'technicien'}>TECHNICIEN</MenuItem>
                                    <MenuItem value={'gestionnaire'}>GESTIONNAIRE</MenuItem>
                                    {/* <MenuItem value={'stock'}>STOCK</MenuItem> */}
                                    <MenuItem value={'direction'}>DIRECTION</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField value={nom} onChange={e => setNom(e.target.value)} style={{ flex: 1, marginRight: '16px' }} label="Nom" />
                            <TextField value={prenom} onChange={e => setPrenom(e.target.value)} style={{ flex: 1, marginRight: '16px' }} label="Prenom" />
                            <TextField value={mail} onChange={e => setMail(e.target.value)} style={{ flex: 1, marginRight: '16px' }} label="Mail" />
                            <TextField value={mobile} onChange={e => setMobile(e.target.value)} style={{ flex: 1, marginRight: '16px' }} label="Mobile" type="tel" />
                            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                                <KeyboardDatePicker
                                    style={{ flex: 1, marginRight: '16px' }}
                                    label="Date de naissance"
                                    variant="inline"
                                    format="dd/MM/yyyy"
                                    openTo="date"
                                    value={dateNaissance}
                                    onChange={setDateNaissance}
                                />
                            </MuiPickersUtilsProvider>
                            <Button variant="outlined" onClick={createUser} classes={{ root: classes.root, label: classes.label }}>Ajouter</Button>
                        </div>
                        <div className="listEmploye">
                            {users.filter(u => u.role !== 'dev').map(u => <div className="employe">
                                {/* <TooltipBtn title="Notifier"><IconButton style={{ marginRight: 8 }} onClick={() => notifyUserModal(u.nom + ' ' + u.prenom, u.id)} aria-label="notifier" color="primary"><NotificationsIcon /></IconButton></TooltipBtn> */}
                                <div style={{ flex: 3 }}>
                                    <div style={{ marginBottom: '6px' }}>
                                        <TooltipBtn title={"mot de passe : " + getPassword(u)}>
                                            <div>
                                                <span style={{ fontSize: '1.12rem', fontWeight: '700', paddingRight: '8px', textTransform: 'uppercase' }}>{u.nom}</span>
                                                <span style={{ fontSize: '1.12rem', fontWeight: '700', paddingRight: '8px' }}>{u.prenom}</span>
                                            </div>
                                        </TooltipBtn>
                                    </div>
                                    <div style={{ color: '#bbb', fontSize: '.75rem' }}>{u.id}</div>
                                </div>
                                <div style={{ flex: 3 }}>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ flex: 1, fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>{u.mobile}</div>
                                        <TooltipBtn title="Date de naissance" placement="left">
                                            <div style={{ flex: 1, color: '#999', fontSize: '.75rem', marginBottom: '6px' }}>
                                                {u.dateNaissance.toDate().toLocaleDateString('fr')}
                                            </div>
                                        </TooltipBtn>
                                    </div>
                                    <div style={{ color: '#3f51b5', fontSize: '.75rem', fontWeight: '700' }}>{u.mail}</div>
                                </div>
                                <div style={{ flex: 2 }}>
                                    <div style={{ fontWeight: '700', marginBottom: '6px' }}>{u.role}</div>
                                    <TooltipBtn title="Date d'entrée" placement="left"><div style={{ color: '#999', fontSize: '.75rem' }}>{u.dateEntree.toDate().toLocaleDateString('fr')}</div></TooltipBtn>
                                </div>
                                <div style={{ flex: 1 }}></div>
                                <div style={{ flex: 1, textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', marginBottom: '6px' }}>{Object.keys(u.cagnotte).length * 12}</div>
                                    <div style={{ color: '#999', fontSize: '.75rem' }}>Cagnotte</div>
                                </div>
                                <div style={{ flex: 1, textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', marginBottom: '6px' }}>{Object.keys(u.interventionsList).length}</div>
                                    <div style={{ color: '#999', fontSize: '.75rem' }}>Interventions</div>
                                </div>
                                {/* <div style={{ flex: 1, textAlign: 'right' }}>
                                    <Tooltip title={(
                                        <div style={{ display: 'flex', flexWrap: 'wrap', width: '206px' }}>
                                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', alignContent: 'center', borderBottom: '1px solid #eee', padding: '4px' }}>
                                                <h4 style={{ flex: 1, textAlign: 'center' }}>Completion Totale</h4>
                                                <div style={{ flex: 1, textAlign: 'center' }} ><img style={{ maxWidth: '100%', maxHeight: '36px' }} src={u.completionInter && CagnotteChart[(Number.parseFloat(Object.values(u.completionInter).reduce((a, b) => a + b) / Object.values(u.completionInter).length).toFixed(2)) * 100].default} alt="completionInter" /></div>
                                            </div>
                                            {Object.values(u.completionInter).map(c => <div style={{ flex: 1, padding: '8px', textAlign: 'center', minWidth: '36px' }}><img style={{ maxWidth: '100%', maxHeight: '36px' }} src={CagnotteChart[c * 100].default} alt="completionInter" />{c}</div>)}
                                        </div>
                                    )} disableHoverListener={Object.values(u.completionInter).length === 0}>
                                        <div style={{ fontWeight: '700', marginBottom: '6px' }}>{u.completionInter && (Number.parseFloat(Object.values(u.completionInter).reduce((a, b) => a + b) / Object.values(u.completionInter).length).toFixed(2))}</div>
                                    </Tooltip>
                                    <div style={{ color: '#999', fontSize: '.75rem' }}>Complété</div>
                                </div> */}
                                <div style={{ flex: 2, textAlign: 'right' }}>
                                    {/* <TooltipBtn title="Editer"><IconButton onClick={() => { editUserModal(u); }} aria-label="edit" color="primary"><EditIcon /></IconButton></TooltipBtn> */}
                                    <TooltipBtn title="Supprimer"><IconButton onClick={() => deleteUser(u)} aria-label="supprimer" color="secondary"><CloseIcon /></IconButton></TooltipBtn>
                                </div>
                            </div>)}
                        </div>
                    </div>
                </Grow>

                <Grow in={menu === 'syndics'} unmountOnExit mountOnEnter>
                    <div className="detailsEmployes">
                        <Typography component="h3" className="encadreBlue">Ajouter un syndic</Typography>
                        <br />
                        <div className="ajoutEmploye">
                            <TextField value={nomSyndic} onChange={e => setNomSyndic(e.target.value)} style={{ flex: 1, marginRight: '16px' }} label="Nom" />
                            <TextField value={addrSyndic} onChange={e => setAddrSyndic(e.target.value)} style={{ flex: 1, marginRight: '16px' }} label="Adresse" />
                            <TextField value={mobileSyndic} onChange={e => setMobileSyndic(e.target.value)} style={{ flex: 1, marginRight: '16px' }} label="Mobile" type="tel" />
                            <Button variant="outlined" onClick={addSyndic} classes={{ root: classes.root, label: classes.label }}>Ajouter</Button>
                        </div>
                        <div className="listEmploye">
                            {syndics.map(s => (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1, padding: '16px', borderBottom: '1px solid' }}>{s.nom}</div>
                                    <div style={{ flex: 1, padding: '16px', borderBottom: '1px solid' }}>{s.addr}</div>
                                    <div style={{ flex: 1, padding: '16px', borderBottom: '1px solid' }}>{s.telephone}</div>
                                    {/* <div style={{ flex: 1, padding: '16px', borderBottom: '1px solid' }}>{s.id}</div> */}
                                    <div style={{ padding: '0 16px', borderBottom: '1px solid', textAlign: 'right' }}>
                                        <TooltipBtn title="Supprimer"><IconButton onClick={() => deleteSyndic(s)} aria-label="supprimer" color="secondary"><CloseIcon /></IconButton></TooltipBtn>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Grow>

                {/* <Dialog open={notifyModalOpening} maxWidth="sm" fullWidth TransitionComponent={Transition} keepMounted onClose={() => setNotifyModalOpening(false)}>
                    <DialogTitle style={{ textAlign: 'center', background: '#3f51b5', color: '#fff' }}>Notifications à {userIdentity}</DialogTitle>
                    <div style={{ padding: 24 }}>
                        <TextField multiline fullWidth label="Message a envoyer" value={notificationMsg} onChange={(e) => setNotificationMsg(e.target.value)} />
                    </div>
                    <Button onClick={notifyUser} color="primary" variant="contained" size="large" style={{ width: '400px', margin: '1em auto', borderRadius: 0, textTransform: 'none', fontWeight: '700' }}>Notifier {userIdentity}</Button>
                </Dialog> */}

                {editUser && <Dialog open={editModalOpening} maxWidth="sm" fullWidth TransitionComponent={Transition} keepMounted onClose={() => setEditModalOpening(false)}>
                    <DialogTitle style={{ textAlign: 'center', background: '#3f51b5', color: '#fff' }}>Edition de {editUser.nom + ' ' + editUser.prenom}</DialogTitle>
                    <div style={{ padding: 24, display: 'flex', flexWrap: 'wrap' }}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                            <KeyboardDatePicker
                                style={{ minWidth: '40%', flex: 1, marginBottom: '8px', marginRight: '16px' }}
                                label="Date d'entrée"
                                variant="inline"
                                format="dd/MM/yyyy"
                                disabled
                                openTo="date"
                                value={dateEntree}
                                onChange={setDateEntree}
                            />
                        </MuiPickersUtilsProvider>
                        <FormControl style={{ minWidth: '40%', flex: 1, marginBottom: '8px', marginRight: '16px' }}>
                            <InputLabel id="heureFinLabel">Role</InputLabel>
                            <Select labelId="heureFinLabel" value={editRole} onChange={event => setRole(event.target.value)} >
                                <MenuItem value={'technicien'}>TECHNICIEN</MenuItem>
                                <MenuItem value={'gestionnaire'}>GESTIONNAIRE</MenuItem>
                                <MenuItem value={'direction'}>DIRECTION</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField value={editNom} onChange={e => setNom(e.target.value)} style={{ minWidth: '40%', flex: 1, marginBottom: '8px', marginRight: '16px' }} label="Nom" />
                        <TextField value={editPrenom} onChange={e => setPrenom(e.target.value)} style={{ minWidth: '40%', flex: 1, marginBottom: '8px', marginRight: '16px' }} label="Prenom" />
                        <TextField value={editMail} disabled onChange={e => setMail(e.target.value)} style={{ minWidth: '40%', flex: 1, marginBottom: '8px', marginRight: '16px' }} label="Mail" />
                        <TextField value={editMobile} onChange={e => setMobile(e.target.value)} style={{ minWidth: '40%', flex: 1, marginBottom: '8px', marginRight: '16px' }} label="Mobile" type="tel" />
                        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                            <KeyboardDatePicker
                                style={{ minWidth: '40%', flex: 1, marginBottom: '8px', marginRight: '16px' }}
                                label="Date de naissance"
                                variant="inline"
                                format="dd/MM/yyyy"
                                openTo="date"
                                value={dateNaissance}
                                onChange={setDateNaissance}
                            />
                        </MuiPickersUtilsProvider>
                    </div>
                    <Button onClick={editUserFirebase} color="primary" variant="contained" size="large" style={{ width: '400px', margin: '1em auto', borderRadius: 0, textTransform: 'none', fontWeight: '700' }}>Modifier {editUser.nom + ' ' + editUser.prenom}</Button>
                </Dialog>}
            </div>
        </Container >
    );
}

export default Employes;
