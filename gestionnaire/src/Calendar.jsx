import { useEffect, useState } from "react";

import { CalendarWrapper, CalendarDetailDiv, CalendarRowDiv, Case, CaseSpan, InterventionButton } from "./CalendarStyledEl";

import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import { KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

import { Fab, FormControl, InputLabel, Select, MenuItem, Paper, InputBase, IconButton, Grow, Slide, Collapse, Modal, TextField, Button } from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import SearchIcon from '@material-ui/icons/Search';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import EditIcon from '@material-ui/icons/Edit';

import { useSelector, useDispatch } from 'react-redux';
import {
    setOpenDetail,
    getCurrentDate,
    getSyndics,
    getUsers,
    getInterventions,
    getCurrentSyndic,
    getCurrentIntervention,
    detailIsOpen,
    setCurrentDate,
    setCurrentIntervention,
    setCurrentSyndic
} from './features/calendar/CalendarSlice';

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
    const d = useSelector(getCurrentDate);

    return (
        <div className="CalendarComponent">
            <CalendarAction />
            <CalendarWrapper>
                <CalendarRow nbQuarter={props.nbQuarter} showRules />
                {employes && Object.entries(employes).map((o, i) => (o[1].role === 'technicien') && <CalendarRow key={i} date={d} nbQuarter={props.nbQuarter} indexRow={i} user={{ ...o[1], uuid: o[0] }} showHead />)}
                <CalendarRow nbQuarter={props.nbQuarter} showRules />
            </CalendarWrapper>
            <CalendarDetail />
        </div>
    );
}

