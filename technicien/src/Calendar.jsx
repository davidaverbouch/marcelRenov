/************************************* Import *************************************/
import { useEffect, useState } from "react";

import { CalendarWrapper, CalendarDetailDiv, CalendarRowDiv, InterventionButton, IdentitiesDiv } from "./CalendarStyledEl";
import moment from 'moment';

import {
    Fab,
    FormControl,
    Select,
    Menu,
    MenuItem,
    Paper,
    IconButton,
    Grow,
    Slide,
    Collapse,
    Modal,
    TextField,
    Button
} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CloseIcon from '@material-ui/icons/Close';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import BarChartIcon from '@material-ui/icons/BarChart';
import Looks6Icon from '@material-ui/icons/Looks6';
import PersonIcon from '@material-ui/icons/Person';
import StoreIcon from '@material-ui/icons/Store';
import BuildIcon from '@material-ui/icons/Build';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';

import { useSelector, useDispatch } from 'react-redux';
import {
    setOpenDetail,
    getCurrentDate,
    getUsers,
    getCurrentSyndic,
    getCurrentIntervention,
    getCurrentInterventionId,
    getCurrentGestionnaireId,
    detailIsOpen,
    setCurrentDate,
    setCurrentIntervention,
    getInterventionsToday,
    getInterventionsTomorrow
} from './features/calendar/CalendarSlice';

import {
    updateTacheInter,
    addCagnotteUser,
    removeCagnotteUser,
    editRatioUser,
    stateInterRedux
} from './firebaseConfig';

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
/*******************************************************************************/

/************************************* App *************************************/
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

