/** Pas utilisé, mais a utilisé et corrigé le bug */
import { useState, useEffect, Fragment } from "react";
import './App.css';
import noThumbnail from './no-thumbnail.jpg';

import 'firebase/firestore';
import 'firebase/storage';
import "firebase/database";
import firebase from 'firebase';

import CagnotteChart from './CagnotteChart';
import InterventionModal from './InterventionModal';
import Task from "./Task";

import { Typography, Card, CardActions, CardContent, Tooltip, TextField, Button, Menu, MenuItem, IconButton, withStyles } from '@material-ui/core';

import FlipCameraAndroidIcon from '@material-ui/icons/FlipCameraAndroid';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import PersonIcon from '@material-ui/icons/Person';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import AnnouncementIcon from '@material-ui/icons/Announcement';
import EuroIcon from '@material-ui/icons/Euro';

const TooltipBtn = withStyles((theme) => ({
    tooltip: {
        backgroundColor: '#3f50b5',
        color: '#fff',
        padding: '.5em 1em',
        boxShadow: theme.shadows[1],
        fontSize: 14,
    },
}))(Tooltip);

function CurrentIntervention(props) {
    console.log('laaaaa', props)

    const colorizedState = (type, tacheId) => {
        let typeReturn = (type === 'color') ? 'color' : 'bgColor';

        let colorCard;
        if (tacheId.etat === 'En attente') colorCard = typeReturn + '_EnAttente';
        if (tacheId.etat === 'En cours') colorCard = typeReturn + '_EnCours';
        if (tacheId.etat === 'Terminée') colorCard = typeReturn + '_Terminee';
        if (tacheId.etat === 'PasTerminée') colorCard = typeReturn + '_pasTerminee';
        if (tacheId.etat === 'Annulée') colorCard = typeReturn + '_Annulee';
        if (tacheId.etat === 'Refusée') colorCard = typeReturn + '_Refusee';
        if (tacheId.etat === 'Finalisée') colorCard = typeReturn + '_Finalisee';
        if (tacheId.etat === 'Facturée') colorCard = typeReturn + '_Facturee';
        if (tacheId.etat === 'Payée') colorCard = typeReturn + '_Payee';
        if (tacheId.etat === 'SAV') colorCard = typeReturn + '_SAV';

        return colorCard
    };

    const openAddrInGMaps = (geoPos) => {
        let page = "https://www.google.com/maps/search/?api=1&query=" + geoPos.x_ + "," + geoPos.N_;
        window.open(page, "adresse postale", "menubar=no, status=no, scrollbars=no, menubar=no, width=1250, height=850");
    };

    return (
        <div>
            <CurrentInterventionAction {...props} />

            <Card elevation={1}>
                <CardContent className={"CardHeaderWrapper " + colorizedState('bg', props)} style={{ color: '#fff' }}>
                    <Typography variant="body2" style={{ display: 'flex' }} component="div">
                        <div style={{ flex: 5 }}><span style={{ fontWeight: '700', fontSize: '24px' }}>{"N°" + props.codeInter}</span> <br /> {props.dateInter.toDate().toLocaleDateString('fr')}<br /> {unescape(props.hours)}</div>
                        {/* <div style={{ flex: 1 }}><img style={{ maxWidth: '100%' }} src={CagnotteChart[props.nbCagnotte].default} alt="completionInter" /></div> */}
                    </Typography>
                </CardContent>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">{unescape(props.names)}</Typography>
                    <Typography variant="body2" color="textSecondary" component="div">
                        <TooltipBtn title="Voir l'adresse du client sur Google Maps"><div onClick={() => openAddrInGMaps(props.addr)} style={{ fontWeight: '700', cursor: 'pointer' }}>{unescape(props.addrText)}</div></TooltipBtn>
                        <div style={{ fontWeight: '700', marginTop: 12 }}>{unescape(props.tel.mobile)}</div>
                    </Typography>
                </CardContent>
                <CardContent style={{ background: '#333', color: '#fff' }}>
                    <Typography variant="body2" component="div">Materiel requis : <br /><span style={{ fontWeight: '700' }}>{unescape(props.materiel.join(', '))}</span></Typography>
                </CardContent>

                <Taches {...props} />
            </Card>
        </div>
    );
}