function CalendarAction(props) {
    const [addInter, setAddInter] = useState(false);
    const [searchVal, setSearchVal] = useState();

    const dispatch = useDispatch();
    const syndics = useSelector(getSyndics);
    const syndic = useSelector(getCurrentSyndic);

    return (
        <div style={{ display: 'flex', margin: '16px 24px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 128, justifyContent: 'center', display: 'flex' }}>
                <Fab color="primary" aria-label="add" onClick={() => { setAddInter(true); }}>
                    <AddIcon />
                </Fab>
            </div>
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
                        label="Date du calendrier"
                        variant="inline"
                        inputVariant="outlined"
                        format="dd/MM/yyyy"
                        openTo="date"
                        size="small"
                        value={useSelector(getCurrentDate)}
                        inputValue={useSelector(getCurrentDate)}
                        style={{ borderColor: '#3f51b5', color: '#3f51b5', width: '100%' }}
                        onChange={date => dispatch(setCurrentDate(date))}
                    />
                </MuiPickersUtilsProvider>
            </div>
            <div className="gutterCalendar" style={{ position: 'relative' }}>
                <Paper component="form" variant={searchVal ? "elevation" : "outlined"} style={{ transition: '.5s all ease-in-out', border: '1px solid #3f51b5', height: searchVal ? '342px' : '38px', zIndex: searchVal ? 60 : 1, position: searchVal ? 'absolute' : 'relative', top: 0, left: 0, right: 0, background: '#fff' }}>
                    <div style={{ display: 'flex', padding: '0 16px' }}>
                        <InputBase value={searchVal} onChange={e => setSearchVal(e.target.value)} fullWidth placeholder="Chercher une intervention :" size="medium" inputProps={{ style: { padding: '4px 0' } }} />
                        <IconButton color="primary" size="medium" style={{ flex: 1, padding: 8 }} type="submit"><SearchIcon /></IconButton>
                    </div>
                    <div style={{ height: searchVal ? 300 : 0, transition: '.5s all ease-in-out' }}><div></div></div>
                </Paper>
            </div>
            <CalendarActionAjout open={addInter} onClose={() => setAddInter(false)} />
        </div>
    );
}

function CalendarActionAjout(props) {
    const [open, setOpen] = useState(props.open);
    const [taches, settaches] = useState([{
        state: 'en attente',
        titre: '',
        description: '',
        image: [],
        retourCommentaire: null,
        retourEtat: 0,
        retourPhoto: "",
        retourRaison: null
    }]);
    const [tachesLen, setTachesLen] = useState(1);
    const employes = useSelector(getUsers);
    const syndics = useSelector(getSyndics);
    const syndic = useSelector(getCurrentSyndic);

    useEffect(() => {
        setOpen(props.open);
    }, [props]);

    const ajouterTache = () => {
        let t = taches;
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
        settaches(t);
        setTachesLen(t.length);
    }

    const supprimerTache = (i) => {
        let t = taches;
        t.splice(i, 1)
        settaches(t);
        setTachesLen(t.length);
    }

    return (
        <Modal style={{ zIndex: 100, display: 'flex' }} open={open} onClose={e => { setOpen(false); props.onClose() }}>
            <Slide in={open} direction="down" mountOnEnter unmountOnExit>
                <div className="CalendarComponent CalendarModalComponent" style={{ position: 'relative', width: 768, maxWidth: '100%', height: '100vh', display: 'flex', flexDirection: 'column', margin: 'auto', padding: '8px 16px', borderRadius: 0, border: '2px solid #3f51b5', color: '#3f51b5', background: '#f1f9f9' }}>
                    <h4 style={{ color: '#3F51b5' }}>Nouvelle Intervention</h4>
                    <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
                    <form style={{ overflow: 'auto', paddingBottom: 62 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <TextField style={{ margin: 8, background: '#fff' }} variant="outlined" label="id" size="small" placeholder="Identifiant du devis" />
                            <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                <FormControl size="small" style={{ minWidth: '100%' }}>
                                    <InputLabel id="ajoutInter_technicien">Technicien</InputLabel>
                                    <Select labelId="ajoutInter_technicien" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                        {employes && Object.entries(employes).map((o, i) => (o[1].role === 'technicien') && <MenuItem key={i} value={o[0]}>{o[1].nom} {o[1].prenom}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </div>
                            <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                <FormControl size="small" style={{ minWidth: '100%' }}>
                                    <InputLabel id="ajoutInter_gestionnaire">Gestionnaire</InputLabel>
                                    <Select labelId="ajoutInter_gestionnaire" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                        {employes && Object.entries(employes).map((o, i) => (o[1].role === 'gestionnaire') && <MenuItem key={i} value={o[0]}>{o[1].nom} {o[1].prenom}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </div>
                            <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                <FormControl size="small" style={{ minWidth: '100%' }}>
                                    <InputLabel id="ajoutInter_agence">Syndic attaché</InputLabel>
                                    <Select value={syndic} labelId="ajoutInter_agence" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                        {syndics && Object.entries(syndics).map((o, i) => <MenuItem key={i} value={o[1].nom}>{o[1].nom}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                        <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', margin: '12px auto 8px', width: '50%' }} />
                        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 200, margin: 8, display: 'flex', justifyContent: 'center', background: '#fff' }}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                                    <KeyboardDatePicker
                                        autoOk
                                        label="Date de l'intervention"
                                        variant="inline"
                                        inputVariant="outlined"
                                        format="dd/MM/yyyy"
                                        openTo="date"
                                        size="small"
                                        style={{ borderColor: '#3f51b5', color: '#3f51b5', width: '100%' }}
                                    />
                                </MuiPickersUtilsProvider>
                            </div>
                            <div style={{ flex: 1, minWidth: 200, margin: 8, display: 'flex', justifyContent: 'center', background: '#fff' }}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                                    <KeyboardTimePicker
                                        autoOk
                                        label="Horaire de l'intervention"
                                        variant="inline"
                                        inputVariant="outlined"
                                        format="hh:mm"
                                        openTo="hour"
                                        size="small"
                                        style={{ borderColor: '#3f51b5', color: '#3f51b5', width: '100%' }}
                                    />
                                </MuiPickersUtilsProvider>
                            </div>
                            <div style={{ flex: 1, minWidth: 200, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                <FormControl size="small" style={{ minWidth: '100%' }}>
                                    <InputLabel id="ajoutInter_duree">Durée de l'intervention</InputLabel>
                                    <Select value="1" labelId="ajoutInter_duree" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                        <MenuItem value={0}>0mn</MenuItem>
                                        <MenuItem value={1}>15mn</MenuItem>
                                        <MenuItem value={2}>30mn</MenuItem>
                                        <MenuItem value={3}>45mn</MenuItem>
                                        <MenuItem value={3}>1h</MenuItem>
                                        <MenuItem value={4}>1h15mn</MenuItem>
                                        <MenuItem value={5}>1h30mn</MenuItem>
                                        <MenuItem value={6}>1h45mn</MenuItem>
                                        <MenuItem value={7}>2h</MenuItem>
                                        <MenuItem value={8}>2h15mn</MenuItem>
                                        <MenuItem value={9}>2h30mn</MenuItem>
                                        <MenuItem value={10}>2h45mn</MenuItem>
                                        <MenuItem value={11}>3h</MenuItem>
                                        <MenuItem value={12}>3h15mn</MenuItem>
                                        <MenuItem value={13}>3h30mn</MenuItem>
                                        <MenuItem value={14}>3h45mn</MenuItem>
                                        <MenuItem value={15}>4h</MenuItem>
                                        <MenuItem value={16}>4h15mn</MenuItem>
                                        <MenuItem value={17}>4h30mn</MenuItem>
                                        <MenuItem value={18}>4h45mn</MenuItem>
                                        <MenuItem value={19}>5h</MenuItem>
                                        <MenuItem value={20}>5h15mn</MenuItem>
                                        <MenuItem value={21}>5h30mn</MenuItem>
                                        <MenuItem value={22}>5h45mn</MenuItem>
                                        <MenuItem value={23}>6h</MenuItem>
                                        <MenuItem value={24}>6h15mn</MenuItem>
                                        <MenuItem value={25}>6h30mn</MenuItem>
                                        <MenuItem value={26}>6h45mn</MenuItem>
                                        <MenuItem value={27}>7h</MenuItem>
                                        <MenuItem value={28}>7h15mn</MenuItem>
                                        <MenuItem value={29}>7h30mn</MenuItem>
                                        <MenuItem value={30}>7h45mn</MenuItem>
                                        <MenuItem value={31}>8h</MenuItem>
                                        <MenuItem value={32}>8h15mn</MenuItem>
                                        <MenuItem value={33}>8h30mn</MenuItem>
                                        <MenuItem value={34}>8h45mn</MenuItem>
                                        <MenuItem value={35}>9h</MenuItem>
                                        <MenuItem value={36}>9h15mn</MenuItem>
                                        <MenuItem value={37}>9h30mn</MenuItem>
                                        <MenuItem value={38}>9h45mn</MenuItem>
                                        <MenuItem value={39}>10h</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                        <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', margin: '12px auto 8px', width: '50%' }} />
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', width: '100%', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: 8, flex: 1 }}>
                                <TextField style={{ flex: 1, maxWidth: '32%', background: '#fff' }} size="small" variant="outlined" label="Nom" placeholder="Nom du client" />
                                <TextField style={{ flex: 1, maxWidth: '32%', background: '#fff' }} size="small" variant="outlined" label="Prénom" placeholder="Prénom du client" />
                                <TextField style={{ flex: 1, maxWidth: '32%', background: '#fff' }} size="small" variant="outlined" label="Portable" placeholder="Téléphone portable du client" />
                            </div>
                            <TextField style={{ background: '#fff', margin: 8 }} size="small" variant="outlined" label="Adresse" placeholder="Adresse du client" />
                            <TextField style={{ background: '#fff', display: 'none' }} type="hidden" value={[43.5558793, 7.012570299999999]} />
                        </div>
                        <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', margin: '12px auto 8px', width: '50%' }} />
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', width: '100%', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', marginTop: 12 }}>
                                <TextField style={{ margin: 8, flex: 2, background: '#fff' }} size="small" variant="outlined" label="Titre de l'intervention" placeholder="Titre de l'intervention" fullWidth />
                                <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                    <FormControl size="small" style={{ minWidth: '100%' }}>
                                        <InputLabel id="ajoutInter_etat">Etat</InputLabel>
                                        <Select value="0" labelId="ajoutInter_etat" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                            <MenuItem value={0}>en attente</MenuItem>
                                            <MenuItem value={1}>en cours</MenuItem>
                                            <MenuItem value={2}>terminé</MenuItem>
                                            <MenuItem value={3}>non terminé</MenuItem>
                                            <MenuItem value={4}>facturé</MenuItem>
                                            <MenuItem value={5}>annulé</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <TextField size="small" style={{ background: '#fff', margin: 8 }} variant="outlined" label="Matériel nécessaire" placeholder="Séparer le materiel par une virgule (ex: niveau, ponceuse, ...)" />
                        </div>
                        <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', margin: '12px auto 8px', width: '50%' }} />
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', width: '100%', flexWrap: 'wrap' }}>
                            {tachesLen && taches.map((o, i) => (
                                <div style={{ position: 'relative' }}>
                                    <div style={{ display: 'flex', marginTop: 12 }}>
                                        <div style={{ flex: 3 }}>
                                            <TextField value={o.titre} style={{ margin: 8, flex: 2, background: '#fff' }} size="small" variant="outlined" label="Titre de la tache" placeholder="Titre de la tache" fullWidth />
                                            <TextField size="small" fullWidth style={{ background: '#fff', margin: 8 }} variant="outlined" label="Description de la tache" placeholder="Description de la tache" />
                                        </div>
                                        <div style={{ position: 'relative', flex: 2, background: '#fff', margin: '8px 0 8px 16px', padding: 8, border: '1px solid #3f51b5', borderRadius: 3 }}>

                                            <Fab color="primary" size="small" aria-label="add" style={{ position: 'absolute', top: '50%', transform: 'translate3d(-4px, -4px, 1px)' }}>
                                                <AddIcon />
                                            </Fab>

                                            <div style={{ display: 'flex', flexWrap: "nowrap", overflow: 'auto', maxWidth: '280px' }}>
                                                <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 74, background: '#aaa' }}>
                                                </div>
                                                <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 74, background: '#aaa' }}>
                                                </div>
                                                <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 74, background: '#aaa' }}>
                                                </div>
                                                <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 74, background: '#aaa' }}>
                                                </div>
                                                <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 74, background: '#aaa' }}>
                                                </div>
                                                <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 74, background: '#aaa' }}>
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
                        {/* taches: [{
                            etat: 'complete',
                            titre: 'changer le ballon d eau chaude',
                            description: 'blablabla',
                            image: ["url", "url 2", "..."],
                            retourCommentaire: null,
                            retourEtat: 1,
                            retourPhoto: "rn_image_picker_lib_temp_9d55b68b-440c-41ef-a42c-0659c6c5dcd9.jpg",
                            retourRaison: null,

                        }] */}
                    </form>
                    <div style={{ position: 'fixed', zIndex: 10, bottom: 0, left: 0, right: 0, width: 768, maxWidth: '100%', borderLeft: '2px solid #3f51b5', borderRight: '2px solid #3f51b5', borderBottom: '2px solid #3f51b5', margin: 'auto', padding: '0 24px', background: '#f1f9f9' }}>
                        <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                            <Button onClick={e => { setOpen(false); props.onClose() }} variant="outlined" size="medium" style={{ textTransform: 'capitalize', marginRight: 16, borderColor: '#3f51b5', color: '#3f51b5', background: '#fff' }}>Annuler</Button>
                            <Button variant="outlined" size="medium" style={{ textTransform: 'capitalize', borderColor: '#3f51b5', color: '#3f51b5', background: '#fff' }}>Valider</Button>
                        </div>
                    </div>
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

    useEffect(() => {
        setIndexDailyInter({})
        setDailyInter([])

        if (props.user) {
            let interByDate = props.user.interventionListByDate;
            let transformDate = (date) => {
                let d = date.split('/');
                return d[2] + '-' + d[1] + '-' + d[0];
            };
            if (interByDate && interByDate[props.date]) {
                let d = new Date(transformDate(props.date)).toLocaleDateString();
                let dInter = Object.keys(interByDate[props.date]);

                if (dInter && dInter.length > 0) {
                    let res = dInter.map((o, i) => {
                        let interTemp = { ...interventions[o] };
                        let indexInterTemp = indexDailyInter;
                        let interHoraire = interTemp.date.split(' ')[1].split(':');
                        let ecart = (parseInt(interHoraire[0]) - 8) + (1 / (60 / parseInt(interHoraire[1])));
                        let quarter = (ecart * 4) + 1;

                        interTemp.uuid = o;
                        indexInterTemp[quarter] = interTemp;
                        setIndexDailyInter(indexInterTemp);

                        return interTemp;
                    });
                    setDailyInter(res);
                }
            }
            setUser(props.user);
        }
    }, [props]);

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
            <Case key={i} showRules={showRules} head={head} hours={hours} half={half}>
                <CaseSpan i={i} showRules={showRules} head={head}>
                    {head && <div style={{ background: '#3f51b5', position: 'absolute', display: 'flex', color: 'white' }}>
                        {!showRules && <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div>{props.user && props.user.nom}</div>
                            <div>{props.user && props.user.prenom}</div>
                        </div>}
                    </div>}
                    {horaire}
                    {(indexDailyInter[i]) &&
                        <Grow in={true} mountOnEnter unmountOnExit timeout={500}>
                            <InterventionButton background={colorize(indexDailyInter[i].etat)} opacity={indexDailyInter[i].agence !== syndic} quarter={quarter} onClick={() => selectInter(i)}>
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

    return (
        <Slide in={open} direction="left" mountOnEnter unmountOnExit>
            <CalendarDetailDiv style={{ overflow: 'auto' }}>
                <CalendarDetailEntete data={currentIntervention} setEditInter={setEditInter} />
                <CalendarDetailIdentite data={currentIntervention} />
                <h4 style={{ textAlign: 'center', color: '#3f51b5' }}>{currentIntervention.titre}</h4>
                {currentIntervention && currentIntervention.taches && currentIntervention.taches.map(props => <CalendarDetailTache {...props} />)}
                <CalendarDetailEdit data={currentIntervention} open={editInter} onClose={() => setEditInter(false)} />
            </CalendarDetailDiv>
        </Slide>
    );
}

function CalendarDetailEdit(props) {
    const [open, setOpen] = useState(props.open);
    const currentIntervention = useSelector(getCurrentIntervention);
    const employes = useSelector(getUsers);
    const syndics = useSelector(getSyndics);
    const [taches, settaches] = useState([{
        state: 'en attente',
        titre: '',
        description: '',
        image: [],
        retourCommentaire: null,
        retourEtat: 0,
        retourPhoto: "",
        retourRaison: null
    }]);
    const [tachesLen, setTachesLen] = useState(1);
    const syndic = useSelector(getCurrentSyndic);

    useEffect(() => {
        setOpen(props.open);
    }, [props]);

    const ajouterTache = () => {
        let t = taches;
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
        settaches(t);
        setTachesLen(t.length);
    }

    const supprimerTache = (i) => {
        let t = taches;
        t.splice(i, 1)
        settaches(t);
        setTachesLen(t.length);
    }

    return (
        <Modal style={{ zIndex: 100, display: 'flex' }} open={open} onClose={e => { setOpen(false); props.onClose() }}>
            <Slide in={open} direction="down" mountOnEnter unmountOnExit>
                <div className="CalendarComponent CalendarModalComponent" style={{ position: 'relative', width: 768, maxWidth: '100%', height: '100vh', display: 'flex', flexDirection: 'column', margin: 'auto', padding: '8px 16px', borderRadius: 0, border: '2px solid #3f51b5', color: '#3f51b5', background: '#f1f9f9' }}>
                    <h4 style={{ color: '#3F51b5' }}>Modifier l'intervention</h4>
                    <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
                    <form style={{ overflow: 'auto', paddingBottom: 62 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                <FormControl size="small" style={{ minWidth: '100%' }}>
                                    <InputLabel id="ajoutInter_technicien">Technicien</InputLabel>
                                    <Select value={currentIntervention.technicien} labelId="ajoutInter_technicien" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                        {employes && Object.entries(employes).map((o, i) => (o[1].role === 'technicien') && <MenuItem key={i} value={o[0]}>{o[1].nom} {o[1].prenom}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </div>
                            <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                <FormControl size="small" style={{ minWidth: '100%' }}>
                                    <InputLabel id="ajoutInter_gestionnaire">Gestionnaire</InputLabel>
                                    <Select value={currentIntervention.gestionnaire} labelId="ajoutInter_gestionnaire" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                        {employes && Object.entries(employes).map((o, i) => (o[1].role === 'gestionnaire') && <MenuItem key={i} value={o[0]}>{o[1].nom} {o[1].prenom}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </div>
                            <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                <FormControl size="small" style={{ minWidth: '100%' }}>
                                    <InputLabel id="ajoutInter_agence">Syndic attaché</InputLabel>
                                    <Select value={currentIntervention.agence} labelId="ajoutInter_agence" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                        {syndics && Object.entries(syndics).map((o, i) => <MenuItem key={i} value={o[1].nom}>{o[1].nom}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                        <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', margin: '12px auto 8px', width: '50%' }} />
                        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 200, margin: 8, display: 'flex', justifyContent: 'center', background: '#fff' }}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                                    <KeyboardDatePicker
                                        autoOk
                                        label="Date de l'intervention"
                                        variant="inline"
                                        inputVariant="outlined"
                                        format="dd/MM/yyyy"
                                        openTo="date"
                                        size="small"
                                        value={currentIntervention.date.split(' ')[0]}
                                        inputValue={currentIntervention.date.split(' ')[0]}
                                        style={{ borderColor: '#3f51b5', color: '#3f51b5', width: '100%' }}
                                    />
                                </MuiPickersUtilsProvider>
                            </div>
                            <div style={{ flex: 1, minWidth: 200, margin: 8, display: 'flex', justifyContent: 'center', background: '#fff' }}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                                    <KeyboardTimePicker
                                        autoOk
                                        label="Horaire de l'intervention"
                                        variant="inline"
                                        inputVariant="outlined"
                                        format="hh:mm"
                                        openTo="hour"
                                        size="small"
                                        value={currentIntervention.date.split(' ')[1]}
                                        inputValue={currentIntervention.date.split(' ')[1]}
                                        style={{ borderColor: '#3f51b5', color: '#3f51b5', width: '100%' }}
                                    />
                                </MuiPickersUtilsProvider>
                            </div>
                            <div style={{ flex: 1, minWidth: 200, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                <FormControl size="small" style={{ minWidth: '100%' }}>
                                    <InputLabel id="ajoutInter_duree">Durée de l'intervention</InputLabel>
                                    <Select value={currentIntervention.duree * 4} labelId="ajoutInter_duree" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                        <MenuItem value={0}>0mn</MenuItem>
                                        <MenuItem value={1}>15mn</MenuItem>
                                        <MenuItem value={2}>30mn</MenuItem>
                                        <MenuItem value={3}>45mn</MenuItem>
                                        <MenuItem value={4}>1h</MenuItem>
                                        <MenuItem value={5}>1h15mn</MenuItem>
                                        <MenuItem value={6}>1h30mn</MenuItem>
                                        <MenuItem value={7}>1h45mn</MenuItem>
                                        <MenuItem value={8}>2h</MenuItem>
                                        <MenuItem value={9}>2h15mn</MenuItem>
                                        <MenuItem value={10}>2h30mn</MenuItem>
                                        <MenuItem value={11}>2h45mn</MenuItem>
                                        <MenuItem value={12}>3h</MenuItem>
                                        <MenuItem value={13}>3h15mn</MenuItem>
                                        <MenuItem value={14}>3h30mn</MenuItem>
                                        <MenuItem value={15}>3h45mn</MenuItem>
                                        <MenuItem value={16}>4h</MenuItem>
                                        <MenuItem value={17}>4h15mn</MenuItem>
                                        <MenuItem value={18}>4h30mn</MenuItem>
                                        <MenuItem value={19}>4h45mn</MenuItem>
                                        <MenuItem value={20}>5h</MenuItem>
                                        <MenuItem value={21}>5h15mn</MenuItem>
                                        <MenuItem value={22}>5h30mn</MenuItem>
                                        <MenuItem value={23}>5h45mn</MenuItem>
                                        <MenuItem value={24}>6h</MenuItem>
                                        <MenuItem value={25}>6h15mn</MenuItem>
                                        <MenuItem value={26}>6h30mn</MenuItem>
                                        <MenuItem value={27}>6h45mn</MenuItem>
                                        <MenuItem value={28}>7h</MenuItem>
                                        <MenuItem value={29}>7h15mn</MenuItem>
                                        <MenuItem value={30}>7h30mn</MenuItem>
                                        <MenuItem value={31}>7h45mn</MenuItem>
                                        <MenuItem value={32}>8h</MenuItem>
                                        <MenuItem value={33}>8h15mn</MenuItem>
                                        <MenuItem value={34}>8h30mn</MenuItem>
                                        <MenuItem value={35}>8h45mn</MenuItem>
                                        <MenuItem value={36}>9h</MenuItem>
                                        <MenuItem value={37}>9h15mn</MenuItem>
                                        <MenuItem value={38}>9h30mn</MenuItem>
                                        <MenuItem value={39}>9h45mn</MenuItem>
                                        <MenuItem value={40}>10h</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                        <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', margin: '12px auto 8px', width: '50%' }} />
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', width: '100%', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: 8, flex: 1 }}>
                                <TextField value={currentIntervention.nom} style={{ flex: 1, maxWidth: '32%', background: '#fff' }} size="small" variant="outlined" label="Nom" placeholder="Nom du client" />
                                <TextField value={currentIntervention.prenom} style={{ flex: 1, maxWidth: '32%', background: '#fff' }} size="small" variant="outlined" label="Prénom" placeholder="Prénom du client" />
                                <TextField value={currentIntervention.telMobile} style={{ flex: 1, maxWidth: '32%', background: '#fff' }} size="small" variant="outlined" label="Portable" placeholder="Téléphone portable du client" />
                            </div>
                            <TextField value={currentIntervention.adresse} style={{ background: '#fff', margin: 8 }} size="small" variant="outlined" label="Adresse" placeholder="Adresse du client" />
                            <TextField style={{ background: '#fff', display: 'none' }} type="hidden" value={[43.5558793, 7.012570299999999]} />
                        </div>
                        <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', margin: '12px auto 8px', width: '50%' }} />
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', width: '100%', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', marginTop: 12 }}>
                                <TextField value={currentIntervention.titre} style={{ margin: 8, flex: 2, background: '#fff' }} size="small" variant="outlined" label="Titre de l'intervention" placeholder="Titre de l'intervention" fullWidth />
                                <div style={{ flex: 1, margin: 8, display: 'flex', justifyContent: 'center' }}>
                                    <FormControl size="small" style={{ minWidth: '100%' }}>
                                        <InputLabel id="ajoutInter_etat">Etat</InputLabel>
                                        <Select value={currentIntervention.etat} labelId="ajoutInter_etat" variant="outlined" style={{ borderColor: '#3f51b5', color: '#3f51b5' }}>
                                            <MenuItem value="en attente">en attente</MenuItem>
                                            <MenuItem value="en cours">en cours</MenuItem>
                                            <MenuItem value="réalisé">réalisé</MenuItem>
                                            <MenuItem value="non réalisé">non réalisé</MenuItem>
                                            <MenuItem value="annulé">annulé</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <TextField size="small" style={{ background: '#fff', margin: 8 }} variant="outlined" label="Matériel nécessaire" placeholder="Séparer le materiel par une virgule (ex: niveau, ponceuse, ...)" />
                        </div>
                        <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', margin: '12px auto 8px', width: '50%' }} />
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', width: '100%', flexWrap: 'wrap' }}>
                            {tachesLen && taches.map((o, i) => (
                                <div style={{ position: 'relative' }}>
                                    <div style={{ display: 'flex', marginTop: 12 }}>
                                        <div style={{ flex: 3 }}>
                                            <TextField value={o.titre} style={{ margin: 8, flex: 2, background: '#fff' }} size="small" variant="outlined" label="Titre de la tache" placeholder="Titre de la tache" fullWidth />
                                            <TextField size="small" fullWidth style={{ background: '#fff', margin: 8 }} variant="outlined" label="Description de la tache" placeholder="Description de la tache" />
                                        </div>
                                        <div style={{ position: 'relative', flex: 2, background: '#fff', margin: '8px 0 8px 16px', padding: 8, border: '1px solid #3f51b5', borderRadius: 3 }}>

                                            <Fab color="primary" size="small" aria-label="add" style={{ position: 'absolute', top: '50%', transform: 'translate3d(-4px, -4px, 1px)' }}>
                                                <AddIcon />
                                            </Fab>

                                            <div style={{ display: 'flex', flexWrap: "nowrap", overflow: 'auto', maxWidth: '280px' }}>
                                                <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 74, background: '#aaa' }}>
                                                </div>
                                                <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 74, background: '#aaa' }}>
                                                </div>
                                                <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 74, background: '#aaa' }}>
                                                </div>
                                                <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 74, background: '#aaa' }}>
                                                </div>
                                                <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 74, background: '#aaa' }}>
                                                </div>
                                                <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 74, background: '#aaa' }}>
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
                        {/* taches: [{
                            etat: 'complete',
                            titre: 'changer le ballon d eau chaude',
                            description: 'blablabla',
                            image: ["url", "url 2", "..."],
                            retourCommentaire: null,
                            retourEtat: 1,
                            retourPhoto: "rn_image_picker_lib_temp_9d55b68b-440c-41ef-a42c-0659c6c5dcd9.jpg",
                            retourRaison: null,

                        }] */}
                    </form>
                    <div style={{ position: 'fixed', zIndex: 10, bottom: 0, left: 0, right: 0, width: 768, maxWidth: '100%', borderLeft: '2px solid #3f51b5', borderRight: '2px solid #3f51b5', borderBottom: '2px solid #3f51b5', margin: 'auto', padding: '0 24px', background: '#f1f9f9' }}>
                        <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                            <Button onClick={e => { setOpen(false); props.onClose() }} variant="outlined" size="medium" style={{ textTransform: 'capitalize', marginRight: 16, borderColor: '#3f51b5', color: '#3f51b5', background: '#fff' }}>Annuler</Button>
                            <Button variant="outlined" size="medium" style={{ textTransform: 'capitalize', borderColor: '#3f51b5', color: '#3f51b5', background: '#fff' }}>Valider</Button>
                        </div>
                    </div>
                </div>
            </Slide>
        </Modal >
    );
}