function Calendar() {
    const dispatch = useDispatch();
    const employes = useSelector(getUsers);
    const currentInterId = useSelector(getCurrentInterventionId);
    const currentGestionnaireId = useSelector(getCurrentGestionnaireId);
    const interventionsToday = useSelector(getInterventionsToday);
    const interventionsTomorrow = useSelector(getInterventionsTomorrow);

    const [daySelected, setDaySelected] = useState(0);
    const [positionChanged, setPositionChanged] = useState(false);
    const [currentPosition, setCurrentPosition] = useState({ latitude: 0, longitude: 0 });

    const tomorrowDate = new Date(new Date().setDate(new Date().getDate() + 1));
    const selectedStyle = { borderBottom: '2px solid', marginBottom: -1, color: '#3f51b5', fontWeight: 700 };

    // window.geoTimer;

    useEffect(() => {
        let today = new Date().toLocaleDateString();
        let tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString();
        let todayArray = today.split('/');
        let tomorrowArray = tomorrow.split('/');
        let todayTransformed = `${todayArray[2]}-${todayArray[1]}-${todayArray[0]}`;
        let tomorrowTransformed = `${tomorrowArray[2]}-${tomorrowArray[1]}-${tomorrowArray[0]}`;

        if (daySelected === 0) dispatch(setCurrentDate(todayTransformed));
        else dispatch(setCurrentDate(tomorrowTransformed));

        dispatch(setOpenDetail(false));
    }, [daySelected, dispatch]);

    useEffect(() => currentInterId && dispatch(setCurrentIntervention(currentInterId)), [interventionsToday, interventionsTomorrow])

    const checkPosition = (position) => {
        setPositionChanged(true);
        if (Object.keys(interventionsToday).length > 0 && (JSON.stringify(currentPosition) === JSON.stringify(position.coords))) return;
        setCurrentPosition(position.coords);
    }

    useEffect(() => {
        window.geoTimer && clearTimeout(window.geoTimer);
        window.geoTimer = setTimeout(() => {
            // eslint-disable-next-line no-undef
            const service = new google.maps.DistanceMatrixService();
            console.log('checkPosition ', currentPosition.latitude, currentPosition.longitude);
            Object.values(interventionsToday).forEach((o, i) => {
                if (o.addr.indexOf('') >= 0) return;
                let request = {
                    // eslint-disable-next-line no-undef
                    origins: [new google.maps.LatLng(currentPosition.latitude, currentPosition.longitude)],
                    // eslint-disable-next-line no-undef
                    destinations: [new google.maps.LatLng(o.addr[0], o.addr[1])],
                    // eslint-disable-next-line no-undef
                    travelMode: google.maps.TravelMode.DRIVING,
                    // eslint-disable-next-line no-undef
                    unitSystem: google.maps.UnitSystem.METRIC,
                    avoidHighways: false,
                    avoidTolls: false
                }

                const tmp = o.date.split(' ');
                const day = tmp[0].split('/');
                const hour = tmp[1].split(':');
                const ecartTemp = new Date(day[2], day[1] - 1, day[0], hour[0], hour[1], 0).getTime() - new Date().getTime();
                service.getDistanceMatrix(request).then(res => {
                    if (o.etat === 'en attente' && positionChanged && Math.abs(ecartTemp) >= 3600000 && res.rows[0].elements[0].distance && res.rows[0].elements[0].distance.value < 50) {
                        console.log('Vous vous trouvez à la position d\'une prochaine intervention, ( dans ' + Math.round(ecartTemp / 3600000) + 'h ) : ', o)
                        setPositionChanged(false);
                    }
                    if (positionChanged &&
                        o.etat === 'en attente' &&
                        Math.abs(ecartTemp) < 3600000 &&
                        res.rows[0].elements[0].distance &&
                        res.rows[0].elements[0].distance.value < 50) {
                        console.log(o, res.destinationAddresses, res.rows[0].elements[0].distance && res.rows[0].elements[0].distance.value, res.rows[0].elements[0].distance && res.rows[0].elements[0].distance.value < 500);
                        setPositionChanged(false);
                        stateInterRedux({ ...o, etat: 'en cours' }, ({ functionName, id }) => { console.log(functionName, id); });
                    }
                }).catch(e => console.log(e))
            });

        }, 2500);
    }, [currentPosition, interventionsToday]);

    const errorPosition = () => {
        console.log("Sorry, no position available.");
    }

    var geo_options = {
        enableHighAccuracy: true,
        timeout: Infinity,
        maximumAge: 360
    };

    useEffect(() => {
        navigator.geolocation.watchPosition(checkPosition, errorPosition, geo_options);
    }, []);

    return (
        <div className="CalendarComponent">
            <CalendarInfoTechnicien data={daySelected === 0 ? interventionsToday : interventionsToday} user={employes[currentGestionnaireId]} />
            <div className="ChooseDay" style={{ display: 'flex', cursor: 'pointer', margin: '0 16px', textAlign: 'center', borderBottom: '1px solid #ccc' }}>
                <div onClick={() => setDaySelected(0)} style={daySelected === 0 ? { ...selectedStyle, flex: 1, display: 'flex', justifyContent: 'center', padding: '16px 8px', flexDirection: 'column' } : { flex: 1, display: 'flex', justifyContent: 'center', padding: '16px 8px', flexDirection: 'column', color: '#999', fontWeight: 700 }}>Aujourd'hui<br /><div style={{ fontSize: 12, width: '100%', marginTop: 4, fontWeight: 500 }}>{new Date().toLocaleDateString()}</div></div>
                <div onClick={() => setDaySelected(1)} style={daySelected === 1 ? { ...selectedStyle, flex: 1, display: 'flex', justifyContent: 'center', padding: '16px 8px', flexDirection: 'column' } : { flex: 1, display: 'flex', justifyContent: 'center', padding: '16px 8px', flexDirection: 'column', color: '#999', fontWeight: 700 }}>Demain<br /><div style={{ fontSize: 12, width: '100%', marginTop: 4, fontWeight: 500 }}>{tomorrowDate.toLocaleDateString()}</div></div>
            </div>
            <CalendarWrapper>
                {daySelected === 0 && <CalendarDailyInter data={interventionsToday} />}
                {daySelected === 1 && <CalendarDailyInter data={interventionsTomorrow} />}
            </CalendarWrapper>
            <CalendarDetail />
        </div>
    );
}