function Taches(props) {
    const [currentTasksTitle, setCurrentTasksTitle] = useState('');
    const [currentTasksDesc, setCurrentTasksDesc] = useState('');
    const [currentTasksImg, setCurrentTasksImg] = useState('');
    const [currentTasksImgUrl, setCurrentTasksImgUrl] = useState(noThumbnail);
    const [ajouterTache, setAjouterTache] = useState(false);
    const storageRef = firebase.storage().ref();
    console.log('lalali', props)

    const addTask = () => {
        firebase.firestore().collection('interventions').doc(props.codeInter + '').update({
            'taches': firebase.firestore.FieldValue.arrayUnion({
                'etat': "Non réalisé",
                'retourCommentaire': "",
                'retourEtat': 0,
                'retourPhoto': "",
                'retourRaison': "",
                'tache': {
                    'description': escape(currentTasksDesc),
                    'image': currentTasksImg,
                    'title': escape(currentTasksTitle)
                }
            })
        }).then(function () {
            console.log('Firebase - Tache ajoutée : ' + props.codeInter);
        }).catch(function (error) {
            console.error("Firebase - Erreur lors de l'ajout de la tache: ", error);
        });
    };

    const saveImg = (file) => {
        let uploadTask = storageRef.child(file.name).put(file);

        uploadTask.on('state_changed', (snapshot) => {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
        }, error => console.log(error), () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                console.log('File available at', downloadURL);
                setCurrentTasksImg(file.name);
                setCurrentTasksImgUrl(downloadURL);
            });
        });
    };

    const suppressTask = (task) => {
        firebase.firestore().collection('interventions').doc(props.codeInter + '').update({
            'taches': firebase.firestore.FieldValue.arrayRemove({ ...task })
        }).then(function () {
            console.log('Firebase - Tache supprimé : ' + props.codeInter);
        }).catch(function (error) {
            console.error("Firebase - Erreur lors de l'ajout de la tache: ", error);
        });
    };

    return (
        <>
            {(props.taches || []).map((cTask, i) => {
                return (
                    <Fragment key={i}>
                        <Task tache={cTask} imgName={cTask.tache.image} imgRetourName={cTask.retourPhoto} suppressTask={suppressTask} />
                        {i < (props.taches.length - 1) && <hr style={{ border: 'none', borderBottom: ' 1px solid #ddd' }}></hr>}
                    </Fragment>
                )
            })}
            {ajouterTache && (
                <CardContent key="ajouterTache" style={{ position: 'relative', display: 'flex' }}>
                    <hr style={{ position: 'absolute', top: 0, left: '16px', right: '16px' }}></hr>
                    <div style={{ flex: 2 }}>
                        <TextField key={'ajouter_1'} value={currentTasksTitle} onChange={(e) => setCurrentTasksTitle(e.target.value)} margin="dense" label={"Ajouter tache"} placeholder="Titre de la tache" type="text" fullWidth />
                        <TextField key={'ajouter_2'} value={currentTasksDesc} onChange={(e) => setCurrentTasksDesc(e.target.value)} multiline margin="dense" label="Description" placeholder="Description" type="text" fullWidth />
                    </div>
                    <div style={{ flex: 1, marginLeft: '16px', display: 'flex', alignItems: 'flex-end' }}>
                        <Typography key={'ajouter_3'} component="div" style={{ display: 'flex', marginBottom: '3px', position: 'relative' }}>
                            <img src={currentTasksImgUrl} alt="description" style={{ marginLeft: '16px', height: '64px' }} />
                            <TextField className="addTacheImg" type="file" inputProps={{ accept: 'image/*' }} onChange={e => saveImg(e.target.files[0])} label="Image" size="small" variant="standard" />
                        </Typography>
                    </div>
                </CardContent>
            )}
            <CardActions key="wrapper_1-4" style={{ justifyContent: "center" }}>
                {!ajouterTache && <Button size="small" color="primary" onClick={() => setAjouterTache(true)}> Ajouter une tache </Button>}
                {ajouterTache &&
                    <>
                        <Button size="small" color="error" onClick={() => setAjouterTache(false)}> Annuler l'ajout </Button>
                        <Button size="small" color="primary" onClick={() => { addTask(); setAjouterTache(false); }}> Valider </Button>
                    </>
                }
            </CardActions>
        </>
    );
}