function CalendarDetailEntete(props) {
    const dispatch = useDispatch();

    return (
        <div style={{ position: 'sticky', top: 0, background: '#F1F9F9', paddingBottom: 1 }}>
            <div style={{ position: 'absolute', top: -14, left: 0 }}><IconButton style={{ color: '#3f51b5' }} onClick={e => dispatch(setOpenDetail(false))}><ArrowForwardIosIcon /></IconButton></div>
            <div style={{ position: 'absolute', top: -14, right: 16 }}><IconButton style={{ color: '#3f51b5' }} onClick={e => props.setEditInter(true)}><EditIcon /></IconButton></div>

            <h4 style={{ textAlign: 'center', color: '#3f51b5' }}>Detail de l'intervention {props.data.id}</h4>
            <hr style={{ borderColor: '#3f51b5' }} />
            <Paper variant="outlined" style={{ margin: '16px 0', padding: 8, background: '#3f51b5', color: '#fff', border: '1px solid #3f51b5' }}>Boutons d action</Paper>
        </div>
    );
}

function CalendarDetailIdentite(props) {
    const employes = useSelector(getUsers);
    return (
        <Paper variant="outlined" style={{ margin: '4px 0 16px', padding: '16px', color: '#3f51b5', border: '1px solid #3f51b5' }}>
            <div style={{ display: 'flex' }}>
                <div style={{ flex: 2 }}><div className="calendar_detail_identite" style={{ fontSize: 18 }}>Mr <b>{props.data.nom}</b> {props.data.prenom}<br /><span style={{ marginTop: 8, color: "#999", fontSize: 14 }}>{props.data.adresse}</span></div></div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'end', marginRight: 8 }}><b>{props.data.telMobile}</b></div>
            </div>
            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
            <div style={{ marginTop: 12, display: 'flex' }}>
                <div style={{ flex: 2 }}><b>{props.data.agence},</b> le {props.data.date}</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'end' }}><b>{Math.floor(props.data.duree)}h{(Math.floor(props.data.duree) - props.data.duree) ? 60 * (props.data.duree - Math.floor(props.data.duree)) + 'min' : ''}</b> <AccessAlarmIcon size="small" style={{ width: 16, margin: '-4px 8px' }} /></div>
            </div>
            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
            <div style={{ marginTop: 12, display: 'flex' }}>{props.data.material.join(', ')}</div>
            <hr style={{ borderBottom: '1px solid #3f51b5', borderTop: 'none', marginTop: 12, marginBottom: 8 }} />
            <div style={{ marginTop: 12, display: 'flex' }}>
                <div style={{ flex: 2 }}><span style={{ marginTop: 8, color: "var(--realise)", fontSize: 12 }}>Assigné a {employes[props.data.technicien].nom} {employes[props.data.technicien].prenom}</span><br /><span style={{ marginTop: 8, color: "#999", fontSize: 11 }}>Géré par {employes[props.data.gestionnaire].nom} {employes[props.data.gestionnaire].prenom}</span></div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'end', marginRight: 8 }}><b>{props.data.etat} <span style={{ marginLeft: 8, width: 12, height: 12, background: colorize(props.data.etat), borderRadius: '50%', display: 'inline-block' }}></span></b></div>
            </div>
        </Paper>
    );
}