function CalendarInfoTechnicien(props) {
    const [dailyInter, setDailyInter] = useState([]);
    const [interNonTermine, setInterNonTermine] = useState();
    const [ratio, setRatio] = useState(0);

    const currentDate = useSelector(getCurrentDate);
    const employes = useSelector(getUsers);
    const currentGestionnaireId = useSelector(getCurrentGestionnaireId);

    useEffect(() => {
        let u = employes[currentGestionnaireId];
        if (!u) return;
        if (props.data) {
            let t = Object.keys(props.data);
            let nonTermine = t.length - t.filter(o => props.data[o] && props.data[o].etat === 'réalisé').length;
            let oldRate = Object.values(u.completionInter);

            setDailyInter(t);
            setInterNonTermine(nonTermine);
            (oldRate.length > 0) && setRatio(Number.parseFloat(oldRate.reduce((a, b) => a + b) / oldRate.length).toFixed(2))
        }
    }, [employes, currentGestionnaireId, props.data]);

    useEffect(() => {
        let nbInter = Object.keys(props.data).length;
        if ((nbInter !== 0) && (currentDate === new Date().toLocaleDateString())) {
            let date = currentDate.replaceAll('/', '_');
            let u = employes[currentGestionnaireId];

            if (interNonTermine === 0) {
                console.log('Ajout de 12€ dans la cagnotte', date, nbInter)
                if (!u.cagnotte[date]) {
                    addCagnotteUser({ technicien: currentGestionnaireId, date: currentDate, nbInter: nbInter }, (e) => { });
                }
            }
        }
    }, [interNonTermine])

    useEffect(() => {
        let nbInter = Object.keys(props.data).length;
        if ((nbInter !== 0) && (currentDate === new Date().toLocaleDateString())) {
            let rate = (1 - (interNonTermine / nbInter));
            let date = currentDate.replaceAll('/', '_');
            let u = employes[currentGestionnaireId];
            if (u.completionInter[date] !== rate) {
                editRatioUser({ technicien: currentGestionnaireId, date: currentDate, rate: rate }, e => { });
            }
        }
    }, [props.data])

    return !!employes[currentGestionnaireId] && (
        <>
            <div style={{ display: 'flex', flexWrap: 'wrap', margin: '16px 16px 24px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#3f51b5' }}><span style={{ display: 'flex', alignItems: 'center' }}><Looks6Icon style={{ fontSize: 24, marginRight: 4 }} />nb Inter </span><div><b> {Object.keys(props.user.interventionsList).length}</b></div></div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#3f51b5' }}><span style={{ display: 'flex', alignItems: 'center' }}><AttachMoneyIcon style={{ fontSize: 24 }} />Cagnotte </span><div><b> {Object.keys(props.user.cagnotte).length * 12}</b></div></div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#3f51b5' }}><span style={{ display: 'flex', alignItems: 'center' }}><BarChartIcon style={{ fontSize: 24, marginRight: 4 }} />Ratio </span><div><b> {ratio}</b></div></div>
            </div>
            <div style={{ margin: '0 16px 24px', color: '#3f51b5', textAlign: 'center' }}>
                {(currentDate === new Date().toLocaleDateString() && interNonTermine && (interNonTermine !== 0)) ? <span style={{ fontSize: 14, marginTop: 8, display: 'block' }}><b>{interNonTermine}</b> interventions non terminées</span> : (interNonTermine === 0) ? <span style={{ fontSize: 14, marginTop: 8, display: 'block' }}><b> {(Object.keys(props.user.cagnotte).length * 12) - 12} + 12 = {(Object.keys(props.user.cagnotte).length * 12)} </b></span> : <span style={{ fontSize: 14, marginTop: 8, display: 'block' }}><b> &nbsp; </b></span>}
                <span style={{ fontSize: 11 }}>Pour debloquer 12€ de cagnotte quotidiennement,<br />vous devez entièrement terminer toutes les interventions dans la journée</span>
            </div>
        </>
    );
}