function CurrentInterventionAction(props) {
    const [userId, setUserId] = useState();
    const [users, setUsers] = useState([]);
    const [usersTechnicien, setUsersTechnicien] = useState([]);
    const [editModal, setEditModal] = useState(false);
    const [assignTechCurrentinterModal, setAssignTechCurrentinterModal] = useState(null);

    const handleClickChangeCurrentInterTech = (event) => setAssignTechCurrentinterModal(event.currentTarget);
    const handleCloseChangeCurrentInterTech = () => setAssignTechCurrentinterModal(null);

    console.log('lalalala', props)

    const selectTechForCurrentInter = (uuidTech) => {
        let oldTech = props.technicien;
        console.log('oldTech', oldTech)
        firebase.firestore().collection('interventions').doc(props.codeInter + '').update({ "technicien": uuidTech }).then(function () {

            firebase.firestore().collection('users').doc(oldTech).update({
                ['interventionsList.' + props.codeInter]: firebase.firestore.FieldValue.delete()
            }).then(function () {
                firebase.firestore().collection('users').doc(uuidTech).update({
                    ['interventionsList.' + props.codeInter]: props.dateInter,
                }).then(function () {
                    console.log('Firebase - Intervention réaffectée : ' + uuidTech);
                    handleCloseChangeCurrentInterTech();
                }).catch(e => console.log(e));
            }).catch(e => console.log(e));
        }).catch(function (error) {
            console.error("Firebase - Erreur lors de la réaffectation de l'intervention: ", error);
        });
    };

    const suppressCurrentInter = () => {
        firebase.firestore().collection('interventions').doc(props.codeInter + '').delete().then(function () {
            console.log('Firebase - Intervention supprimée : ' + props.codeInter);
        }).catch(function (error) {
            console.error("Firebase - Erreur lors de la réaffectation de l'intervention: ", error);
        });
    };

    const updateCurrentInterState = (etat) => {
        firebase.firestore().collection('interventions').doc(props.codeInter + '').update({ "etat": etat }).then(function () {
            console.log('Firebase - changement de l\'etat de l\'Intervention  : ' + etat);
        }).catch(function (error) {
            console.error("Firebase - Erreur lors de la réaffectation de l'intervention: ", error);
        });

        if (etat === 'Finalisée') {

            let nbInter = '';
            let nUsers = users.map(u => {
                if (props.technicien === u.id) {
                    nbInter = u.nbInter + 1;
                    u.nbInter = nbInter;
                }
                return u;
            });

            setUsers(nUsers);
            console.log('NbInter: ', nbInter, nUsers);

            if (nbInter === '') return;

            firebase.firestore().collection('users').doc(props.technicien).update({ "nbInter": nbInter + 1 }).then(function () {
                console.log('Firebase - ajout d\'une intervention au technicien  : ' + nbInter + 1);
            }).catch(function (error) {
                console.error("Firebase - Erreur lors de la réaffectation de l'intervention: ", error);
            });
        }
    };

    const updateCurrentInterSyndic = () => {

        firebase.firestore().collection('interventions').doc(props.codeInter + '').update({ 'agence': props.syndic }).then(function () {
            console.log('Firebase - Intervention modifié : ' + props.codeInter);
            props.close();
        }).catch(function (error) {
            console.error("Firebase - Erreur lors de la modif de l'intervention: ", error);
        });
    };

    return (
        <>
            {(props.agence === props.syndic) && (props.etat === 'En attente' || props.etat === 'SAV') && <div key="wrapper_0" className="actionBtnWrapper">
                <TooltipBtn title="Supprimer"><IconButton onClick={suppressCurrentInter} aria-label="delete" style={{ color: 'white' }}><DeleteIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Réaffecter"><IconButton onClick={handleClickChangeCurrentInterTech} aria-label="affect" style={{ color: 'white' }}><PersonIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Editer"><IconButton onClick={() => setEditModal(true)} aria-label="edit" style={{ color: 'white' }}><EditIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Annuler"><IconButton onClick={() => updateCurrentInterState('Annulée')} aria-label="annuler" style={{ color: 'white' }}><CloseIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Terminer"><IconButton onClick={() => updateCurrentInterState('Finalisée')} aria-label="terminer" style={{ color: 'white' }}><CheckIcon /></IconButton></TooltipBtn>
            </div>}
            {(props.agence === props.syndic) && props.etat === 'En cours' && <div key="wrapper_0" className="actionBtnWrapper">
                <TooltipBtn title="SAV"><IconButton onClick={() => updateCurrentInterState('SAV')} aria-label="reactiver" style={{ color: 'white' }}><AnnouncementIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Editer"><IconButton onClick={() => setEditModal(true)} aria-label="edit" style={{ color: 'white' }}><EditIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Terminer"><IconButton onClick={() => updateCurrentInterState('Finalisée')} aria-label="terminer" style={{ color: 'white' }}><CheckIcon /></IconButton></TooltipBtn>
            </div>}
            {(props.agence === props.syndic) && (props.etat === 'Terminée' || props.etat === 'PasTerminée') && <div key="wrapper_0" className="actionBtnWrapper">
                <TooltipBtn title="SAV"><IconButton onClick={() => updateCurrentInterState('SAV')} aria-label="reactiver" style={{ color: 'white' }}><AnnouncementIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Terminer"><IconButton onClick={() => updateCurrentInterState('Finalisée')} aria-label="terminer" style={{ color: 'white' }}><CheckIcon /></IconButton></TooltipBtn>
            </div>}
            {(props.agence === props.syndic) && props.etat === 'Refusée' && <div key="wrapper_0" className="actionBtnWrapper">
                <TooltipBtn title="Supprimer"><IconButton onClick={suppressCurrentInter} aria-label="delete" style={{ color: 'white' }}><DeleteIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Réactiver"><IconButton onClick={() => updateCurrentInterState('En attente')} aria-label="reactiver" style={{ color: 'white' }}><FlipCameraAndroidIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Editer"><IconButton onClick={() => setEditModal(true)} aria-label="edit" style={{ color: 'white' }}><EditIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Annuler"><IconButton onClick={() => updateCurrentInterState('Annulée')} aria-label="annuler" style={{ color: 'white' }}><CloseIcon /></IconButton></TooltipBtn>
            </div>}
            {(props.agence === props.syndic) && props.etat === 'Annulée' && <div key="wrapper_0" className="actionBtnWrapper">
                <TooltipBtn title="Réactiver"><IconButton onClick={() => updateCurrentInterState('En attente')} aria-label="reactiver" style={{ color: 'white' }}><FlipCameraAndroidIcon /></IconButton></TooltipBtn>
            </div>}
            {(props.agence === props.syndic) && props.etat === 'Finalisée' && <div key="wrapper_0" className="actionBtnWrapper">
                <TooltipBtn title="SAV"><IconButton onClick={() => updateCurrentInterState('SAV')} aria-label="reactiver" style={{ color: 'white' }}><AnnouncementIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Facturée"><IconButton onClick={() => updateCurrentInterState('Facturée')} aria-label="delete" style={{ color: 'white' }}><AssignmentTurnedInIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Payée"><IconButton onClick={() => updateCurrentInterState('Payée')} aria-label="delete" style={{ color: 'white' }}><EuroIcon /></IconButton></TooltipBtn>
            </div>}
            {(props.agence === props.syndic) && props.etat === 'Facturée' && <div key="wrapper_0" className="actionBtnWrapper">
                <TooltipBtn title="SAV"><IconButton onClick={() => updateCurrentInterState('SAV')} aria-label="reactiver" style={{ color: 'white' }}><AnnouncementIcon /></IconButton></TooltipBtn>
                <TooltipBtn title="Payée"><IconButton onClick={() => updateCurrentInterState('Payée')} aria-label="delete" style={{ color: 'white' }}><EuroIcon /></IconButton></TooltipBtn>
            </div>}
            {(props.agence !== props.syndic) && <div key="wrapper_0" className="actionBtnWrapper">
                <TooltipBtn title="Affecter au calendrier"><IconButton onClick={updateCurrentInterSyndic} aria-label="delete" style={{ color: 'white' }}><SwapHorizIcon /></IconButton></TooltipBtn>
            </div>}

            <Menu anchorEl={assignTechCurrentinterModal} keepMounted open={Boolean(assignTechCurrentinterModal)} onClose={() => handleCloseChangeCurrentInterTech(null)} >
                {usersTechnicien.map((t, index) => <MenuItem key={index} value={t.id} onClick={() => selectTechForCurrentInter(t.id)}>{t.nom + ' ' + t.prenom}</MenuItem>)}
            </Menu>

            <InterventionModal mode="editItem" open={editModal} close={() => setEditModal(false)} inter={props} userId={userId} syndic={props.syndic} techniciens={usersTechnicien} />
        </>
    );
}

export default CurrentIntervention;
