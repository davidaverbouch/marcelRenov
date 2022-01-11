import { useEffect, useState, useRef } from "react";

import { CalendarWrapper, CalendarDetailDiv, CalendarRowDiv, Case, CaseSpan, InterventionButton } from "./CalendarStyledEl";
import moment from 'moment';
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { KeyboardDatePicker, KeyboardTimePicker, KeyboardDateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

import { Fab, FormControl, InputLabel, Select, Menu, MenuItem, Paper, InputBase, IconButton, Grow, Slide, Collapse, Modal, TextField, Button } from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import OfflinePinIcon from '@material-ui/icons/OfflinePin';

import Autocomplete from '@material-ui/lab/Autocomplete';

import { useSelector, useDispatch } from 'react-redux';
import {
    setOpenDetail,
    getCurrentDate,
    getSyndics,
    getUsers,
    getInterventions,
    getCurrentSyndic,
    getCurrentIntervention,
    getCurrentInterventionId,
    getCurrentGestionnaireId,
    detailIsOpen,
    setCurrentDate,
    setCurrentIntervention,
    setCurrentSyndic,
    addIntervention,
    searchInfo
} from './features/calendar/CalendarSlice';

import { addInterRedux, editInterRedux, deleteInterRedux, reaffectInterRedux, stateInterRedux, addUserInterventionList, addReducedInfo, getInter } from './firebaseConfig';

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

function colorize(colorVar) {
    if (colorVar === 'en attente') return 'var(--enAttente)';
    if (colorVar === 'en cours') return 'var(--enCours)';
    if (colorVar === 'réalisé') return 'var(--realise)';
    if (colorVar === 'non réalisé') return 'var(--nonRealise)';
    if (colorVar === 'annulé') return 'var(--annule)';
    if (colorVar === 'facturé') return 'var(--facture)';
    if (colorVar === 'payé') return 'var(--paye)';
    return '';
}

function Calendar(props) {
    const employes = useSelector(getUsers);
    const currentDate = useSelector(getCurrentDate);

    return (
        <div className="CalendarComponent">
            <CalendarAction />
            <CalendarWrapper>
                <CalendarRow nbQuarter={props.nbQuarter} showRules />
                {employes && Object.entries(employes).map((o, i) => (o[1].role === 'technicien') && <CalendarRow key={i} curdate={currentDate} nbQuarter={props.nbQuarter} indexRow={i} user={{ ...o[1], uuid: o[0] }} showHead />)}
                <CalendarRow nbQuarter={props.nbQuarter} showRules />
            </CalendarWrapper>
            <CalendarDetail />
        </div>
    );
}

function CalendarAction(props) {
    const [addInter, setAddInter] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    const dispatch = useDispatch();
    const employes = useSelector(getUsers);
    const syndics = useSelector(getSyndics);
    const syndic = useSelector(getCurrentSyndic);
    const currentDate = useSelector(getCurrentDate);
    const searchInfoTab = useSelector(searchInfo);

    const changeDate = (date) => {
        dispatch(setCurrentDate(date + ''))
    }

    const transformDate = () => {
        let tmpDate = currentDate.split('/');
        return `${tmpDate[2]}-${tmpDate[1]}-${tmpDate[0]}`;
    }

    const openInterSearched = (interId) => {
        console.log(interId)
        getInter(interId, (i) => {
            dispatch(addIntervention(i));
            setTimeout(() => {
                dispatch(setCurrentIntervention(interId));
                dispatch(setOpenDetail(true));
            })
        });
    }

    useEffect(() => {
        const searchRes = searchInfoTab.filter(info => ((info.etat.toLowerCase().indexOf(searchVal) > -1) || (info.keywords.join(',').toLowerCase().indexOf(searchVal) > -1)));
        setSearchResult(searchRes);
    }, [searchVal, searchInfoTab])

    return (
        <div style={{ display: 'flex', margin: '16px 24px', flexWrap: 'wrap' }}>
            <div className="AjouterIntervention" style={{ minWidth: 128, justifyContent: 'center', display: 'flex' }}>
                <Fab color="primary" aria-label="add" onClick={() => { setAddInter(true); }}>
                    <AddIcon />
                </Fab>
            </div>
            <div style={{ display: 'flex', flex: 2 }}>
                <div className="SyndicWrapper" style={{ flex: 1, margin: '8px', display: 'flex', justifyContent: 'center' }}>
                    <FormControl size="small" style={{ minWidth: '100%' }}>
                        <InputLabel id="syndicsLabel">Syndic</InputLabel>
                        <Select value={syndic} onChange={e => { dispatch(setCurrentSyndic(e.target.value)) }} labelId="syndicsLabel" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                            {syndics && Object.values(syndics).map((o, i) => <MenuItem key={i} value={o.nom}>{o.nom}</MenuItem>)}
                        </Select>
                    </FormControl>
                </div>
                <div style={{ flex: 1, margin: '8px', display: 'flex', justifyContent: 'center', background: '#fff' }}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                        <KeyboardDatePicker
                            ampm={false}
                            label="Date"
                            variant="inline"
                            inputVariant="outlined"
                            format="dd/MM/yyyy"
                            openTo="date"
                            size="small"
                            value={new Date(transformDate())}
                            inputValue={currentDate}
                            style={{ borderColor: '#3f51b5', color: '#3f51b5', width: '100%' }}
                            onChange={changeDate}
                        />
                    </MuiPickersUtilsProvider>
                </div>
            </div>
            <div className="gutterCalendar" style={{ position: 'relative' }}>
                <Paper component="form" variant="outlined" style={{ transition: '.5s all ease-in-out', border: '1px solid #3f51b5', height: searchVal ? '342px' : '38px', zIndex: 60, position: 'absolute', top: 0, left: 0, right: 0, background: '#fff' }}>
                    <div style={{ display: 'flex', paddingLeft: 16 }}>
                        <InputBase value={searchVal} onChange={e => setSearchVal(e.target.value.toLowerCase())} fullWidth placeholder="Chercher une intervention :" size="small" inputProps={{ style: { padding: '4px 0' } }} />
                        <IconButton color="primary" size="medium" style={{ flex: 1, padding: 8 }} type="submit"><SearchIcon /></IconButton>
                    </div>
                    <div style={{ height: searchVal ? 300 : 0, transition: '.5s all ease-in-out', overflow: 'hidden' }}>
                        <div style={{ padding: '8px 16px', overflow: 'auto', height: '100%' }}>
                            {searchResult.map((o, i) => (
                                <div onClick={e => openInterSearched(o.uid)} key={i} style={{ background: colorize(o.etat), border: 'none', padding: 8, borderRadius: 8, margin: '14px 0', boxShadow: '0 14px 8px -10px rgb(70 70 70 / 50%)' }}>
                                    <p style={{ fontSize: 12, color: '#fff', margin: 4, cursor: 'pointer' }}><b style={{ color: '#f1f9f9' }}>{o.keywords[0]}</b> - <b>{o.keywords[2]}</b> {o.keywords[3]} - <b>{o.keywords[1]}</b><br /><b style={{ fontSize: 11, color: '#f1f9f9' }}>{o.keywords[4]}</b><br /><b style={{ fontSize: 11, color: '#f1f9f9' }}>{o.keywords[5]}{o.keywords.length >= 6 && employes[o.keywords[6]] && ' - assigné à ' + employes[o.keywords[6]].nom + ' ' + employes[o.keywords[6]].prenom}</b></p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Paper>
            </div>
            <CalendarAjoutEdit open={addInter} onClose={() => setAddInter(false)} />
        </div>
    );
}

function CalendarAjoutEdit(props) {
    // redux datas
    const employes = useSelector(getUsers);
    const syndics = useSelector(getSyndics);
    const syndic = useSelector(getCurrentSyndic);
    const gestionnaireId = useSelector(getCurrentGestionnaireId);
    const currentDate = useSelector(getCurrentDate);

    const transformDate = () => {
        let tmpDate = currentDate.split('/');
        return `${tmpDate[2]}-${tmpDate[1]}-${tmpDate[0]} 09:00:00`;
    }

    // hook
    const [time, setTime] = useState(new Date(transformDate()));
    const [open, setOpen] = useState(props.open);
    const [errors, setErrors] = useState({
        id: false,
        technicien: false,
        gestionnaire: false,
        agence: false,
        date: false,
        nom: false,
        prenom: false,
        adresse: false,
        telMobile: false,
        titre: false,
        taches: [{
            titre: false,
            description: false
        }]
    });
    const [techniciens, setTechniciens] = useState();
    const [gestionnaireSelected, setGestionnaireSelected] = useState();
    const [tachesLen, setTachesLen] = useState(1);
    const [adressePos, changeAdressePos] = useState({ lat: '', lon: '' });
    const [resultAddr, setResultAddr] = useState([]);
    const [taches, setTaches] = useState((props.currentInt && [...props.currentInt.taches]) || [{
        state: 'en attente',
        titre: '',
        description: '',
        image: [],
        retourCommentaire: null,
        retourEtat: 0,
        retourPhoto: "",
        retourRaison: null
    }]);
    const [newInter, setNewInter] = useState(props.currentInt || {
        id: '',
        technicien: '',
        gestionnaire: '',
        agence: '',
        date: time.toLocaleDateString() + ' ' + time.toLocaleTimeString().substring(0, 5),
        duree: 1,
        nom: '',
        prenom: '',
        adresse: '',
        addr: [],
        telMobile: "",
        titre: '',
        etat: 'en attente',
        material: [],
        taches: []
    })

    // props is just for open or close modal
    useEffect(() => {
        if (!props.edit && props.open) {
            setNewInter({
                ...newInter,
                id: '',
                technicien: '',
                date: time.toLocaleDateString() + ' ' + time.toLocaleTimeString().substring(0, 5),
                duree: 1,
                nom: '',
                prenom: '',
                adresse: '',
                addr: [],
                telMobile: "",
                titre: '',
                material: [],
                taches: []
            });
            setTaches([{
                state: 'en attente',
                titre: '',
                description: '',
                image: [],
                retourCommentaire: null,
                retourEtat: 0,
                retourPhoto: "",
                retourRaison: null
            }]);
            setTachesLen(1);
        }
        setOpen(props.open);
        if (props.currentInt && JSON.stringify(props.currentInt) !== JSON.stringify(newInter)) {
            time.setHours(props.currentInt.date.split(' ')[1].split(':')[0], props.currentInt.date.split(' ')[1].split(':')[1]);
            setTime(time);
            setNewInter({ ...props.currentInt, date: time.toLocaleDateString() + ' ' + time.toLocaleTimeString().substring(0, 5) });
            setTaches([...props.currentInt.taches]);
            setResultAddr([{ text: props.currentInt.adresse, lat: props.currentInt.addr[0], lng: props.currentInt.addr[1] }]);
        }
    }, [props]);

    useEffect(() => {
        setTime(new Date(transformDate()));
        setNewInter({ ...newInter, date: time.toLocaleDateString() + ' ' + time.toLocaleTimeString().substring(0, 5) });
    }, [currentDate]);

    useEffect(() => {
        techniciens && techniciens[0] && techniciens[0][0] &&
            setNewInter({ ...newInter, technicien: techniciens[0][0], gestionnaire: gestionnaireId, agence: syndic })
    }, [techniciens]);

    useEffect(() => setNewInter({ ...newInter, date: time.toLocaleDateString() + ' ' + time.toLocaleTimeString().substring(0, 5) }), [time]);
    useEffect(() => setTechniciens(Object.entries(employes).filter((o, i) => (o[1].role === 'technicien'))), [employes]);
    useEffect(() => syndic && setNewInter({ ...newInter, agence: syndic }), [syndic]);
    useEffect(() => gestionnaireId && setGestionnaireSelected(gestionnaireId), [gestionnaireId]);
    useEffect(() => newInter && checkValue(newInter), [newInter]);

    const ajouterTache = () => {
        let t = [...taches];
        t.push({
            state: 'en attente',
            titre: '',
            description: '',
            image: [],
            retourCommentaire: null,
            retourEtat: 0,
            retourPhoto: "",
            retourRaison: null
        });
        setTaches(t);
        setTachesLen(t.length);
    }

    const supprimerTache = (i) => {
        let t = [...taches];
        t.splice(i, 1)
        setTaches(t);
        setTachesLen(t.length);
    }

    const updateTache = (index, key, value) => {
        let t = [...taches];
        let a = { ...t[index], [key]: value };
        t[index] = a;
        setNewInter({ ...newInter, taches: t });
        setTaches(t);
    }

    const saveImg = (file, i) => {
        if (!file) return;

        let uploadTask = ref(getStorage(), 'images/' + file.name);
        uploadBytes(uploadTask, file).then((snapshot) => {
            getDownloadURL(uploadTask).then(url => {
                let t = [...taches];
                let a = { ...t[i] };
                let tmp = [...a.image]
                tmp.push(url);
                t[i] = { ...a, image: tmp };
                setNewInter({ ...newInter, taches: t });
                setTaches(t);
            });
        });
        console.log(file.name, file, i)
    };

    const removeImg = (i, index) => {
        let t = [...taches];
        let a = { ...t[i] };
        let tmp = [...a.image]
        tmp.splice(index, 1);
        t[i] = { ...a, image: tmp };
        setNewInter({ ...newInter, taches: t });
        setTaches(t);
    };

    const checkValue = (val) => {
        let e = { ...errors };
        let res = {};
        let r = Object.entries(val).map((o, i) => {
            if (o[0] === 'taches') {
                if (o[1].length === 0) res.taches = true;
                else res.taches = o[1].map(obj => !(obj.titre && obj.titre !== '' && obj.description && obj.description !== ''));
            } else res[o[0]] = !(o[1] && o[1] !== '');
            return (o[0] !== 'taches') ? !(o[1] && o[1] !== '') : res[o[0]] = o[1].map(obj => obj.titre && obj.titre !== '' && obj.description && obj.description !== '');
        })
        setErrors({ ...e, ...res, taches: res.taches });
        return r.indexOf(true) >= 0;
    }

    const updatebd = () => {
        const tmp = {
            ...newInter,
            date: time.toLocaleDateString() + ' ' + time.toLocaleTimeString().substring(0, 5),
            gestionnaire: gestionnaireSelected,
            addr: [adressePos.lat, adressePos.lon]
        };
        setNewInter(tmp);
        console.log('Firebase - AddInter', tmp);
        if (!props.edit) {
            if (checkValue(tmp)) return;
            addInterRedux(tmp, ({ functionName, id }) => {
                console.log(functionName, id);
                addUserInterventionList({ ...tmp, uid: id }, ({ functionName, id }) => { console.log(functionName, id); });
                addReducedInfo({ ...tmp, uid: id }, ({ functionName, id }) => { console.log(functionName, id); });

                props.onClose();
            });
        } else {
            editInterRedux(tmp, ({ functionName, id }) => {
                console.log(functionName, id);
                addUserInterventionList({ ...tmp, uid: id }, ({ functionName, id }) => { console.log(functionName, id); });
                addReducedInfo({ ...tmp, uid: id }, ({ functionName, id }) => { console.log(functionName, id); });

                props.onClose();
            });
        }
    }

    const getRoundDate = () => {
        let m = time.getMinutes();
        let quart = Math.round(m / 15);

        time.setMinutes(quart * 15);
        return time;
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
        <Modal style={{ zIndex: 100, display: 'flex' }} open={open} onClose={e => { setOpen(false); props.onClose() }}>
            <Slide in={open} direction="down" mountOnEnter unmountOnExit>
                <div className="CalendarComponent CalendarModalComponent" style={{ position: 'relative', width: 768, maxWidth: '100%', height: '100vh', display: 'flex', flexDirection: 'column', margin: 'auto', padding: '8px 16px', borderRadius: 0, border: '2px solid #3f51b5', color: '#3f51b5', background: '#f1f9f9' }}>
                    {open && <>
                        <h4 style={{ color: '#3F51b5' }}>{props.edit ? 'Modifier l' : 'Nouvelle'} intervention</h4>
                        <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
                        <form style={{ overflow: 'auto', paddingBottom: 62 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                {!props.edit && <TextField error={errors.id} disabled={props.edit} value={newInter.id} onChange={e => setNewInter({ ...newInter, id: e.target.value })} style={{ margin: 8, background: '#fff' }} variant="outlined" label="id" size="small" placeholder="Identifiant du devis" />}
                                {!props.edit && <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                    <FormControl size="small" style={{ minWidth: '100%' }}>
                                        <InputLabel id="ajoutInter_technicien">Technicien</InputLabel>
                                        <Select error={errors.technicien} disabled={props.edit} value={newInter.technicien} onChange={e => setNewInter({ ...newInter, technicien: e.target.value })} labelId="ajoutInter_technicien" variant="outlined" style={{ borderColor: props.edit ? '' : '#3f51b5', color: props.edit ? '' : '#3f51b5' }}>
                                            {employes && Object.entries(employes).map((o, i) => (o[1].role === 'technicien') && <MenuItem key={i} value={o[0]}>{o[1].nom} {o[1].prenom}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </div>}
                                <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                    <FormControl size="small" style={{ minWidth: '100%' }}>
                                        <InputLabel id="ajoutInter_gestionnaire">Gestionnaire</InputLabel>
                                        <Select value={gestionnaireSelected} onChange={e => setGestionnaireSelected({ ...newInter, gestionnaire: e.target.value })} labelId="ajoutInter_gestionnaire" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                            {employes && Object.entries(employes).map((o, i) => (o[1].role === 'gestionnaire') && <MenuItem key={i} value={o[0]}>{o[1].nom} {o[1].prenom}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                    <FormControl size="small" style={{ minWidth: '100%' }}>
                                        <InputLabel id="ajoutInter_agence">Syndic attaché</InputLabel>
                                        <Select value={newInter.agence} onChange={e => setNewInter({ ...newInter, agence: e.target.value })} labelId="ajoutInter_agence" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                            {syndics && Object.entries(syndics).map((o, i) => <MenuItem key={i} value={o[1].nom}>{o[1].nom}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', margin: '12px auto 8px', width: '50%' }} />
                            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap' }}>
                                {!props.edit && <div style={{ flex: 1, minWidth: 200, margin: 8, display: 'flex', justifyContent: 'center', background: '#fff' }}>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                                        <KeyboardDatePicker
                                            autoOk
                                            ampm={false}
                                            label="Date de l'intervention"
                                            variant="inline"
                                            error={errors.date}
                                            disabled={props.edit}
                                            inputVariant="outlined"
                                            format="dd/MM/yyyy"
                                            openTo="date"
                                            size="small"
                                            value={time}
                                            onChange={setTime}
                                            style={{ borderColor: '#3f51b5', color: '#3f51b5', width: '100%' }}
                                        />
                                    </MuiPickersUtilsProvider>
                                </div>}
                                {!props.edit && <div style={{ flex: 1, minWidth: 200, margin: 8, display: 'flex', justifyContent: 'center', background: '#fff' }}>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                                        <KeyboardTimePicker
                                            autoOk
                                            label="Horaire de l'intervention"
                                            variant="inline"
                                            error={errors.date}
                                            disabled={props.edit}
                                            inputVariant="outlined"
                                            format="HH:mm"
                                            openTo="hours"
                                            size="small"
                                            ampm={false}
                                            minutesStep={15}
                                            value={getRoundDate()}
                                            onChange={setTime}
                                            style={{ borderColor: '#3f51b5', color: '#3f51b5', width: '100%' }}
                                        />
                                    </MuiPickersUtilsProvider>
                                </div>}
                                <div style={{ flex: 1, minWidth: 200, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                    <FormControl size="small" style={{ minWidth: '100%' }}>
                                        <InputLabel id="ajoutInter_duree">Durée de l'intervention</InputLabel>
                                        <Select value={newInter.duree} onChange={e => setNewInter({ ...newInter, duree: e.target.value })} labelId="ajoutInter_duree" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                            <MenuItem value={0}>0mn</MenuItem>
                                            <MenuItem value={.25}>15mn</MenuItem>
                                            <MenuItem value={.5}>30mn</MenuItem>
                                            <MenuItem value={.75}>45mn</MenuItem>
                                            <MenuItem value={1}>1h</MenuItem>
                                            <MenuItem value={1.25}>1h15mn</MenuItem>
                                            <MenuItem value={1.5}>1h30mn</MenuItem>
                                            <MenuItem value={1.75}>1h45mn</MenuItem>
                                            <MenuItem value={2}>2h</MenuItem>
                                            <MenuItem value={2.25}>2h15mn</MenuItem>
                                            <MenuItem value={2.5}>2h30mn</MenuItem>
                                            <MenuItem value={2.75}>2h45mn</MenuItem>
                                            <MenuItem value={3}>3h</MenuItem>
                                            <MenuItem value={3.25}>3h15mn</MenuItem>
                                            <MenuItem value={3.5}>3h30mn</MenuItem>
                                            <MenuItem value={3.75}>3h45mn</MenuItem>
                                            <MenuItem value={4}>4h</MenuItem>
                                            <MenuItem value={4.25}>4h15mn</MenuItem>
                                            <MenuItem value={4.5}>4h30mn</MenuItem>
                                            <MenuItem value={4.75}>4h45mn</MenuItem>
                                            <MenuItem value={5}>5h</MenuItem>
                                            <MenuItem value={5.25}>5h15mn</MenuItem>
                                            <MenuItem value={5.5}>5h30mn</MenuItem>
                                            <MenuItem value={5.75}>5h45mn</MenuItem>
                                            <MenuItem value={6}>6h</MenuItem>
                                            <MenuItem value={6.25}>6h15mn</MenuItem>
                                            <MenuItem value={6.5}>6h30mn</MenuItem>
                                            <MenuItem value={6.75}>6h45mn</MenuItem>
                                            <MenuItem value={7}>7h</MenuItem>
                                            <MenuItem value={7.25}>7h15mn</MenuItem>
                                            <MenuItem value={7.5}>7h30mn</MenuItem>
                                            <MenuItem value={7.75}>7h45mn</MenuItem>
                                            <MenuItem value={8}>8h</MenuItem>
                                            <MenuItem value={8.25}>8h15mn</MenuItem>
                                            <MenuItem value={8.5}>8h30mn</MenuItem>
                                            <MenuItem value={8.75}>8h45mn</MenuItem>
                                            <MenuItem value={9}>9h</MenuItem>
                                            <MenuItem value={9.25}>9h15mn</MenuItem>
                                            <MenuItem value={9.5}>9h30mn</MenuItem>
                                            <MenuItem value={9.75}>9h45mn</MenuItem>
                                            <MenuItem value={10}>10h</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', margin: '12px auto 8px', width: '50%' }} />
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', width: '100%', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', margin: 8, flex: 1 }}>
                                    <TextField error={errors.nom} value={newInter.nom} onChange={e => setNewInter({ ...newInter, nom: e.target.value })} style={{ flex: 1, maxWidth: '32%', background: '#fff' }} size="small" variant="outlined" label="Nom" placeholder="Nom du client" />
                                    <TextField error={errors.prenom} value={newInter.prenom} onChange={e => setNewInter({ ...newInter, prenom: e.target.value })} style={{ flex: 1, maxWidth: '32%', background: '#fff' }} size="small" variant="outlined" label="Prénom" placeholder="Prénom du client" />
                                    <TextField error={errors.telMobile} value={newInter.telMobile} onChange={e => setNewInter({ ...newInter, telMobile: e.target.value })} style={{ flex: 1, maxWidth: '32%', background: '#fff' }} size="small" variant="outlined" label="Portable" placeholder="Téléphone portable du client" />
                                </div>
                                <Autocomplete
                                    id="getAddress"
                                    options={resultAddr}
                                    size="small"
                                    autoHighlight={true}
                                    autoSelect={true}
                                    clearOnEscape={true}
                                    getOptionLabel={(option) => option.text}
                                    onChange={(event, newValue) => {
                                        setNewInter({ ...newInter, adresse: newValue.text, addr: [newValue.lat, newValue.lng] });
                                        changeAdressePos({ lon: newValue.lng, lat: newValue.lat });
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        setNewInter({ ...newInter, adresse: event.target.value });
                                        geoposition(newInputValue);
                                    }}
                                    style={{ margin: '0 8px', background: '#fff' }}
                                    renderInput={(params) => <TextField error={errors.adresse} value={newInter.adresse} size="small" variant="outlined" {...params} label="Adresse du client" />}
                                />
                            </div>
                            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', margin: '12px auto 8px', width: '50%' }} />
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', width: '100%', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', marginTop: 12 }}>
                                    <TextField error={errors.titre} value={newInter.titre} onChange={e => setNewInter({ ...newInter, titre: e.target.value })} style={{ margin: 8, flex: 2, background: '#fff' }} size="small" variant="outlined" label="Titre de l'intervention" placeholder="Titre de l'intervention" fullWidth />
                                    {!props.edit && <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                        <FormControl size="small" style={{ minWidth: '100%' }}>
                                            <InputLabel id="ajoutInter_etat">Etat</InputLabel>
                                            <Select disabled={props.edit} value={newInter.etat} onChange={e => setNewInter({ ...newInter, etat: e.target.value })} labelId="ajoutInter_etat" variant="outlined" style={{ borderColor: props.edit ? '' : '#3f51b5', color: props.edit ? '' : '#3f51b5' }}>
                                                <MenuItem value={'en attente'}>en attente</MenuItem>
                                                <MenuItem value={'en cours'}>en cours</MenuItem>
                                                <MenuItem value={'réalisé'}>réalisé</MenuItem>
                                                <MenuItem value={'non réalisé'}>non réalisé</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>}
                                </div>
                                <TextField value={newInter.material.join(', ')} onChange={e => setNewInter({ ...newInter, material: e.target.value.split(', ') })} size="small" style={{ background: '#fff', margin: 8 }} variant="outlined" label="Matériel nécessaire" placeholder="Séparer le materiel par une virgule (ex: niveau, ponceuse, ...)" />
                            </div>
                            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', margin: '12px auto 8px', width: '50%' }} />
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', width: '100%', flexWrap: 'wrap' }}>
                                {tachesLen && taches.map((o, i) => (
                                    <div key={i} style={{ position: 'relative' }}>
                                        <div style={{ display: 'flex', marginTop: 12 }}>
                                            <div style={{ flex: 3 }}>
                                                <TextField value={o.titre} onChange={(e) => updateTache(i, 'titre', e.target.value)} style={{ margin: 8, flex: 2, background: '#fff' }} size="small" variant="outlined" label="Titre de la tache" placeholder="Titre de la tache" fullWidth />
                                                <TextField value={o.description} onChange={(e) => updateTache(i, 'description', e.target.value)} size="small" fullWidth style={{ background: '#fff', margin: 8 }} variant="outlined" label="Description de la tache" placeholder="Description de la tache" />
                                            </div>
                                            <div style={{ position: 'relative', flex: 2, background: '#fff', margin: '8px 0 8px 16px', padding: 8, border: '1px solid #3f51b5', borderRadius: 3 }}>
                                                <div style={{ display: 'flex', flexWrap: "nowrap", overflow: 'auto', maxWidth: '280px' }}>
                                                    {o.image.map((imgSrc, idx) => <div key={idx} style={{ position: 'relative' }}><span style={{ position: 'absolute', top: 0, right: 0, background: '#c50202', color: '#fff', width: 26, height: 26, borderRadius: '50%', border: '1px solid white', boxShadow: '0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%)' }}><RemoveIcon onClick={() => removeImg(i, idx)} /></span><img key={0} style={{ maxHeight: 74, margin: '0 8px' }} src={imgSrc} alt='imageDescription' /></div>)}
                                                    {o.image.length === 0 && <p style={{ width: '100%', textAlign: 'center' }}>Aucune image sélectionnée</p>}
                                                </div>
                                                <div style={{ position: 'absolute', top: '50%', transform: 'translate3d(-4px, -4px, 1px)' }}>
                                                    <div className="addImageWrapper" style={{ position: 'relative' }}>
                                                        <Fab color="primary" size="small" aria-label="add">
                                                            <AddIcon />
                                                            <label className="custom-file-upload" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: '50%', display: 'inline-block', padding: '6px 12px', cursor: 'pointer' }}>
                                                                <TextField style={{ display: 'none' }} type="file" inputProps={{ accept: 'image/*', style: { height: 26, fontSize: 0 } }} onChange={e => saveImg(e.target.files[0], i)} />
                                                            </label>
                                                        </Fab>
                                                    </div>
                                                </div>
                                            </div>
                                            <Fab onClick={() => supprimerTache(i)} size="small" style={{ position: 'absolute', top: '0%', transform: 'translate3d(4px, -4px, 1px)', background: '#c50202', color: '#fff', width: 30, height: 16, zIndex: 9 }}>
                                                <RemoveIcon />
                                            </Fab>
                                        </div>
                                    </div>
                                ))}
                                <Button onClick={ajouterTache} size="small" variant="outlined" style={{ color: '#3f51b5', borderColor: '#3f51b5', background: '#fff', margin: '8px auto' }}>Ajouter une tache</Button>
                            </div>
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', width: '100%' }}></div>
                        </form>
                        <div>
                            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                                <Button onClick={e => { setOpen(false); props.onClose() }} variant="outlined" size="medium" style={{ textTransform: 'capitalize', marginRight: 16, borderColor: '#3f51b5', color: '#3f51b5', background: '#fff' }}>Annuler</Button>
                                <Button onClick={updatebd} variant="outlined" size="medium" style={{ textTransform: 'capitalize', borderColor: '#3f51b5', color: '#3f51b5', background: '#fff' }}>Valider</Button>
                            </div>
                        </div>
                    </>}
                </div>
            </Slide >
        </Modal >
    );
}

function CalendarRow(props) {
    const dureeJournee = props.nbQuarter || 56;
    const [day, setDay] = useState(props.date)
    const [user, setUser] = useState();
    const [dailyInter, setDailyInter] = useState();
    const [indexDailyInter, setIndexDailyInter] = useState({});

    const dispatch = useDispatch();
    const syndic = useSelector(getCurrentSyndic);
    const interventions = useSelector(getInterventions);
    const currentInterId = useSelector(getCurrentInterventionId);

    useEffect(() => {
        setIndexDailyInter({});
        setDailyInter([]);

        if (props.user) {
            let interByDate = props.user.interventionsList;
            if (interByDate && interByDate[props.curdate.replaceAll('/', '_')]) {
                let dInter = Object.keys(interByDate[props.curdate.replaceAll('/', '_')]);

                if (dInter && dInter.length > 0) {
                    if (Object.keys(interventions).length > 0) {
                        let res = dInter.map((o, i) => {
                            let interTemp = { ...interventions[o] };
                            if (interTemp && Object.keys(interTemp).length > 0) {
                                let indexInterTemp = indexDailyInter;
                                let interHoraire = interTemp.date.split(' ')[1].split(':');
                                let ecart = (parseInt(interHoraire[0]) - 8) + (1 / (60 / parseInt(interHoraire[1])));
                                let quarter = (ecart * 4) + 1;

                                interTemp.uuid = o;
                                indexInterTemp[quarter] = interTemp;
                                setIndexDailyInter(indexInterTemp);

                                return interTemp;
                            }
                            return false;
                        }).filter(o => o);

                        if (res.length > 0) {
                            setTimeout(() => {
                                // console.log(`CalendarRow: Liste des interventions du jour [${props.user.nom} ${props.user.prenom}]: `, res, dInter)
                                setDailyInter(res);
                            });
                        }
                    }
                }
            }
            setUser(props.user);
            currentInterId && dispatch(setCurrentIntervention(currentInterId));
        }
    }, [props, interventions]);

    const selectInter = (i) => {
        dispatch(setCurrentIntervention(indexDailyInter[i].uuid));
        dispatch(setOpenDetail(true));
    }

    const createCases = () => {
        let res = [];
        for (let i = 0; i < dureeJournee; i++) res.push(createCase(i));
        return res;
    }

    const createCase = (i) => {
        let showHead = props.showHead;
        let showRules = props.showRules;
        let head = (showHead || showRules) && i === 0;
        let hours = (i % 4 === 0);
        let half = (i % 4 === 2);
        let horaire = props.showRules && ((i % 4 === 0) && ((8 + Math.floor(i / 4)) < 10 ? '0' : '') + (8 + Math.floor(i / 4)) + 'h');
        let quarter = indexDailyInter[i] && indexDailyInter[i].duree * 4 * 100;

        return (
            <Case className={head ? "case_head" : showRules ? "case_rules" : ""} key={i} showRules={showRules} head={head} hours={hours} half={half}>
                <CaseSpan i={i} showRules={showRules} head={head}>
                    {head && <div style={{ background: '#3f51b5', position: 'absolute', display: 'flex', color: 'white' }}>
                        {!showRules && <div style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
                            <div>{props.user && props.user.nom}</div>
                            <div>{props.user && props.user.prenom}</div>
                        </div>}
                    </div>}
                    {horaire}
                    {(indexDailyInter[i]) &&
                        <Grow in={true} mountOnEnter unmountOnExit timeout={500}>
                            <InterventionButton background={colorize(indexDailyInter[i].etat)} opacity={indexDailyInter[i].agence !== syndic ? .66 : 1} quarter={quarter} onClick={() => selectInter(i)}>
                                <div style={{ overflow: 'hidden', position: 'relative' }}>
                                    <span style={{ maxWidth: '100%', whiteSpace: 'nowrap' }}><b>{indexDailyInter[i].id}</b> - {indexDailyInter[i].nom}</span><br />
                                    <span style={{ fontSize: 10, maxWidth: '100%', whiteSpace: 'nowrap' }}><b>{indexDailyInter[i].titre}</b></span>
                                    {(indexDailyInter[i].etat) === 'payé' && <div style={{ position: 'absolute', top: 0, right: 0, display: 'block', width: 22, height: 22, background: 'rgb(255 235 0)', borderRadius: '50%' }}></div>}
                                </div>
                            </InterventionButton>
                        </Grow>
                    }
                </CaseSpan>
            </Case >
        );
    }

    return <CalendarRowDiv showRules={props.showRules} indexRow={props.indexRow} >{createCases()}</CalendarRowDiv>;
}

function CalendarDetail(props) {
    const [editInter, setEditInter] = useState(false);
    const open = useSelector(detailIsOpen);
    const currentIntervention = useSelector(getCurrentIntervention);
    const dispatch = useDispatch();

    useEffect(() => {
        // if (!currentIntervention) dispatch(setOpenDetail(false));
    }, [currentIntervention, dispatch])

    return (
        <Slide in={open} direction="left" mountOnEnter unmountOnExit>
            <CalendarDetailDiv className="detailInter" style={{ overflow: 'auto' }}>
                <CalendarDetailEntete data={currentIntervention} setEditInter={setEditInter} />
                <CalendarDetailIdentite data={currentIntervention} />
                <h4 style={{ textAlign: 'center', color: '#3f51b5' }}>{currentIntervention && currentIntervention.titre}</h4>
                {currentIntervention && currentIntervention.taches && currentIntervention.taches.map((props, i) => <CalendarDetailTache key={i} {...props} />)}
                {/* <CalendarDetailEdit {...currentIntervention} open={editInter} onClose={() => setEditInter(false)} /> */}
                <CalendarDetailHistory history={currentIntervention && currentIntervention.history} />
                <CalendarAjoutEdit currentInt={currentIntervention} edit open={editInter} onClose={() => setEditInter(false)} />
            </CalendarDetailDiv>
        </Slide>
    );
}

function CalendarDetailEntete(props) {
    const employes = useSelector(getUsers);
    const interventions = useSelector(getInterventions);
    const dispatch = useDispatch();

    const [curInter, setCurInter] = useState({});
    const [anchorState, setAnchorState] = useState(null);
    const [anchorReaffect, setAnchorReaffect] = useState(null);

    const handleClickReaffect = (event) => {
        setAnchorReaffect(event.currentTarget);
    };

    const handleCloseReaffect = (val) => {
        // stateInterRedux({ ...props.data, etat: val }, ({ functionName, id }) => { console.log(functionName, id); });
        setAnchorReaffect(null);
    };

    const handleClick = (event) => {
        setAnchorState(event.currentTarget);
    };

    const handleClose = (val) => {
        stateInterRedux({ ...props.data, etat: val }, ({ functionName, id }) => { console.log(functionName, id); });
        setAnchorState(null);
    };

    const reaffect = () => {
        const oldTech = employes[interventions[curInter.uid].technicien];
        console.log('Firebase - Intervention réaffecté de ' +
            oldTech.nom + ' ' +
            oldTech.prenom + ' à ' +
            employes[curInter.technicien].nom + ' ' +
            employes[curInter.technicien].prenom + ' et du ' +
            interventions[curInter.uid].date + ' au ' + curInter.date,
            curInter);

        handleCloseReaffect();

        setTimeout(() => {
            reaffectInterRedux(interventions[curInter.uid], curInter, ({ functionName, id }) => console.log(functionName, id));
        })
    }

    const initDate = (d) => {
        if (!d) return;
        let tmp = d.split(' ');
        let tmpDate = tmp[0].split('/');
        let tmpTime = tmp[1].split(':');
        return new Date(tmpDate[2], (tmpDate[1] - 1), tmpDate[0], tmpTime[0], tmpTime[1]);
    }

    useEffect(() => {
        setCurInter(props.data);
    }, [props.data])

    return (
        <div style={{ position: 'sticky', top: 0, background: '#F1F9F9', paddingBottom: 1 }}>
            <div style={{ position: 'absolute', top: -14, left: 0 }}><IconButton style={{ color: '#3f51b5' }} onClick={e => dispatch(setOpenDetail(false))}><ArrowForwardIosIcon /></IconButton></div>
            <div style={{ position: 'absolute', top: -14, right: 4 }}><IconButton style={{ color: '#3f51b5' }} onClick={e => props.setEditInter(true)}><EditIcon /></IconButton></div>

            {curInter && <h4 style={{ textAlign: 'center', color: '#3f51b5' }}>Detail de l'intervention {curInter.id}</h4>}
            <hr style={{ borderColor: '#3f51b5' }} />
            {curInter && <Paper variant="outlined" style={{ margin: '16px 0', padding: '4px 0', background: '#3f51b5', color: '#fff', border: '1px solid #3f51b5', display: 'flex', justifyContent: 'space-between' }}>
                <Button style={{ flex: 1, textTransform: 'capitalize', color: '#fff' }} onClick={() => deleteInterRedux(curInter, ({ functionName, id }) => console.log(functionName, id))} size="small">Supprimer <DeleteIcon style={{ fontSize: 22, marginLeft: 8 }} /></Button>
                <Button style={{ borderLeft: '1px solid #fff', flex: 1, textTransform: 'capitalize', color: '#fff' }} onClick={handleClickReaffect} size="small">Réattribuer <CompareArrowsIcon style={{ fontSize: 22, marginLeft: 8 }} /></Button>
                <Button style={{ borderLeft: '1px solid #fff', flex: 1, textTransform: 'capitalize', color: '#fff' }} onClick={handleClick} size="small">Etat <OfflinePinIcon style={{ fontSize: 22, marginLeft: 8 }} /></Button>
            </Paper>}
            <Menu id="stateMenu" anchorEl={anchorState} keepMounted open={Boolean(anchorState)} onClose={handleClose} >
                <MenuItem onClick={() => handleClose('en attente')}>en attente</MenuItem>
                <MenuItem onClick={() => handleClose('en cours')}>en cours</MenuItem>
                <MenuItem onClick={() => handleClose('réalisé')}>réalisé</MenuItem>
                <MenuItem onClick={() => handleClose('non réalisé')}>non réalisé</MenuItem>
                <MenuItem onClick={() => handleClose('facturé')}>facturé</MenuItem>
                <MenuItem onClick={() => handleClose('payé')}>payé</MenuItem>
            </Menu>
            <Menu id="reaffectMenu" anchorEl={anchorReaffect} keepMounted open={Boolean(anchorReaffect)} onClose={handleCloseReaffect} >
                <h3 style={{ textAlign: 'center', color: '#3f51b5' }}>Réaffectation</h3>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0 12px' }}>
                    <h4 style={{ textAlign: 'center', color: '#3f51b5' }}>Changer la date</h4>
                    {curInter && <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                        <KeyboardDateTimePicker
                            value={initDate(curInter.date)}
                            onChange={e => setCurInter({ ...curInter, date: e.toLocaleString().replaceAll(',', '') })}
                            ampm={false}
                            minutesStep={15}
                            size="small"
                            inputVariant="outlined"
                            onError={console.log}
                            format="dd/MM/yyyy HH:mm"
                        />
                    </MuiPickersUtilsProvider>}
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid #3f51b5', margin: '1.33em 25% 0' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0 12px' }}>
                    <h4 style={{ textAlign: 'center', color: '#3f51b5' }}>Changer le technicien</h4>

                    {curInter && <FormControl size="small" style={{ minWidth: '100%' }}>
                        <Select size="small" value={curInter.technicien || ''} onChange={e => setCurInter({ ...curInter, technicien: e.target.value })} labelId="ajoutInter_technicien" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                            {
                                employes &&
                                Object.entries(employes).map((o, i) => {
                                    return (o[1].role === 'technicien') && <MenuItem key={i} value={o[0]}>{o[1].nom} {o[1].prenom}</MenuItem>
                                })
                            }
                        </Select>
                    </FormControl>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: 12, marginTop: 8 }}>
                    <Button onClick={reaffect} variant="outlined" style={{ color: '#3f51b5', borderColor: '#3f51b5' }}>Valider</Button>
                </div>
            </Menu>
        </div>
    );
}

function CalendarDetailIdentite(props) {
    const employes = useSelector(getUsers);
    return (
        <Paper variant="outlined" style={{ margin: '4px 0 16px', padding: '16px', color: '#3f51b5', border: '1px solid #3f51b5' }}>
            {props.data &&
                <div style={{ display: 'flex' }}>
                    <div style={{ flex: 2 }}><div className="calendar_detail_identite" style={{ fontSize: 18 }}>Mr <b>{props.data.nom}</b> {props.data.prenom}<br /><span style={{ marginTop: 8, color: "#999", fontSize: 14 }}>{props.data.adresse}</span></div></div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'end', marginRight: 8 }}><b>{props.data.telMobile}</b></div>
                </div>}
            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
            {props.data &&
                <div style={{ marginTop: 12, display: 'flex' }}>
                    <div style={{ flex: 2 }}><b>{props.data.agence},</b> le {props.data.date}</div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'end' }}><b>{Math.floor(props.data.duree)}h{(Math.floor(props.data.duree) - props.data.duree) ? 60 * (props.data.duree - Math.floor(props.data.duree)) + 'min' : ''}</b> <AccessAlarmIcon size="small" style={{ width: 16, margin: '-4px 8px' }} /></div>
                </div>}
            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
            {props.data && <div style={{ marginTop: 12, display: 'flex' }}>{props.data.material.join(', ')}</div>}
            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
            {props.data && <div style={{ marginTop: 12, display: 'flex' }}>
                <div style={{ flex: 2 }}><span style={{ marginTop: 8, color: "var(--realise)", fontSize: 12 }}>Assigné a {employes[props.data.technicien].nom} {employes[props.data.technicien].prenom}</span><br /><span style={{ marginTop: 8, color: "#999", fontSize: 11 }}>Géré par {employes[props.data.gestionnaire].nom} {employes[props.data.gestionnaire].prenom}</span></div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'end', marginRight: 8 }}><b style={{ whiteSpace: 'nowrap' }}>{props.data.etat} <span style={{ marginLeft: 8, width: 12, height: 12, background: colorize(props.data.etat), borderRadius: '50%', display: 'inline-block' }}></span></b></div>
            </div>}
        </Paper>
    );
}

function CalendarDetailTache(props) {
    const [open, setOpen] = useState(false);
    return (
        <Paper variant="outlined" style={{ cursor: 'pointer', margin: '16px 0', padding: '16px', color: '#3f51b5', border: '1px solid #3f51b5' }}>
            <div onClick={e => setOpen(!open)} style={{ display: 'flex' }}>
                <div style={{ flex: 2 }}><div style={{ fontSize: 14 }}><b>{props.titre}</b></div></div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'end', marginRight: 8 }}><b style={{ whiteSpace: 'nowrap' }}>{props.state} <span style={{ marginLeft: 8, width: 12, height: 12, background: colorize(props.state), borderRadius: '50%', display: 'inline-block' }}></span></b></div>
            </div>
            <Collapse in={open} mountOnEnter unmountOnExit>
                <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, textAlign: 'justify' }}>
                            <p>{props.description}</p>
                        </div>
                    </div>
                </div>
                <CalendarCarousel image={props.image} />
                {(props.state === 'non réalisé' || props.state === 'réalisé') && <div style={{ display: 'flex', borderTop: '1px solid #3f51b5', flexDirection: 'column', margin: '16px -16px -16px', background: props.state === 'réalisé' ? 'rgb(1 101 1 / 10%)' : 'rgb(255 0 8 / 10%)', padding: '0 16px 16px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, textAlign: 'justify', color: props.stateColor }}>
                            <p><b>Etat de la tache : {props.state}</b></p>
                            <p>{props.retourCommentaire}</p>
                        </div>
                    </div>
                    <CalendarCarousel image={props.retourPhoto} />
                </div>}
            </Collapse>
        </Paper>
    );
}