function CalendarDailyInter(props) {
    const dispatch = useDispatch();
    const syndic = useSelector(getCurrentSyndic);

    const selectInter = (uid) => {
        dispatch(setCurrentIntervention(uid));
        dispatch(setOpenDetail(true));
    }

    return (
        <CalendarRowDiv>
            {Object.values(props.data).sort((a, b) => {
                let d1 = a.date.split(' ')[0].split('/');
                let d2 = b.date.split(' ')[0].split('/');
                let h1 = a.date.split(' ')[1].split(':');
                let h2 = b.date.split(' ')[1].split(':');

                let compar1 = new Date(d1[2], d1[1] - 1, d1[0], h1[0], h1[1], 0, 0).getTime();
                let compar2 = new Date(d2[2], d2[1] - 1, d2[0], h2[0], h2[1], 0, 0).getTime();
                return compar1 - compar2;
            }).map((o, i) => {
                return (<Grow key={i} in={true} mountOnEnter unmountOnExit timeout={500}>
                    <InterventionButton colortext={colorize(o.etat)} opacity={o.agence !== syndic ? .66 : 1} onClick={() => selectInter(o.uid)}>
                        <div style={{ display: 'flex' }}>
                            <div style={{ display: 'flex', flex: 1, fontSize: 16, justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}><WatchLaterIcon style={{ fontSize: 28, marginBottom: 8 }} /><div>{o.date.split(' ')[1].substr(0, 5)}</div></div>
                            <div style={{ display: 'flex', flex: 3, flexDirection: 'column', textAlign: 'start' }}>
                                <div style={{ flex: 1, marginBottom: 8, fontSize: 14, textDecoration: 'underline' }}><b>{o.titre}</b></div>
                                <div style={{ flex: 1, fontSize: 12 }}>chez Mr/Mme {o.nom} {o.prenom}</div>
                                <div style={{ flex: 1, fontSize: 12 }}>à l'adresse: {o.adresse}</div>
                            </div>
                            <div style={{ display: 'flex', flex: 1, fontSize: 16, justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}><AccessAlarmIcon style={{ fontSize: 28, marginBottom: 8 }} /><div>{o.duree}h</div></div>
                        </div>
                    </InterventionButton>
                </Grow>);
            })}
        </CalendarRowDiv>
    );
}

function CalendarDetail(props) {
    const open = useSelector(detailIsOpen);
    const currentIntervention = useSelector(getCurrentIntervention);

    return (
        <Slide in={open} direction="left" mountOnEnter unmountOnExit>
            <CalendarDetailDiv className="detailInter" style={{ overflow: 'auto' }}>
                <CalendarDetailEntete data={currentIntervention} />
                <CalendarDetailIdentite data={currentIntervention} />
                <h4 style={{ textAlign: 'center', color: '#3f51b5' }}>{currentIntervention && currentIntervention.titre}</h4>
                {currentIntervention && currentIntervention.taches && currentIntervention.taches.map((props, i) => <CalendarDetailTache key={i} index={i} {...props} />)}
                <CalendarDetailHistory history={currentIntervention && currentIntervention.history} />
            </CalendarDetailDiv>
        </Slide>
    );
}

function CalendarDetailEntete(props) {
    const dispatch = useDispatch();
    const [curInter, setCurInter] = useState({});

    useEffect(() => setCurInter(props.data), [props.data])

    return (
        <div style={{ position: 'sticky', top: 0, background: '#F1F9F9', paddingBottom: 1, paddingTop: 1, zIndex: 10 }}>
            <div style={{ position: 'absolute', top: 8, left: 0 }}><IconButton style={{ color: '#3f51b5' }} onClick={e => dispatch(setOpenDetail(false))}><ArrowForwardIosIcon /></IconButton></div>
            {curInter && <h4 style={{ textAlign: 'center', color: '#3f51b5' }}>Detail de l'intervention {curInter.id}</h4>}
            <hr style={{ borderColor: '#3f51b5' }} />
        </div>
    );
}

function CalendarDetailIdentite(props) {
    const employes = useSelector(getUsers);
    return (
        <IdentitiesDiv>
            {props.data &&
                <div style={{ display: 'flex' }}>
                    <div style={{ marginRight: 12 }}><PersonIcon /> </div>
                    <div style={{ flex: 2 }}><div className="calendar_detail_identite" style={{ fontSize: 18 }}>Mr <b>{props.data.nom}</b> {props.data.prenom}<br /><span style={{ marginTop: 8, fontSize: 14 }}>{props.data.adresse}</span></div></div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', marginRight: 8 }}><b>{props.data.telMobile}</b></div>
                </div>}
            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
            {props.data &&
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center' }}>
                    <div style={{ marginRight: 12 }}><StoreIcon /> </div>
                    <div style={{ flex: 2 }}><b>{props.data.agence},</b> le {props.data.date.substr(0, 16)}</div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', textAlign: 'right' }}><b>{Math.floor(props.data.duree)}h{(Math.floor(props.data.duree) - props.data.duree) ? 60 * (props.data.duree - Math.floor(props.data.duree)) + 'min' : ''}</b> <AccessAlarmIcon size="small" style={{ width: 16, margin: '-4px 8px' }} /></div>
                </div>}
            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
            {props.data &&
                <div style={{ marginTop: 12, display: 'flex' }}>
                    <div style={{ marginRight: 12, marginLeft: 4 }}><BuildIcon style={{ fontSize: 18 }} /> </div>
                    <div style={{ flex: 3 }}>{props.data.material.length === 0 ? 'Aucun matériel n\'est necessaire' : props.data.material.join(', ')}</div>
                </div>}
            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
            {props.data && <div style={{ marginTop: 12, display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: 12 }}><SupervisorAccountIcon /> </div>
                <div style={{ flex: 2 }}><span style={{ marginTop: 8, fontSize: 12 }}>Géré par {employes[props.data.gestionnaire].nom} {employes[props.data.gestionnaire].prenom}</span></div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', textAlign: 'right' }}><b style={{ whiteSpace: 'nowrap' }}>{props.data.etat} <span style={{ marginLeft: 8, width: 12, height: 12, background: colorize(props.data.etat), borderRadius: '50%', display: 'inline-block' }}></span></b></div>
            </div>}
        </IdentitiesDiv>
    );
}

function CalendarDetailTache(props) {
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState(props.retourPhoto || []);
    const [comment, setComment] = useState(props.retourCommentaire || '');
    const [estTerminee, setEstTerminee] = useState(props.state === 'réalisé');
    const [raison, setRaison] = useState(props.retourRaison || '');
    const [anchorReaffect, setAnchorReaffect] = useState(null);

    const currentIntervention = useSelector(getCurrentIntervention);
    const currentGestionnaireId = useSelector(getCurrentGestionnaireId);

    const handleClickReaffect = (event) => setAnchorReaffect(event.currentTarget);
    const handleCloseReaffect = (val) => setAnchorReaffect(null);

    const saveImg = (file) => {
        if (!file) return;

        let uploadTask = ref(getStorage(), 'images/' + file.name);
        uploadBytes(uploadTask, file).then((snapshot) => {
            getDownloadURL(uploadTask).then(url => {
                let tmp = [...images]
                tmp.push(url);
                setImages(tmp);
            });
        });
        console.log(file.name, file, { retourPhoto: images })
    };

    const removeImg = (index) => {
        let tmp = [...images]
        tmp.splice(index, 1);
        setImages(tmp);
    };

    const updateDB = () => {
        let t = [...currentIntervention.taches];
        let curInter = { ...currentIntervention };
        let response = {
            index: props.index,
            retourCommentaire: comment,
            retourEtat: estTerminee ? 'réalisé' : 'non réalisé',
            retourPhoto: [...images],
            retourRaison: estTerminee ? '' : raison,
            state: estTerminee ? 'réalisé' : 'non réalisé'
        };
        let jsonVal = { ...t[props.index], ...response };
        t[props.index] = jsonVal;

        let nonRealise = t.filter(o => o.state === 'non réalisé');
        let enAttente = t.filter(o => o.state === 'en attente');

        if (enAttente.length !== 0) curInter.etat = 'en cours';
        else if (enAttente.length === 0) curInter.etat = (nonRealise.length > 0) ? 'non réalisé' : 'réalisé';

        if (nonRealise.length > 0) {
            removeCagnotteUser({ technicien: currentGestionnaireId, date: curInter.date }, (e) => { });
        }

        updateTacheInter({ ...curInter, taches: t }, (res) => { handleCloseReaffect(); });
    }

    return (
        <>
            <IdentitiesDiv nopaddingbottom>
                <div onClick={e => setOpen(!open)} style={{ display: 'flex', cursor: 'pointer' }}>
                    <div style={{ flex: 2 }}><div style={{ fontSize: 14 }}><b>{props.titre}</b></div></div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', textAlign: 'right' }}><b style={{ whiteSpace: 'nowrap' }}>{props.state} <span style={{ marginLeft: 8, width: 12, height: 12, background: colorize(props.state), borderRadius: '50%', display: 'inline-block' }}></span></b></div>
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
                    {(props.state === 'non réalisé' || props.state === 'réalisé') && <div style={{ display: 'flex', flexDirection: 'column', margin: '16px 0 0', background: props.state === 'réalisé' ? 'rgb(1 101 1 / 10%)' : 'rgb(255 0 8 / 10%)', padding: '0 16px 16px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, textAlign: 'justify', color: props.stateColor }}>
                                <p><b>Etat de la tache : {props.state}</b></p>
                                <p>{props.retourCommentaire}</p>
                            </div>
                        </div>
                        <CalendarCarousel image={props.retourPhoto} />
                    </div>}
                </Collapse>
                <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 16 }} />
                <div>
                    <Button size="small" variant="outlined" onClick={handleClickReaffect} style={{ width: '100%', color: '#3f51b5', borderColor: '#3f51b5', borderRadius: 0, textTransform: 'none', fontWeight: 700 }}>Répondre</Button>
                </div>
            </IdentitiesDiv>
            <Menu id="terminerTache" anchorEl={anchorReaffect} keepMounted open={Boolean(anchorReaffect)} onClose={handleCloseReaffect} >
                <h3 style={{ textAlign: 'center', color: '#3f51b5' }}>Réalisation de la tache</h3>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0 12px' }}>
                    <div style={{ position: 'relative', flex: 2, background: '#fff', margin: '8px 0', padding: 8, border: '1px solid #3f51b5', borderRadius: 4 }}>
                        <div style={{ display: 'flex', flexWrap: "nowrap", overflow: 'auto', maxWidth: '280px' }}>
                            {images.map((imgSrc, idx) => <div key={idx} style={{ position: 'relative' }}><span style={{ position: 'absolute', top: 0, right: 0, background: '#c50202', color: '#fff', width: 26, height: 26, borderRadius: '50%', border: '1px solid white', boxShadow: '0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%)' }}><RemoveIcon onClick={() => removeImg(idx)} /></span><img key={0} style={{ maxHeight: 74, margin: '0 8px' }} src={imgSrc} alt='imageDescription' /></div>)}
                            {images.length === 0 && <p style={{ width: '100%', paddingLeft: 48, textAlign: 'center', height: 46, display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 700, color: '#3f51b5' }}>Ajouter une image !</p>}
                        </div>
                        <div style={{ position: 'absolute', top: '50%', transform: 'translate3d(-4px, -4px, 1px)' }}>
                            <div className="addImageWrapper" style={{ position: 'relative' }}>
                                <Fab color="primary" size="small" aria-label="add">
                                    <AddIcon />
                                    <label className="custom-file-upload" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: '50%', display: 'inline-block', padding: '6px 12px', cursor: 'pointer' }}>
                                        <TextField style={{ display: 'none' }} type="file" inputProps={{ accept: 'image/*', style: { height: 26, fontSize: 0 } }} onChange={e => saveImg(e.target.files[0])} />
                                    </label>
                                </Fab>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 12px', margin: '8px 12px', border: '1px solid #3f51b5', borderRadius: 4 }}>
                    <TextField value={comment} onChange={e => setComment(e.target.value)} multiline placeholder="Laisser un commentaire" variant="standard" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0 12px' }}>
                    <h4 style={{ textAlign: 'center', color: '#3f51b5', margin: '14px 0 12px' }}>La tache est-elle terminée ?</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <Button onClick={() => setEstTerminee(false)} size="small" variant="outlined" style={{ color: estTerminee === false ? '#fff' : '#777', fontWeight: 700, background: estTerminee === false ? '#c10505' : '#eee' }}>non</Button>
                        <Button onClick={() => setEstTerminee(true)} size="small" variant="outlined" style={{ color: estTerminee ? '#fff' : '#777', fontWeight: 700, background: estTerminee ? '#3f51b5' : '#eee' }}>oui</Button>
                    </div>
                </div>
                {estTerminee === false && <div style={{ display: 'flex', flexDirection: 'column', padding: '0 12px' }}>
                    <h4 style={{ textAlign: 'center', color: '#3f51b5', margin: '24px 0 12px' }}>Pour quelle raison ?</h4>
                    <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                        <FormControl size="small" style={{ minWidth: '100%' }}>
                            <Select value={raison} onChange={e => setRaison(e.target.value)} labelId="ajoutInter_agence" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                <MenuItem value="absent">Client absent</MenuItem>
                                <MenuItem value="refus">Refus du client</MenuItem>
                                <MenuItem value="temps">Manque de temps</MenuItem>
                                <MenuItem value="materiel">Manque de materiel</MenuItem>
                                <MenuItem value="inutile">Inutile</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>}
                <div style={{ display: 'flex', flexDirection: 'column', padding: 12, marginTop: 8 }}>
                    {images.length > 0 && (estTerminee || raison !== '') && <Button onClick={updateDB} variant="outlined" style={{ color: '#3f51b5', borderColor: '#3f51b5' }}>Valider</Button>}
                </div>
            </Menu>
        </>
    );
}

function CalendarDetailHistory(props) {
    const employes = useSelector(getUsers);
    return (
        <Paper variant="outlined" className="detailHistoryWrapper" style={{ position: "relative", border: '1px solid rgb(63 81 181 / 13%)', borderRadius: 4, marginTop: 24, marginBottom: 36, paddingTop: 8, paddingBottom: 8, background: '#f2f8f8', zIndex: -1 }}>
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
                    <div style={{ display: 'flex', flexWrap: "nowrap", overflow: 'auto', height: '90vh', marginTop: '5vh', width: '90vw', marginLeft: '5vw', outline: 'none' }}>
                        <div style={{ position: 'absolute', top: 16, right: 16 }}><IconButton onClick={e => { setOpen(false); }} style={{ background: 'rgba(255, 255, 255, .75)' }}><CloseIcon /></IconButton></div>
                        {props.image.map(i => <img key={i} style={{ margin: '0 50px', maxHeight: '90vh', width: '100%', alignSelf: 'center' }} src={i} alt="imageBoulot" />)}
                    </div>
                </Slide>
            </Modal>
        </>
    )
}

export default Calendar