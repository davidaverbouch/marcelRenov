import React from 'react';
import { useState, useEffect } from "react";

import 'firebase/firestore';
import 'firebase/storage';
import firebase from 'firebase/app';

import noThumbnail from './no-thumbnail.jpg';

import fetch from 'node-fetch';

import CancelIcon from '@material-ui/icons/Cancel';
import { Typography, FormControl, InputLabel, Select, TextField, Button, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, Slide } from '@material-ui/core';

import Autocomplete from '@material-ui/lab/Autocomplete';

import { subMinutes } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider, } from "@material-ui/pickers";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function InterventionModal(props) {
    const [gestionnaireId, setGestionnaireId] = useState('');
    const [codeInter, changeCodeInter] = useState(0);
    const [date, changeDate] = useState(new Date());
    const [heureFin, changeHeureFin] = useState(1);
    const [idClient, changeIdClient] = useState('');
    const [adresseClient, changeAdresseClient] = useState('');
    const [adressePos, changeAdressePos] = useState({ lat: '', lon: '' });
    const [telMobile, changeTelMobile] = useState('');
    const [telFixe, changeTelFixe] = useState('');
    const [materielTask, changeMaterielTask] = useState('');
    const [technicienInter, changeTechnicienInter] = useState('');
    const [errors, setErrors] = useState([]);
    const [resultAddr, setResultAddr] = useState([]);
    const [addTask, setAddTask] = useState([{
        title: '',
        description: '',
        image: noThumbnail,
        errors: []
    }]);
    const storageRef = firebase.storage().ref();

    const changeDuree = (event) => changeHeureFin(event.target.value);
    const changeTechnicien = (event) => changeTechnicienInter(event.target.value);

    useEffect(() => {
        if (props.open && props.mode === "editItem" && props.inter) {
            props.inter.codeInter && changeCodeInter(parseInt(props.inter.codeInter));
            changeDate(props.inter.dateInter.toDate())
            props.inter.names && changeIdClient(unescape(props.inter.names));
            changeHeureFin((parseFloat(props.inter.duree) * 4))
            changeAdresseClient(unescape(props.inter.addrText));
            changeTelFixe(unescape(props.inter.tel.fix));
            changeTelMobile(unescape(props.inter.tel.mobile));
            changeMaterielTask(unescape(props.inter.materiel.join(', ')));
            changeTechnicienInter(unescape(props.inter.technicien));
            console.log("Mode edit", props.inter);
        }

        props.date && changeDate(new Date(props.date));
        props.userId && props.userId !== gestionnaireId && setGestionnaireId(props.userId)
    }, [props])

    const addTaskToList = () => {
        let nTask = { title: '', description: '', image: noThumbnail, errors: [] };
        let oldTask = addTask.map((o, i) => o)
        oldTask.push(nTask);
        console.log(noThumbnail);
        setAddTask(oldTask);
    };

    const suppressTaskToList = (index) => {
        let oldTask = addTask.map((o, i) => o)
        if (oldTask.length > 1) oldTask.splice(index, 1);
        setAddTask(oldTask);
    };

    const updateTitleTask = (index, value) => {
        let oldTask = addTask.map((o, i) => o);
        oldTask[index].title = value;
        setAddTask(oldTask);
    };

    const updateDescriptionTask = (index, value) => {
        let oldTask = addTask.map((o, i) => o);
        oldTask[index].description = value;
        setAddTask(oldTask);
    };

    const updateImageTask = (index, value, namefile) => {
        let oldTask = addTask.map((o, i) => o);
        oldTask[index].image = namefile;
        oldTask[index].imageUrl = value;
        setAddTask(oldTask);
    };

    const checkValueNotEmpty = () => {
        const keyToTest = [
            { val: codeInter, name: 'codeInter' },
            { val: props.syndic, name: 'syndic' },
            { val: date, name: 'date' },
            { val: heureFin, name: 'heureFin' },
            { val: materielTask, name: 'materielTask' },
            { val: technicienInter, name: 'technicienInter' },
            { val: telMobile, name: 'telMobile' },
            { val: adresseClient, name: 'adresseClient' },
            { val: idClient, name: 'idClient' }
        ];

        let newErrors = [];
        keyToTest.forEach((o, i) => { if (!o.val) newErrors.push(o.name); });
        setErrors(newErrors);

        if (props.mode === "editItem") return newErrors.length === 0;

        let tasksError = addTask.map((t, i) => !checkValueTaskNotEmpty(i));
        (tasksError.indexOf(true) !== -1) && newErrors.push('Task');
        return newErrors.length === 0;
    };

    const checkValueTaskNotEmpty = (i) => {
        const x = addTask.map((o, i) => o);
        const keyToTest = [
            { val: x[i].title, name: 'title' },
            { val: x[i].description, name: 'description' },
            // {val: x[i].image, name: 'image'}
        ];

        x[i].errors = [];
        keyToTest.forEach((o, idx) => { if (!o.val) x[i].errors.push(o.name); });
        setAddTask(x);
        return x[i].errors.length === 0;
    };

    const formatHoursString = () => {
        let h = date.getHours();
        let m = date.getMinutes();

        if (h < 10) h = '0' + h;
        if (m < 10) m = '0' + m;

        let dateFin = subMinutes(date, -(heureFin * 15))
        let hFin = dateFin.getHours();
        let mFin = dateFin.getMinutes();

        if (hFin < 10) hFin = '0' + hFin;
        if (mFin < 10) mFin = '0' + mFin;

        return h + 'h' + m + ' à ' + hFin + 'h' + mFin;
    };

    const getRoundDate = () => {
        let m = date.getMinutes();
        let quart = Math.round(m / 15);

        date.setMinutes(quart * 15);
        return date;
    };

    const saveTask = () => {
        if (!checkValueNotEmpty()) return;
        if (props.mode === "editItem") { updateTask(); return; }

        let agence = props.syndic;
        let day = date.toISOString().replace(/T(.*)/, '');
        let hour = date.toLocaleTimeString();
        let dateInter = day + ' ' + hour;
        let duree = heureFin / 4;
        let technicien = technicienInter;
        let intervention = {
            tel: { mobile: telMobile },
            addr: escape(adresseClient),
            hours: formatHoursString(),
            names: escape(idClient),
            materiel: materielTask.split(',').map((m, i) => escape(m.trim()))
        };
        let etat = 'En attente';
        let json = { codeInter, agence, dateInter, duree, technicien, intervention: JSON.stringify(intervention), etat };
        let tachesToAdd = [];

        addTask.map((t, i) => {
            tachesToAdd.push({
                etat: "Non réalisé",
                retourCommentaire: "",
                retourEtat: 0,
                retourPhoto: "",
                retourRaison: "",
                tache: {
                    title: escape(t.title),
                    description: escape(t.description),
                    image: t.image
                }
            });
        });

        const dataToAdd = {
            addr: new firebase.firestore.GeoPoint(parseFloat(adressePos.lat), parseFloat(adressePos.lon)),
            addrText: intervention.addr,
            agence: agence,
            dateInter: firebase.firestore.Timestamp.fromDate(date),
            duree: duree,
            etat: "En attente",
            gestionnaire: gestionnaireId,
            hours: intervention.hours,
            materiel: intervention.materiel,
            lastMinute: (day === new Date().toISOString().replace(/T(.*)/, '')) ? true : false,
            names: intervention.names,
            taches: tachesToAdd,
            technicien: technicien,
            tel: {
                mobile: intervention.tel.mobile
            }
        };

        firebase.firestore().collection('interventions').doc(codeInter).set(dataToAdd).then(function () {
            console.log('Firebase - Intervention ajoutée : ' + codeInter);
            props.close();
        }).catch(function (error) { console.error("Firebase - Erreur lors de l'ajout de l'intervention: ", error); });

        firebase.firestore().collection('users').doc(technicien).update({
            ['interventionsList.' + codeInter]: firebase.firestore.Timestamp.fromDate(date),
            notifications: firebase.firestore.FieldValue.arrayUnion({
                deQui: gestionnaireId,
                etat: "unread",
                quand: firebase.firestore.Timestamp.fromDate(new Date()),
                quoi: { [codeInter]: "En Attente" },
                type: "etatIntervention"
            })
        }).then(function () {
            console.log('Firebase - Intervention ajoutée à l\'utilisateur : ' + technicien);
            props.addMessageWhenNewInter(codeInter, technicien);
        }).catch(function (error) {
            console.error("Firebase - Erreur lors de l'ajout de l'intervention: ", error);
        });

        console.log(json);
        console.log('addTask', addTask);
    };

    const updateTask = () => {
        let agence = props.syndic;
        let day = date.toISOString().replace(/T(.*)/, '');
        let hour = date.toLocaleTimeString();
        let dateInter = day + ' ' + hour;
        let duree = heureFin / 4;
        let technicien = technicienInter;
        let intervention = {
            tel: { mobile: telMobile },
            addr: escape(adresseClient),
            hours: formatHoursString(),
            names: escape(idClient),
            materiel: materielTask.split(',').map((m, i) => escape(m.trim()))
        };

        const dataToAdd = {
            "addrText": intervention.addr,
            "agence": agence,
            "dateInter": firebase.firestore.Timestamp.fromDate(date),
            "duree": duree,
            "hours": intervention.hours,
            "materiel": intervention.materiel,
            "names": intervention.names,
            "technicien": technicien,
            "tel.mobile": intervention.tel.mobile,
            "lastMinute": (day === new Date().toISOString().replace(/T(.*)/, '')) ? true : false
        };

        if (adressePos.lat) dataToAdd.addr = new firebase.firestore.GeoPoint(parseFloat(adressePos.lat), parseFloat(adressePos.lon));


        firebase.firestore().collection('interventions').doc(codeInter + '').update(dataToAdd).then(function () {
            console.log('Firebase - Intervention modifié : ' + codeInter);
            props.close();
        }).catch(function (error) {
            console.error("Firebase - Erreur lors de la modif de l'intervention: ", error);
        });

        firebase.firestore().collection('users').doc(technicienInter).update({
            notifications: firebase.firestore.FieldValue.arrayUnion({
                deQui: gestionnaireId,
                etat: "unread",
                quand: firebase.firestore.Timestamp.fromDate(new Date()),
                quoi: { codeInter: codeInter },
                type: "updateIntervention"
            })
        }).then(function () {
            console.log('Firebase - Intervention ajoutée à l\'utilisateur : ' + technicien);
            // props.addMessageWhenNewInter(codeInter, technicien);
        }).catch(function (error) { console.error("Firebase - Erreur lors de l'ajout de l'intervention: ", error); });
    };

    const saveImg = (file, i) => {
        if (!file) return;
        let uploadTask = storageRef.child(file.name).put(file);

        console.log(file.name, file, i)

        uploadTask.on('state_changed',
            (snapshot) => {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                switch (error.code) {
                    case 'storage/unauthorized':
                        console.log('User doesn\'t have permission to access the object', error);
                        break;
                    case 'storage/canceled':
                        console.log('download canceled', error);
                        break;
                    default:
                        console.log(error);
                        break;
                }
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    updateImageTask(i, downloadURL, file.name);
                });
            }
        );
    };

    let timeoutResultAddr;
    const geoposition = (pos) => {
        setResultAddr([]);
        if (pos === '') return;
        let addressEncoded = encodeURIComponent(pos);
        let url = "https://api-adresse.data.gouv.fr/search/?q=" + addressEncoded;
        fetch(url).then(d => d.json().then(d => {
            d = d.features.map(d => { return { text: d.properties.label, lat: d.geometry.coordinates[1], lng: d.geometry.coordinates[0] } });
            timeoutResultAddr && clearTimeout(timeoutResultAddr);
            timeoutResultAddr = setTimeout(() => { setResultAddr(d); });
        })).catch(e => console.log(e));
    }

    return (
        <Dialog open={props.open} TransitionComponent={Transition} keepMounted onClose={props.close} >
            <DialogTitle style={{ textAlign: 'center' }}>{props.mode === "addItem" ? "Nouvelle Intervention" : "Editer l'intervention"}</DialogTitle>
            <DialogContent>
                <div style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'baseline', borderBottom: '1px solid #eee', paddingBottom: '2.5em', marginBottom: '.5em' }}>
                    <TextField style={{ marginRight: '16px' }} error={errors.indexOf('codeInter') !== -1} value={codeInter} onChange={(e) => changeCodeInter(e.target.value)} autoFocus margin="dense" label="N° inter" placeholder="3242" type="number" />
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                        <KeyboardDatePicker
                            style={{ marginRight: '16px' }}
                            label="Date de l'inter"
                            variant="inline"
                            format="dd/MM/yyyy"
                            openTo="date"
                            error={errors.indexOf('date') !== -1}
                            value={date}
                            onChange={changeDate}
                        />
                    </MuiPickersUtilsProvider>
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                        <KeyboardTimePicker
                            style={{ marginRight: '16px' }}
                            ampm={false}
                            minutesStep={15}
                            variant="inline"
                            label="Heure de début"
                            error={errors.indexOf('date') !== -1}
                            value={getRoundDate()}
                            onChange={changeDate}
                        />
                    </MuiPickersUtilsProvider>
                    <FormControl style={{ minWidth: '96px' }}>
                        <InputLabel id="heureFinLabel">Durée</InputLabel>
                        <Select labelId="heureFinLabel" value={heureFin} onChange={changeDuree} >
                            <MenuItem value={1}>15mn</MenuItem>
                            <MenuItem value={2}>30mn</MenuItem>
                            <MenuItem value={3}>45mn</MenuItem>
                            <MenuItem value={4}>1h</MenuItem>
                            <MenuItem value={5}>1h15</MenuItem>
                            <MenuItem value={6}>1h30</MenuItem>
                            <MenuItem value={7}>1h45</MenuItem>
                            <MenuItem value={8}>2h</MenuItem>
                            <MenuItem value={9}>2h15</MenuItem>
                            <MenuItem value={10}>2h30</MenuItem>
                            <MenuItem value={11}>2h45</MenuItem>
                            <MenuItem value={12}>3h</MenuItem>
                            <MenuItem value={13}>3h15</MenuItem>
                            <MenuItem value={14}>3h30</MenuItem>
                            <MenuItem value={15}>3h45</MenuItem>
                            <MenuItem value={16}>4h</MenuItem>
                            <MenuItem value={17}>4h15</MenuItem>
                            <MenuItem value={18}>4h30</MenuItem>
                            <MenuItem value={19}>4h45</MenuItem>
                            <MenuItem value={20}>5h</MenuItem>
                            <MenuItem value={21}>5h15</MenuItem>
                            <MenuItem value={22}>5h30</MenuItem>
                            <MenuItem value={23}>5h45</MenuItem>
                            <MenuItem value={24}>6h</MenuItem>
                        </Select>
                    </FormControl>
                </div>
                <div style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'baseline', borderBottom: '1px solid #eee', paddingBottom: '2.5em', marginBottom: '.5em' }}>
                    <div style={{ marginRight: '16px', flex: 3 }}>
                        <TextField margin="dense" error={errors.indexOf('idClient') !== -1} value={unescape(idClient)} onChange={(e) => changeIdClient(e.target.value)} label="Identité du client" type="text" fullWidth />
                        <TextField onBlur={() => { setTimeout(() => setResultAddr([]), 150); }} margin="dense" error={errors.indexOf('adresseClient') !== -1} value={unescape(adresseClient)} onChange={(e) => { changeAdresseClient(e.target.value); geoposition(e.target.value); }} label="Adresse du client" type="text" fullWidth />
                        <div style={{ position: 'relative' }}>
                            {resultAddr.length > 0 && (
                                <div style={{ position: 'absolute', background: 'white', zIndex: 10, left: 0, right: 0, border: '1px solid #aaa', padding: '8px', top: '-5px' }}>
                                    {resultAddr.map(o => (
                                        <div className="choiceAddr" style={{ cursor: 'pointer' }} onClick={() => { changeAdressePos({ lon: o.lng, lat: o.lat }); changeAdresseClient(o.text); setResultAddr([]) }}>
                                            <span>{o.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <TextField margin="dense" error={errors.indexOf('telMobile') !== -1} value={telMobile} onChange={(e) => changeTelMobile(e.target.value)} label="Téléphone mobile" type="tel" />
                    </div>
                </div>
                <div style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'baseline', borderBottom: '1px solid #eee', paddingBottom: '2.5em', marginBottom: '.5em' }}>
                    <TextField style={{ flex: 3 }} margin="dense" label="Matériel requis (ex: outils, niveau, ...)" error={errors.indexOf('materielTask') !== -1} value={unescape(materielTask)} onChange={(e) => changeMaterielTask(e.target.value)} placeholder="Separer par des virgules" type="text" fullWidth />
                    <FormControl style={{ minWidth: '128px', marginLeft: '16px', flex: 1 }}>
                        <InputLabel id="technicienLabel">Technicien</InputLabel>
                        <Select labelId="technicienLabel" error={errors.indexOf('technicienInter') !== -1} value={technicienInter} onChange={changeTechnicien} >
                            {props.techniciens.map((t, index) => {
                                return <MenuItem key={index} value={t.id}>{t.nom + ' ' + t.prenom}</MenuItem>
                            })}
                        </Select>
                    </FormControl>
                </div>
                {props.mode === "addItem" && addTask.map((t, i) => {
                    return <div key={i} className="addTaskWrapper">
                        <span className="addTaskWrapper_delete" onClick={() => suppressTaskToList(i)}><CancelIcon style={{ color: '#aaa', cursor: 'pointer' }} /></span>
                        <div style={{ flex: 3 }}>
                            <TextField key={i + '_1'} margin="dense" label={"Tache n°" + (i + 1)} error={t.errors.indexOf('title') !== -1} value={t.title} onChange={(e) => updateTitleTask(i, e.target.value)} placeholder="Titre de la tache" type="text" fullWidth />
                            <TextField key={i + '_2'} multiline margin="dense" label="Description" error={t.errors.indexOf('description') !== -1} value={t.description} onChange={(e) => updateDescriptionTask(i, e.target.value)} placeholder="Description de la tache" type="text" fullWidth />
                        </div>
                        <div style={{ flex: 1, marginLeft: '16px', position: 'relative' }}>
                            <Typography key={i + '_3'} component="div" style={{ marginBottom: '3px' }}>
                                <img src={t.imageUrl || noThumbnail} alt="description" style={{ width: '100%', minHeight: '92px' }} />
                                <TextField className="addTacheImg" type="file" inputProps={{ accept: 'image/*' }} onChange={e => saveImg(e.target.files[0], i)} label="Image" size="small" variant="standard" />
                            </Typography>
                        </div>
                    </div>
                })}
                {props.mode === "addItem" && <Button size="small" color="primary" variant="outlined" style={{ margin: '1em auto', display: 'flex' }} onClick={addTaskToList}>Ajouter une tache</Button>}
            </DialogContent>
            <DialogActions>
                <Button onClick={saveTask} color="primary">Valider</Button>
            </DialogActions>
        </Dialog>
    );
}