function CalendarDetailHistory(props) {
    const employes = useSelector(getUsers);
    return (
        <Paper variant="outlined" className="detailHistoryWrapper" style={{ position: "relative", border: '1px solid rgb(63 81 181 / 13%)', borderRadius: 4, marginTop: 24, paddingTop: 8, paddingBottom: 8, background: '#f2f8f8', zIndex: -1 }}>
            {props.history && Object.entries(props.history).sort((a, b) => {
                const aVal = new moment(a[0], 'DD_MM_YYYY, HH:mm').toDate();
                const bVal = new moment(b[0], 'DD_MM_YYYY, HH:mm').toDate();
                return bVal.getTime() - aVal.getTime();
            }).map((o, i) => {
                return <div key={i} style={{ color: 'rgb(111 144 155 / 50%)', fontSize: 12, textAlign: 'center', margin: '24px 12px', padding: 12, background: '#f2f8f8' }}><span style={{ color: 'rgb(63 81 181 / 50%)', fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 4 }}>{o[0].replaceAll('_', '/')}</span>{o[1].split('$$')[0]} <span>{employes && o[1].split('$$').length > 0 && employes[o[1].split('$$')[1]] && employes[o[1].split('$$')[1]].nom} {employes && o[1].split('$$').length > 0 && employes[o[1].split('$$')[1]] && employes[o[1].split('$$')[1]].prenom}</span></div>;
            })}
        </Paper>
    )
}

function CalendarCarousel(props) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <div onClick={e => { setOpen(true); return false; }} style={{ display: 'flex', flexWrap: "nowrap", overflow: 'auto' }}>
                {props.image.map(i => <img key={i} style={{ margin: '0 8px', maxHeight: 90 }} src={i} alt="imageBoulot" />)}
            </div>
            <Modal style={{ zIndex: 100, display: 'flex' }} open={open} onClose={e => { setOpen(false); }}>
                <Slide in={open} direction="down" mountOnEnter unmountOnExit>
                    <div style={{ display: 'flex', flexWrap: "nowrap", overflow: 'auto', height: '90vh', marginTop: '5vh', width: '90vw', marginLeft: '5vw' }}>
                        <div style={{ position: 'absolute', top: 16, right: 16 }}><IconButton onClick={e => { setOpen(false); }} style={{ background: 'rgba(255, 255, 255, .75)' }}><CloseIcon /></IconButton></div>
                        {props.image.map(i => <img key={i} style={{ margin: '0 50px', maxHeight: '90vh', width: '100%', alignSelf: 'center' }} src={i} alt="imageBoulot" />)}
                    </div>
                </Slide>
            </Modal>
        </>
    )
}

export default Calendar