function CalendarDetailTache(props) {
    const [open, setOpen] = useState(false);
    return (
        <Paper onClick={e => setOpen(!open)} variant="outlined" style={{ cursor: 'pointer', margin: '16px 0', padding: '16px', color: '#3f51b5', border: '1px solid #3f51b5' }}>
            <div style={{ display: 'flex' }}>
                <div style={{ flex: 2 }}><div style={{ fontSize: 14 }}><b>{props.titre}</b></div></div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'end', marginRight: 8 }}><b>{props.state} <span style={{ marginLeft: 8, width: 12, height: 12, background: colorize(props.state), borderRadius: '50%', display: 'inline-block' }}></span></b></div>
            </div>
            <Collapse in={open} mountOnEnter unmountOnExit>
                <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, textAlign: 'justify' }}>
                            <p>{props.description}</p>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: "nowrap", overflow: 'auto' }}>
                    <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 90, background: '#aaa' }}>
                    </div>
                    <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 90, background: '#aaa' }}>
                    </div>
                    <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 90, background: '#aaa' }}>
                    </div>
                    <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 90, background: '#aaa' }}>
                    </div>
                    <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 90, background: '#aaa' }}>
                    </div>
                    <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 90, background: '#aaa' }}>
                    </div>
                </div>
                {(props.state === 'non réalisé' || props.state === 'réalisé') && <div style={{ display: 'flex', borderTop: '1px solid #3f51b5', flexDirection: 'column', margin: '16px -16px -16px', background: props.state === 'réalisé' ? 'rgb(1 101 1 / 10%)' : 'rgb(255 0 8 / 10%)', padding: '4px 16px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, textAlign: 'justify', color: props.stateColor }}>
                            <p><b>La tache est {props.state}</b></p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec iaculis placerat neque, sed consectetur enim aliquet at.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: "nowrap", overflow: 'auto', marginBottom: 16 }}>
                        <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 90, background: '#aaa' }}>
                        </div>
                        <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 90, background: '#aaa' }}>
                        </div>
                        <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 90, background: '#aaa' }}>
                        </div>
                        <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 90, background: '#aaa' }}>
                        </div>
                        <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 90, background: '#aaa' }}>
                        </div>
                        <div style={{ flex: 1, margin: '0 8px', minWidth: 120, height: 90, background: '#aaa' }}>
                        </div>
                    </div>
                </div>}
            </Collapse>
        </Paper>
    );
}

export default Calendar