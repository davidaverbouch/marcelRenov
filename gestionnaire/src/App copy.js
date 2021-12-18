import { useState, useEffect, Fragment, forwardRef } from "react";
import './App.css';

import 'firebase/firestore';
import 'firebase/storage';
import "firebase/database";
import firebase from 'firebase';

import TopBar from './topBar';
import InterventionModal from './InterventionModal';
import CalendarInter from './CalendarInter';
import Login from './login';
import Task from "./Task";

import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";

import { DatePicker, MuiPickersUtilsProvider, } from "@material-ui/pickers";

import {
  Typography,
  Card,
  CardActions,
  CardContent,
  Tooltip,
  TextField,
  Button,
  Menu,
  MenuItem,
  Slide,
  ButtonGroup,
  Dialog,
  DialogTitle,
  Badge
} from '@material-ui/core';

import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import FlipCameraAndroidIcon from '@material-ui/icons/FlipCameraAndroid';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import CloseIcon from '@material-ui/icons/Close';
import NotificationsIcon from '@material-ui/icons/Notifications';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import PersonIcon from '@material-ui/icons/Person';
import MenuIcon from '@material-ui/icons/Menu';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import TextsmsIcon from '@material-ui/icons/Textsms';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import AnnouncementIcon from '@material-ui/icons/Announcement';
import EuroIcon from '@material-ui/icons/Euro';
import ReplayIcon from '@material-ui/icons/Replay';

import noThumbnail from './no-thumbnail.jpg';
import CagnotteChart from './CagnotteChart';

import { withStyles } from '@material-ui/core/styles';

import AudioMsg from './son.mp3';

const TooltipBtn = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#3f50b5',
    color: '#fff',
    padding: '.5em 1em',
    boxShadow: theme.shadows[1],
    fontSize: 14,
  },
}))(Tooltip);

function App(props) {
  const [logged, setLogged] = useState(false);
  const [image, setImage] = useState(CagnotteChart[0]);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [calendarInDrawerOpened, setCalendarInDrawerOpened] = useState(false);
  const [historyInDrawerOpened, setHistoryInDrawerOpened] = useState(false);
  const [notificationInDrawerOpened, setNotificationInDrawerOpened] = useState(false);
  const [messageInDrawerOpened, setMessageInDrawerOpened] = useState(false);
  const [date, changeDate] = useState(new Date());
  const [value, setValue] = useState(0);
  const [syndic, setSyndic] = useState('Foncia');
  const [weekTasks, setWeekTasks] = useState([]);
  const [currentInterId, setCurrentInterId] = useState();
  const [currentTasks, setCurrentTasks] = useState();
  const [currentTasksTitle, setCurrentTasksTitle] = useState('');
  const [currentTasksDesc, setCurrentTasksDesc] = useState('');
  const [currentTasksImg, setCurrentTasksImg] = useState('');
  const [currentTasksImgUrl, setCurrentTasksImgUrl] = useState(noThumbnail);
  const [allTechniciens, setAllTechniciens] = useState([]);
  const [ajouterTache, setAjouterTache] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [userId, setUserId] = useState();
  const [users, setUsers] = useState([]);
  const [syndics, setSyndics] = useState([]);
  const [usersTechnicien, setUsersTechnicien] = useState([]);
  const [interventions, setInterventions] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [newNotifications, setNewNotifications] = useState(null);
  const [dailyInterventions, setDailyInterventions] = useState([]);
  const [messagesId, setMessagesId] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessages, setNewMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [messageUserId, setMessageUserId] = useState();
  const [addMessage, setAddMessage] = useState();

  const [animateCurrentTask, setAnimateCurrentTask] = useState(false);

  const [assignTechCurrentinterModal, setAssignTechCurrentinterModal] = useState(null);
  const [nbCagnotte, setNbCagnotte] = useState(0);
  const [imageName, setImageName] = useState([]);
  const [notifyModalOpening, setNotifyModalOpening] = useState(false);
  const [notifyModalMsg, setNotifyModalMsg] = useState('');
  const [cagnotteModalOpening, setCagnotteModalOpening] = useState(false);
  const [filteredSearch, setFilteredSearch] = useState('');
  const [filteredInter, setFilteredInter] = useState([]);
  const [filteredInterRes, setFilteredInterRes] = useState([]);
  const [pastilleNotif, setPastilleNotif] = useState(false);
  const [pastilleMsg, setPastilleMsg] = useState(false);
  const [erreurConnexion, setErreurConnexion] = useState(false);
  const [context, setContext] = useState();
  const [bufferLoader, setBufferLoader] = useState();
  const [userMessaged, setUserMessaged] = useState([]);

  const handleChange = (event, newValue) => setValue(newValue);
  const selectSyndic = (s) => setSyndic(s);

  const storageRef = firebase.storage().ref();

  let interventionsDBRef;
  let notificationsDBRef;
  let messagesDBRef;

  const init = () => {
    console.group('Initialisation de l\'app');
    // unmount app when refresh page (f5)
    window.addEventListener('beforeunload', unmountApp);
    // gestion de l'audio ( a faire )

    userId && userInit();
    return unmountApp
  };

  const userInit = () => {
    if (!userId) return;
    getUsers();
    getSyndics();
    getInterventions();
    getNotifications();
    getMessages();
    getOldIntervention();
  };

  const unmountApp = () => {
    console.log('unmount App');
    interventionsDBRef && interventionsDBRef();
    notificationsDBRef && notificationsDBRef();
    messagesDBRef && messagesDBRef();
    window.removeEventListener('beforeunload', unmountApp);
    console.groupEnd();
  };

  const getUsers = () => {
    let refuseConnexion = false;
    // get user list (dev, admin, technicien, gestionnaire)
    firebase.firestore().collection('users').get().then((o) => {
      let x = [];
      let u = o.docs.map((doc, i) => {
        if (doc.data().messagesId && x.indexOf(doc.data().messagesId + '') === -1) {
          if (doc.id === userId) {
            if (doc.data().role === 'GESTIONNAIRE' || doc.data().role === 'DIRECTION' || doc.data().role === 'dev') {
              x = doc.data().messagesId;
            } else {
              setErreurConnexion(true);
              refuseConnexion = true;
              setLogged(false);
            }
          }
        }
        return { ...doc.data(), id: doc.id };
      });
      if (!refuseConnexion) {
        setMessagesId(x);
        if (JSON.stringify(u) !== JSON.stringify(users)) {
          let t = u.filter(user => user.role === 'TECHNICIEN');
          setUsers(u);
          setUsersTechnicien(t);
          console.log('Firebase - Liste des utilisateurs', u);
          console.log('Firebase - Liste des techniciens', t);
        }
      }
    });
  };

  const getMessages = () => {
    messagesDBRef = firebase.firestore().collection('messages').onSnapshot((snapshot) => {
      let allMsg = snapshot.docs.map(o => { return { ...o.data(), id: o.id }; });
      if (JSON.stringify(allMsg) !== JSON.stringify(newMessages)) {
        setNewMessages(allMsg);
        console.log('Firebase - Liste de tout les messages', allMsg);
      }
    });
  };

  const getFileredMsg = (m) => {
    if (!m) m = messagesId;
    let msg = allMessages.filter(s => m.indexOf(s.id) !== -1).map(o => o);
    if (JSON.stringify(msg) !== JSON.stringify(messages)) {
      requestAnimationFrame(() => {
        msg.forEach((mConvers, i) => {
          if (messages && messages[i] && messages[i].conversation && mConvers.conversation.length > messages[i].conversation.length) {
            let tmp = userMessaged;
            let u = (mConvers.to === userId) ? mConvers.from : mConvers.to;
            if (tmp.indexOf(u) === -1) tmp.push(u)
            setUserMessaged(tmp);
            setPastilleMsg(true);
          }
        });
      });
      setMessages(msg);
      console.log('Firebase - Liste des messages filtrés', msg);
    }
  };

  const getSyndics = () => {
    firebase.firestore().collection('syndics').get().then((snapshot) => {
      let s = snapshot.docs.map(syndic => syndic.data().nom);
      setSyndics(s);
      console.log('Firebase - Liste des syndics', s);
    });
  };

  // recuperer avec where (dateInter === current date (jour)) et se desabonner qd on change de date
  const getInterventions = () => {
    let startDate = new Date(date);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    let endDate = new Date(date);
    endDate.setHours(0);
    endDate.setMinutes(0);
    endDate.setSeconds(0);
    endDate = new Date(endDate.getTime() + (24 * 60 * 60 * 1000));

    startDate = firebase.firestore.Timestamp.fromDate(startDate);
    endDate = firebase.firestore.Timestamp.fromDate(endDate);

    interventionsDBRef = firebase.firestore().collection('interventions').where("dateInter", ">=", startDate).where("dateInter", "<=", endDate).onSnapshot((snapshot) => {
      // interventionsDBRef = firebase.firestore().collection('interventions').onSnapshot((snapshot) => {
      let i = snapshot.docs.map(inter => {
        return { ...inter.data(), codeInter: inter.id };
      });
      if (JSON.stringify(i) !== JSON.stringify(interventions)) {
        let interventionsTmp = i;
        setInterventions(interventionsTmp);
        console.log('Firebase - Liste des interventions', interventionsTmp);
      } else getDailyInterventions();
    });


  };

  const getOldIntervention = () => {
    let oldInterDate = new Date(new Date().getTime() - (6 * 30 * 24 * 60 * 60 * 1000));

    firebase.firestore().collection('interventions')
      .where("etat", "==", "Finalisée")
      .where("dateInter", ">=", oldInterDate).get().then((snapshot) => {
        let i = snapshot.docs.map(inter => {
          return { ...inter.data(), codeInter: inter.id };
        });
        let interventionsTmp = i;

        firebase.firestore().collection('interventions')
          .where("etat", "==", "Facturée")
          .where("dateInter", ">=", oldInterDate).get().then((snapshot) => {
            let i = snapshot.docs.map(inter => {
              return { ...inter.data(), codeInter: inter.id };
            });
            interventionsTmp = interventionsTmp.concat(i);

            firebase.firestore().collection('interventions')
              .where("etat", "==", "Payée")
              .where("dateInter", ">=", oldInterDate).get().then((snapshot) => {
                let i = snapshot.docs.map(inter => {
                  return { ...inter.data(), codeInter: inter.id };
                });
                interventionsTmp = interventionsTmp.concat(i);
                if (JSON.stringify(interventionsTmp) !== JSON.stringify(filteredInter)) {
                  setFilteredInter(interventionsTmp);
                  setFilteredInterRes(interventionsTmp);
                  console.log('Firebase - Liste des interventions post prod', interventionsTmp);
                }
              });
          });
      });
  }

  const getDailyInterventions = () => {
    if (!interventions) return;
    let filteredInter = interventions.filter(inter => (inter.dateInter.toDate().toLocaleDateString('fr') === date.toLocaleDateString('fr')));
    // let filteredInter = interventions.filter(inter => (inter.dateInter.toDate().toLocaleDateString('fr') === date.toLocaleDateString('fr') && inter.agence === syndic));
    setDailyInterventions(filteredInter);
    setCurrentTasks(filteredInter[currentInterId]);
    console.log('Firebase - Liste des interventions du jour', filteredInter);
  };

  const getNotifications = () => {
    notificationsDBRef = firebase.firestore().collection('users').doc(userId).onSnapshot((snapshot) => {
      let n = snapshot.data().notifications;
      if (JSON.stringify(n) !== JSON.stringify(notifications)) {
        console.log('Firebase - Liste des notifications', n);
        requestAnimationFrame(() => {
          if (n.length > notifications.length) setPastilleNotif(true);
          if (n.length === 0) setPastilleNotif(false);
        });
        setNotifications(n);
      }
    });
  };

  const addMessageWhenNewInter = (codeInter, messageUserId) => {
    addNewMessage('Bonjour, une nouvelle intervention vous a été affectér : ' + codeInter, messageUserId);
  };

  const addNewMessage = (newMsg, destinataire) => {
    let dest = destinataire || messageUserId
    let msg = (typeof newMsg === 'string') ? newMsg : addMessage;
    let resM = messages.filter(m => (m.to === dest || m.from === dest))
    setAddMessage('');
    if (resM.length === 1) {
      // ajouter a l'existant
      firebase.firestore().collection('messages').doc(resM[0].id + '').update({
        'conversation': firebase.firestore.FieldValue.arrayUnion({
          'from': userId,
          'quand': firebase.firestore.Timestamp.fromDate(new Date()),
          'quoi': msg,
          'to': destinataire || messageUserId
        })
      }).then(function () {
        console.log('Firebase - Message ajouté : ' + addMessage);
      }).catch(function (error) {
        console.error("Firebase - Erreur lors de l'ajout du message: ", error);
      });
    } else {
      // creer un nouveau document
      let ref = firebase.firestore().collection('messages').doc();

      let m = messagesId.map(msg => msg);
      m.push(ref.id);
      setMessagesId(m);

      ref.set({
        'conversation': firebase.firestore.FieldValue.arrayUnion({
          'from': userId,
          'quand': firebase.firestore.Timestamp.fromDate(new Date()),
          'quoi': msg,
          'to': destinataire || messageUserId
        }),
        'from': userId,
        'to': destinataire || messageUserId
      }).then(function (res) {
        console.log('Firebase - Message ajouté : ' + addMessage, ref.id);
        firebase.firestore().collection('users').doc(userId).update({ 'messagesId': firebase.firestore.FieldValue.arrayUnion(ref.id) }).then(function () {
          console.log('Firebase - MessagesId ajouté a : ' + userId);
        }).catch(function (error) { console.error("Firebase - Erreur lors de l'ajout du message: ", error); });

        firebase.firestore().collection('users').doc(destinataire || messageUserId).update({ 'messagesId': firebase.firestore.FieldValue.arrayUnion(ref.id) }).then(function () {
          console.log('Firebase - MessagesId ajouté a : ' + (destinataire || messageUserId));
        }).catch(function (error) { console.error("Firebase - Erreur lors de l'ajout du message: ", error); });
      }).catch(function (error) {
        console.error("Firebase - Erreur lors de l'ajout du message: ", error);
      });
    }
  };

  const addTask = () => {
    firebase.firestore().collection('interventions').doc(currentTasks.codeInter + '').update({
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
      console.log('Firebase - Tache ajoutée : ' + currentTasks.codeInter);
    }).catch(function (error) {
      console.error("Firebase - Erreur lors de l'ajout de la tache: ", error);
    });
  };

  const suppressTask = (task) => {
    firebase.firestore().collection('interventions').doc(currentTasks.codeInter + '').update({
      'taches': firebase.firestore.FieldValue.arrayRemove({ ...task })
    }).then(function () {
      console.log('Firebase - Tache supprimé : ' + currentTasks.codeInter);
    }).catch(function (error) {
      console.error("Firebase - Erreur lors de l'ajout de la tache: ", error);
    });
  };

  const suppressNotif = (notif) => {
    firebase.firestore().collection('users').doc(userId).update({
      'notifications': firebase.firestore.FieldValue.arrayRemove({ ...notif })
    }).then(function () {
      notificationsDBRef && notificationsDBRef();
      console.log('Firebase - notif supprimé : ', notif.quoi);
      requestAnimationFrame(getNotifications);
    }).catch(function (error) {
      console.error("Firebase - Erreur lors de l'ajout de la tache: ", error);
    });
  };

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

  const colorizedStateTask = (etat) => {
    let res = "";
    if (etat === 'Non réalisé') res = ' UnmakeState ';
    if (etat === 'Complete') res = ' CompleteState ';
    if (etat === 'Non complete') res = ' UncompleteState ';
    if (etat === 'Annulée') res = ' CancelState ';
    if (etat === 'Refusée') res = ' RejectState ';

    return res
  };

  const handleClickChangeCurrentInterTech = (event) => setAssignTechCurrentinterModal(event.currentTarget);
  const handleCloseChangeCurrentInterTech = () => setAssignTechCurrentinterModal(null);

  const selectTechForCurrentInter = (uuidTech) => {
    let oldTech = currentTasks.technicien;
    console.log('oldTech', oldTech)
    firebase.firestore().collection('interventions').doc(currentTasks.codeInter + '').update({ "technicien": uuidTech }).then(function () {

      firebase.firestore().collection('users').doc(oldTech).update({
        ['interventionsList.' + currentTasks.codeInter]: firebase.firestore.FieldValue.delete()
      }).then(function () {
        firebase.firestore().collection('users').doc(uuidTech).update({
          ['interventionsList.' + currentTasks.codeInter]: currentTasks.dateInter,
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
    let technicienForCurrentInter = currentTasks.technicien;
    firebase.firestore().collection('interventions').doc(currentTasks.codeInter + '').delete().then(function () {
      console.log('Firebase - Intervention supprimée : ' + currentTasks.codeInter);

      firebase.firestore().collection('users').doc(technicienForCurrentInter).update({
        ['interventionsList.' + currentTasks.codeInter]: firebase.firestore.FieldValue.delete()
      }).then(function () {
        console.log('Firebase - Intervention supprimé du technicien: ' + technicienForCurrentInter);
      }).catch(function (error) {
        console.error("Firebase - Erreur lors de l'ajout de la tache: ", error);
      });
    }).catch(function (error) {
      console.error("Firebase - Erreur lors de la réaffectation de l'intervention: ", error);
    });
  };

  const updateCurrentInterState = (etat) => {
    firebase.firestore().collection('interventions').doc(currentTasks.codeInter + '').update({ "etat": etat }).then(function () {
      console.log('Firebase - changement de l\'etat de l\'Intervention  : ' + etat);
    }).catch(function (error) {
      console.error("Firebase - Erreur lors de la réaffectation de l'intervention: ", error);
    });

    if (etat === 'Finalisée') {

      let nbInter = '';
      let nUsers = users.map(u => {
        if (currentTasks.technicien === u.id) {
          nbInter = u.nbInter + 1;
          u.nbInter = nbInter;
        }
        return u;
      });

      setUsers(nUsers);
      console.log('NbInter: ', nbInter, nUsers);

      if (nbInter === '') return;

      firebase.firestore().collection('users').doc(currentTasks.technicien).update({ "nbInter": nbInter + 1 }).then(function () {
        console.log('Firebase - ajout d\'une intervention au technicien  : ' + nbInter + 1);
      }).catch(function (error) {
        console.error("Firebase - Erreur lors de la réaffectation de l'intervention: ", error);
      });
    }
  };

  const updateCurrentInterSyndic = () => {

    firebase.firestore().collection('interventions').doc(currentTasks.codeInter + '').update({ 'agence': syndic }).then(function () {
      console.log('Firebase - Intervention modifié : ' + currentTasks.codeInter);
      props.close();
    }).catch(function (error) {
      console.error("Firebase - Erreur lors de la modif de l'intervention: ", error);
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

  const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  const filterInter = (e) => {
    let val = e.target.value.toLowerCase();
    setFilteredSearch(val);

    if (val && val === '') setFilteredInterRes(filteredInter);
    else {
      let tmp = filteredInter.filter(i => (unescape(i.codeInter).indexOf(val) !== -1 ||
        unescape(i.names).toLowerCase().indexOf(val) !== -1 ||
        unescape(i.agence).toLowerCase().indexOf(val) !== -1 ||
        unescape(i.addrText).toLowerCase().indexOf(val) !== -1 ||
        unescape(i.tel.mobile).indexOf(val) !== -1));
      setFilteredInterRes(tmp);
      console.log('ttttttttttt', val, tmp)
    }
  };

  const openAddrInGMaps = (geoPos) => {
    let page = "https://www.google.com/maps/search/?api=1&query=" + geoPos.x_ + "," + geoPos.N_;
    window.open(page, "adresse postale", "menubar=no, status=no, scrollbars=no, menubar=no, width=1250, height=850");
  };

  const getSelectedDate = () => {
    interventionsDBRef && interventionsDBRef();
    requestAnimationFrame(getInterventions);
  };

  useEffect(() => {
    firebase.auth().signOut().then(() => { console.log('deconnecté'); }).catch((error) => { console.log(error) });
  }, [erreurConnexion]);
  useEffect(init, []);
  useEffect(userInit, [userId]);
  useEffect(getFileredMsg, [allMessages, messagesId]);
  useEffect(getSelectedDate, [date]);
  useEffect(getDailyInterventions, [syndic, interventions]);
  useEffect(() => setTimeout(() => setAnimateCurrentTask(true), 250), [animateCurrentTask]);

  useEffect(() => {
    // if (messages && newMessages.length > messages.length) setPastilleMsg(true);
    setAllMessages(newMessages);
  }, [newMessages]);

  useEffect(() => {
    if (!currentTasks) return;
    let nbComplete = currentTasks.taches.filter(t => t.etat === 'Complete').length;
    let nbTotal = currentTasks.taches.length;
    setNbCagnotte((nbComplete / nbTotal) * 100);
    console.log('\tCurrent intervention :', currentTasks)
  }, [currentTasks])

  return (
    <div className="App">
      <header className="App-header">
        <TopBar
          date={date}
          setMessageInDrawerOpened={setMessageInDrawerOpened}
          messageInDrawerOpened={messageInDrawerOpened}
          setPastilleMsg={setPastilleMsg}
          setUserMessaged={setUserMessaged}
          userMessaged={userMessaged}
          pastilleMsg={pastilleMsg}
          setNotificationInDrawerOpened={setNotificationInDrawerOpened}
          notificationInDrawerOpened={notificationInDrawerOpened}
          setPastilleNotif={setPastilleNotif}
          pastilleNotif={pastilleNotif}
          setHistoryInDrawerOpened={setHistoryInDrawerOpened}
          historyInDrawerOpened={historyInDrawerOpened}
          setCalendarInDrawerOpened={setCalendarInDrawerOpened}
          calendarInDrawerOpened={calendarInDrawerOpened}
          changeDate={changeDate}
          userId={userId}
          addMessageWhenNewInter={addMessageWhenNewInter}
          syndics={syndics}
          techniciens={usersTechnicien}
          selectSyndic={selectSyndic} />
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', flexFlow: 'row' }}>
        <div className={historyInDrawerOpened ? "LeftContentSmallHistory LeftContentSmallOpenHistory" : "LeftContentSmallHistory LeftContentSmallCloseHistory"}>
          <div style={{ flex: 1 }}>
            <Typography align="center" component="h4">Post prod Interventions</Typography>
          </div>
          <div style={{ flex: 1, display: 'flex' }}>
            <TextField className="searchInput" value={filteredSearch} onChange={filterInter} fullWidth label="Rechercher" placeholder="Rechercher" style={{ color: "white" }} />
            <IconButton onClick={getOldIntervention} style={{ color: "white" }}><ReplayIcon /></IconButton>
          </div>
          <div style={{ flex: 8, display: 'flex' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginRight: '4px' }}>
              <div className="historyLabel finalisee">
                {filteredInterRes && filteredInterRes.filter((inter, i) => inter.etat === 'Finalisée').map((o, i) => {
                  let colorBGCard = colorizedState('bg', o);
                  return <TooltipBtn key={i} title={(
                    <div>
                      <div style={{ marginBottom: 8 }}><b>{unescape(o.etat)}</b> <span style={{ marginLeft: '4px', border: '1px solid white' }} className={"interventionTacheCouleurIndicator " + colorBGCard}> </span> </div>
                      <div style={{ fontSize: 14 }}><b>{unescape(o.names)}</b></div>
                      <div style={{ fontSize: 12 }}><b>De {unescape(o.hours)}</b></div>
                      <div style={{ fontSize: 12, marginBottom: 8 }}><b>Le {o.dateInter.toDate().toLocaleDateString('fr')}</b></div>
                      {o.taches.map((cTask, idx) => {
                        let colorBGTache = colorizedStateTask(cTask.etat);
                        return <div key={idx} style={{ margin: '6px, 0' }}><div><b>{unescape(cTask.tache.title)}</b></div> &nbsp;<span className={"interventionTacheCouleurIndicator " + colorBGTache}> </span> &nbsp;<b>{cTask.etat}</b></div>
                      })}
                    </div>
                  )} placement="right">
                    <span className="historyTask bgColor_Finalisee" onClick={() => { setAnimateCurrentTask(false); setTimeout(() => setCurrentTasks(o), 350); }}>{o.codeInter}</span>
                  </TooltipBtn>
                })}
              </div>
              <div className="historyLabel facturee">
                {filteredInterRes && filteredInterRes.filter((inter, i) => inter.etat === 'Facturée').map((o, i) => {
                  let colorBGCard = colorizedState('bg', o);
                  return <TooltipBtn key={i} title={(
                    <div>
                      <div style={{ marginBottom: 8 }}><b>{unescape(o.etat)}</b> <span style={{ marginLeft: '4px', border: '1px solid white' }} className={"interventionTacheCouleurIndicator " + colorBGCard}> </span> </div>
                      <div style={{ fontSize: 14 }}><b>{unescape(o.names)}</b></div>
                      <div style={{ fontSize: 12 }}><b>De {unescape(o.hours)}</b></div>
                      <div style={{ fontSize: 12, marginBottom: 8 }}><b>Le {o.dateInter.toDate().toLocaleDateString('fr')}</b></div>
                      {o.taches.map((cTask, idx) => {
                        let colorBGTache = colorizedStateTask(cTask.etat);
                        return <div key={idx} style={{ margin: '6px, 0' }}><div><b>{unescape(cTask.tache.title)}</b></div> &nbsp;<span className={"interventionTacheCouleurIndicator " + colorBGTache}> </span> &nbsp;<b>{cTask.etat}</b></div>
                      })}
                    </div>
                  )} placement="right">
                    <span className="historyTask bgColor_Facturee" onClick={() => { setAnimateCurrentTask(false); setTimeout(() => setCurrentTasks(o), 350); }}>{o.codeInter}</span>
                  </TooltipBtn>
                })}
              </div>
              <div className="historyLabel payee">
                {filteredInterRes && filteredInterRes.filter((inter, i) => inter.etat === 'Payée').map((o, i) => {
                  let colorBGCard = colorizedState('bg', o);
                  return <TooltipBtn key={i} title={(
                    <div>
                      <div style={{ marginBottom: 8 }}><b>{o.codeInter} - {unescape(o.etat)}</b> <span style={{ marginLeft: '4px', border: '1px solid white' }} className={"interventionTacheCouleurIndicator " + colorBGCard}> </span> </div>
                      <div style={{ fontSize: 14 }}><b>{unescape(o.names)}</b></div>
                      <div style={{ fontSize: 12 }}><b>De {unescape(o.hours)}</b></div>
                      <div style={{ fontSize: 12, marginBottom: 8 }}><b>Le {o.dateInter.toDate().toLocaleDateString('fr')}</b></div>
                      {o.taches.map((cTask, idx) => {
                        let colorBGTache = colorizedStateTask(cTask.etat);
                        return <div key={idx} style={{ margin: '6px, 0' }}><div><b>{unescape(cTask.tache.title)}</b></div> &nbsp;<span className={"interventionTacheCouleurIndicator " + colorBGTache}> </span> &nbsp;<b>{cTask.etat}</b></div>
                      })}
                    </div>
                  )} placement="right">
                    <span className="historyTask bgColor_Payee" onClick={() => { setAnimateCurrentTask(false); setTimeout(() => setCurrentTasks(o), 350); }}>{o.codeInter}</span>
                  </TooltipBtn>
                })}
              </div>
            </div>
          </div>
        </div>
        <div className={notificationInDrawerOpened ? "LeftContentSmallNotification LeftContentSmallOpenNotification" : "LeftContentSmallNotification LeftContentSmallCloseNotification"}>
          <div style={{ flex: 1 }}>
            <Typography align="center" component="h4">Notifications</Typography>
          </div>
          <div style={{ flex: 8, display: 'flex' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {
                notifications && notifications.map((notif, idx) => {
                  if (notif.etat === 'read') return null;
                  if (notif.type === 'msgDirection') return (
                    <ButtonGroup key={idx} color="primary" variant="text" aria-label="notification de la direction" className="NotificationItem">
                      <Button style={{ flex: 3, textAlign: 'left', paddingLeft: 16, lineHeight: 1.2 }} key={idx} onClick={() => { setNotifyModalOpening(true); setNotifyModalMsg(notif.quoi.msg) }}>
                        <div style={{ flex: 1 }}>
                          <div>{Object.entries(notif.quoi).map((o, index) => <span key={index}><b>{o[1].length > 20 ? o[1].substring(0, 20) + '...' : o[1]}</b></span>)}</div>
                          <div style={{ fontSize: '10px', color: '#777' }}>{users.filter(user => user.id === notif.deQui).map((u, index) => <span key={index} style={{ fontWeight: '700' }}>{u.nom} {u.prenom}</span>)} - <span style={{ color: '#3f4fb5e6' }}>{notif.quand.toDate().toLocaleString('fr')}</span></div>
                        </div>
                      </Button>
                      <IconButton onClick={() => suppressNotif(notif)}><CloseIcon /></IconButton>
                    </ButtonGroup>
                  )
                  if (notif.type === 'etatIntervention') return (
                    <ButtonGroup key={idx} color="primary" variant="text" aria-label="bouton groupé" className="NotificationItem">
                      <Button style={{ flex: 3, textAlign: 'left', paddingLeft: 16, lineHeight: 1.2 }} key={idx} onClick={() => {
                        let numInter = Object.entries(notif.quoi).map(o => o[0]);
                        setAnimateCurrentTask(false);
                        interventions.filter(inter => inter.codeInter === numInter[0]).map((o, i) => setTimeout(() => setCurrentTasks(o), 350));
                      }}>
                        <div style={{ flex: 1 }}>
                          <div>{Object.entries(notif.quoi).map((o, index) => <span key={index}><b>N° {o[0]} ({o[1]})</b></span>)}</div>
                          <div style={{ fontSize: '10px', color: '#777' }}>{users.filter(user => user.id === notif.deQui).map((u, index) => <span key={index} style={{ fontWeight: '700' }}>{u.nom} {u.prenom}</span>)} - <span style={{ color: '#3f4fb5e6' }}>{notif.quand.toDate().toLocaleString('fr')}</span></div>
                        </div>
                      </Button>
                      <IconButton onClick={() => suppressNotif(notif)}>
                        <CloseIcon />
                      </IconButton>
                    </ButtonGroup>
                  )
                })
              }
            </div>
          </div>
        </div>
        <div className={messageInDrawerOpened ? "rightBarMsg rightBarMsgOpen" : "rightBarMsg rightBarMsgClose"}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginRight: '4px' }}>
            <div style={{ overflow: 'auto', height: 'calc(100vh - 424px)', display: 'flex', flexDirection: 'column' }}>{users.map((user, i) => user.role !== 'dev' && user.id !== userId && <div onClick={() => setMessageUserId(user.id)} key={i} style={{ flex: 1, marginBottom: '12px', marginTop: 0, borderBottom: '1px solid #aaa', fontWeight: '700', color: '#eee', padding: '8px 4px', cursor: 'pointer', fontSize: '12px', order: (userMessaged.indexOf(user.id) !== -1) ? -1 : 1 }}><Badge color="secondary" variant="dot" invisible={(userMessaged.indexOf(user.id) === -1)}><span style={{ padding: '0 16px 0 0' }}>{user.nom} {user.prenom}</span></Badge></div>)}</div>
          </div>
        </div>
        {/* revoir les message comme sur gmail */}
        <div className={messageInDrawerOpened ? "LeftContentSmallMessage LeftContentSmallOpenMessage" : "LeftContentSmallMessage LeftContentSmallCloseMessage"}>
          <div style={{ flex: 1 }}>
            <Typography align="center" component="h4">Messages</Typography>
          </div>
          <div style={{ flex: 8, display: 'flex' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginRight: '4px' }}>
              <div style={{ overflow: 'auto', height: 'calc(100vh - 424px)', display: 'flex', flexDirection: 'column' }}>{users.map((user, i) => user.role !== 'dev' && user.id !== userId && <div onClick={() => setMessageUserId(user.id)} key={i} style={{ flex: 1, marginBottom: '12px', marginTop: 0, borderBottom: '1px solid #aaa', fontWeight: '700', color: '#eee', padding: '8px 4px', cursor: 'pointer', fontSize: '12px', order: (userMessaged.indexOf(user.id) !== -1) ? -1 : 1 }}><Badge color="secondary" variant="dot" invisible={(userMessaged.indexOf(user.id) === -1)}><span style={{ padding: '0 16px 0 0' }}>{user.nom} {user.prenom}</span></Badge></div>)}</div>
            </div>
            <div style={{ flex: 3, padding: '0 8px', marginLeft: '4px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', maxHeight: 'calc(100vh - 540px)' }}>
                {messages.filter(msg => (msg && (msg.to === messageUserId || msg.from === messageUserId))).map((o, i) => {
                  return o.conversation.map((u, idx) => {
                    if (messageUserId === u.from)
                      return (
                        <div key={idx} style={{ display: 'flex', margin: '4px 2px' }}>
                          <div style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', margin: '0 0 8px', borderRadius: '6px', background: '#ddd', color: '#333' }}>
                            <div><span>{u.quoi}</span></div>
                            <div style={{ fontSize: '10px', color: '#777' }}><span>{u.quand.toDate().toLocaleString('fr')}</span></div>
                          </div>
                          <div style={{ flex: 1 }}></div>
                        </div>
                      )
                    if (messageUserId === u.to)
                      return (
                        <div key={idx} style={{ display: 'flex', margin: '4px 2px' }}>
                          <div style={{ flex: 1 }}></div>
                          <div style={{ flex: 1, padding: '4px 8px', border: '1px solid #3f4fb5', margin: '0 0 8px', borderRadius: '6px', background: '#3f4fb5e6' }}>
                            <div><span>{u.quoi}</span></div>
                            <div style={{ fontSize: '10px', color: '#bbb' }}><span>{u.quand.toDate().toLocaleString('fr')}</span></div>
                          </div>
                        </div>
                      )
                    return '';
                  })
                })}
              </div>
              <div style={{ height: '108px', padding: '2px 0 8px 0' }}>
                <Button onClick={addNewMessage} style={{ marginBottom: '8px', width: '100%', textTransform: 'capitalize', padding: '4px', background: '#3f4fb5', color: 'white' }}>Envoyer</Button>
                <TextField variant="outlined" placeholder="Message" fullWidth multiline rows={3} value={addMessage} onChange={(e) => setAddMessage(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="centerContent" style={{ flex: 5 }}>
          <div style={{ overflow: 'auto', height: '100%', paddingLeft: '52px', paddingRight: '8px' }}>
            {<CalendarInter date={date} syndic={syndic} colorizedState={colorizedState} setAnimateCurrentTask={setAnimateCurrentTask} setCurrentInterId={setCurrentInterId} setCurrentTasks={setCurrentTasks} allTechniciens={usersTechnicien} weekTasks={dailyInterventions} />}
          </div>
        </div>

        <div className="rightContent" style={{ flex: 2, borderLeft: '1px solid #ddd' }}>
          {currentTasks &&
            <Slide direction="left" in={animateCurrentTask} timeout={{ enter: 250, exit: 250 }} mountOnEnter unmountOnExit>
              <div>
                {(currentTasks.agence === syndic) && (currentTasks.etat === 'En attente' || currentTasks.etat === 'SAV') && <div key="wrapper_0" className="actionBtnWrapper">
                  <TooltipBtn title="Supprimer"><IconButton onClick={suppressCurrentInter} aria-label="delete" style={{ color: 'white' }}><DeleteIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Réaffecter"><IconButton onClick={handleClickChangeCurrentInterTech} aria-label="affect" style={{ color: 'white' }}><PersonIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Editer"><IconButton onClick={() => setEditModal(true)} aria-label="edit" style={{ color: 'white' }}><EditIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Annuler"><IconButton onClick={() => updateCurrentInterState('Annulée')} aria-label="annuler" style={{ color: 'white' }}><CloseIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Terminer"><IconButton onClick={() => updateCurrentInterState('Finalisée')} aria-label="terminer" style={{ color: 'white' }}><CheckIcon /></IconButton></TooltipBtn>
                </div>}
                {(currentTasks.agence === syndic) && currentTasks.etat === 'En cours' && <div key="wrapper_0" className="actionBtnWrapper">
                  <TooltipBtn title="SAV"><IconButton onClick={() => updateCurrentInterState('SAV')} aria-label="reactiver" style={{ color: 'white' }}><AnnouncementIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Editer"><IconButton onClick={() => setEditModal(true)} aria-label="edit" style={{ color: 'white' }}><EditIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Terminer"><IconButton onClick={() => updateCurrentInterState('Finalisée')} aria-label="terminer" style={{ color: 'white' }}><CheckIcon /></IconButton></TooltipBtn>
                </div>}
                {(currentTasks.agence === syndic) && (currentTasks.etat === 'Terminée' || currentTasks.etat === 'PasTerminée') && <div key="wrapper_0" className="actionBtnWrapper">
                  <TooltipBtn title="SAV"><IconButton onClick={() => updateCurrentInterState('SAV')} aria-label="reactiver" style={{ color: 'white' }}><AnnouncementIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Terminer"><IconButton onClick={() => updateCurrentInterState('Finalisée')} aria-label="terminer" style={{ color: 'white' }}><CheckIcon /></IconButton></TooltipBtn>
                </div>}
                {(currentTasks.agence === syndic) && currentTasks.etat === 'Refusée' && <div key="wrapper_0" className="actionBtnWrapper">
                  <TooltipBtn title="Supprimer"><IconButton onClick={suppressCurrentInter} aria-label="delete" style={{ color: 'white' }}><DeleteIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Réactiver"><IconButton onClick={() => updateCurrentInterState('En attente')} aria-label="reactiver" style={{ color: 'white' }}><FlipCameraAndroidIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Editer"><IconButton onClick={() => setEditModal(true)} aria-label="edit" style={{ color: 'white' }}><EditIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Annuler"><IconButton onClick={() => updateCurrentInterState('Annulée')} aria-label="annuler" style={{ color: 'white' }}><CloseIcon /></IconButton></TooltipBtn>
                </div>}
                {(currentTasks.agence === syndic) && currentTasks.etat === 'Annulée' && <div key="wrapper_0" className="actionBtnWrapper">
                  <TooltipBtn title="Réactiver"><IconButton onClick={() => updateCurrentInterState('En attente')} aria-label="reactiver" style={{ color: 'white' }}><FlipCameraAndroidIcon /></IconButton></TooltipBtn>
                </div>}
                {(currentTasks.agence === syndic) && currentTasks.etat === 'Finalisée' && <div key="wrapper_0" className="actionBtnWrapper">
                  <TooltipBtn title="SAV"><IconButton onClick={() => updateCurrentInterState('SAV')} aria-label="reactiver" style={{ color: 'white' }}><AnnouncementIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Facturée"><IconButton onClick={() => updateCurrentInterState('Facturée')} aria-label="delete" style={{ color: 'white' }}><AssignmentTurnedInIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Payée"><IconButton onClick={() => updateCurrentInterState('Payée')} aria-label="delete" style={{ color: 'white' }}><EuroIcon /></IconButton></TooltipBtn>
                </div>}
                {(currentTasks.agence === syndic) && currentTasks.etat === 'Facturée' && <div key="wrapper_0" className="actionBtnWrapper">
                  <TooltipBtn title="SAV"><IconButton onClick={() => updateCurrentInterState('SAV')} aria-label="reactiver" style={{ color: 'white' }}><AnnouncementIcon /></IconButton></TooltipBtn>
                  <TooltipBtn title="Payée"><IconButton onClick={() => updateCurrentInterState('Payée')} aria-label="delete" style={{ color: 'white' }}><EuroIcon /></IconButton></TooltipBtn>
                </div>}
                {(currentTasks.agence !== syndic) && <div key="wrapper_0" className="actionBtnWrapper">
                  <TooltipBtn title="Affecter au calendrier"><IconButton onClick={updateCurrentInterSyndic} aria-label="delete" style={{ color: 'white' }}><SwapHorizIcon /></IconButton></TooltipBtn>
                </div>}
                <Card key="wrapper_1" elevation={1}>
                  <CardContent key="wrapper_1-1" className={"CardHeaderWrapper " + colorizedState('bg', currentTasks)} style={{ color: '#fff' }}>
                    <Typography variant="body2" style={{ display: 'flex' }} component="div">
                      <div style={{ flex: 5 }}><span style={{ fontWeight: '700', fontSize: '24px' }}>{"N°" + currentTasks.codeInter}</span> <br /> {currentTasks.dateInter.toDate().toLocaleDateString('fr')}<br /> {unescape(currentTasks.hours)}</div>
                      <div style={{ flex: 1 }}><img style={{ maxWidth: '100%' }} src={CagnotteChart[nbCagnotte].default} alt="completionInter" /></div>
                    </Typography>
                  </CardContent>
                  <CardContent key="wrapper_1-2">
                    <Typography gutterBottom variant="h5" component="h2">
                      {unescape(currentTasks.names)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="div">
                      <TooltipBtn title="Voir l'adresse du client sur Google Maps"><div onClick={() => openAddrInGMaps(currentTasks.addr)} style={{ fontWeight: '700', cursor: 'pointer' }}>{unescape(currentTasks.addrText)}</div></TooltipBtn>
                      <div style={{ fontWeight: '700', marginTop: 12 }}>{unescape(currentTasks.tel.mobile)}</div>
                    </Typography>
                  </CardContent>
                  <CardContent key="wrapper_1-3" style={{ background: '#333', color: '#fff' }}>
                    <Typography variant="body2" component="div">
                      Materiel requis : <br />
                      <span style={{ fontWeight: '700' }}>{unescape(currentTasks.materiel.join(', '))}</span>
                    </Typography>
                  </CardContent>
                  {
                    (currentTasks.taches || []).map((cTask, i) => {
                      return (
                        <Fragment key={i}>
                          <Task tache={cTask} imgName={cTask.tache.image} imgRetourName={cTask.retourPhoto} suppressTask={suppressTask} />
                          {i < (currentTasks.taches.length - 1) && <hr style={{ border: 'none', borderBottom: ' 1px solid #ddd' }}></hr>}
                        </Fragment>
                      )
                    })
                  }
                  {ajouterTache &&
                    (
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
                    )
                  }
                  <CardActions key="wrapper_1-4" style={{ justifyContent: "center" }}>
                    {!ajouterTache &&
                      <Button size="small" color="primary" onClick={() => setAjouterTache(true)}>Ajouter une tache</Button>
                    }
                    {ajouterTache &&
                      <>
                        <Button size="small" color="error" onClick={() => setAjouterTache(false)}>Annuler l'ajout</Button>
                        <Button size="small" color="primary" onClick={() => { addTask(); setAjouterTache(false); }}>Valider</Button>
                      </>
                    }
                  </CardActions>
                </Card>
              </div>
            </Slide>
          }
        </div>
      </div>

      <Menu anchorEl={assignTechCurrentinterModal} keepMounted open={Boolean(assignTechCurrentinterModal)} onClose={() => handleCloseChangeCurrentInterTech(null)} >
        {usersTechnicien.map((t, index) => {
          return <MenuItem key={index} value={t.id} onClick={() => selectTechForCurrentInter(t.id)}>{t.nom + ' ' + t.prenom}</MenuItem>
        })}
      </Menu>

      <InterventionModal mode="editItem" open={editModal} close={() => setEditModal(false)} inter={currentTasks} userId={userId} syndic={syndic} techniciens={usersTechnicien} />


      {currentTasks && <Dialog open={animateCurrentTask} className="detailMobile" maxWidth="sm" fullWidth TransitionComponent={Transition} onClose={() => setCurrentTasks(null)}>
        <DialogTitle style={{ textAlign: 'center', background: '#3f51b5', color: '#fff' }}>Detail de l'intervention</DialogTitle>
        <div>
          <div>
            {(currentTasks.agence === syndic) && (currentTasks.etat === 'En attente' || currentTasks.etat === 'SAV') && <div key="wrapper_0" className="actionBtnWrapper">
              <IconButton onClick={suppressCurrentInter} aria-label="delete" style={{ color: 'white' }}><DeleteIcon /> Supprimer</IconButton>
              <IconButton onClick={handleClickChangeCurrentInterTech} aria-label="affect" style={{ color: 'white' }}><PersonIcon /> Réaffecter</IconButton>
              <IconButton onClick={() => setEditModal(true)} aria-label="edit" style={{ color: 'white' }}><EditIcon /> Editer</IconButton>
              <IconButton onClick={() => updateCurrentInterState('Annulée')} aria-label="annuler" style={{ color: 'white' }}><CloseIcon /> Annuler</IconButton>
              <IconButton onClick={() => updateCurrentInterState('Finalisée')} aria-label="terminer" style={{ color: 'white' }}><CheckIcon /> Terminer</IconButton>
            </div>}
            {(currentTasks.agence === syndic) && currentTasks.etat === 'En cours' && <div key="wrapper_0" className="actionBtnWrapper">
              <IconButton onClick={() => updateCurrentInterState('SAV')} aria-label="reactiver" style={{ color: 'white' }}><AnnouncementIcon /> SAV</IconButton>
              <IconButton onClick={() => setEditModal(true)} aria-label="edit" style={{ color: 'white' }}><EditIcon /> Editer</IconButton>
              <IconButton onClick={() => updateCurrentInterState('Finalisée')} aria-label="terminer" style={{ color: 'white' }}><CheckIcon /> Terminer</IconButton>
            </div>}
            {(currentTasks.agence === syndic) && (currentTasks.etat === 'Terminée' || currentTasks.etat === 'PasTerminée') && <div key="wrapper_0" className="actionBtnWrapper">
              <IconButton onClick={() => updateCurrentInterState('SAV')} aria-label="reactiver" style={{ color: 'white' }}><AnnouncementIcon /> SAV</IconButton>
              <IconButton onClick={() => updateCurrentInterState('Finalisée')} aria-label="terminer" style={{ color: 'white' }}><CheckIcon /> Terminer</IconButton>
            </div>}
            {(currentTasks.agence === syndic) && currentTasks.etat === 'Refusée' && <div key="wrapper_0" className="actionBtnWrapper">
              <IconButton onClick={suppressCurrentInter} aria-label="delete" style={{ color: 'white' }}><DeleteIcon /> Supprimer</IconButton>
              <IconButton onClick={() => updateCurrentInterState('En attente')} aria-label="reactiver" style={{ color: 'white' }}><FlipCameraAndroidIcon /> Réactiver</IconButton>
              <IconButton onClick={() => setEditModal(true)} aria-label="edit" style={{ color: 'white' }}><EditIcon /> Editer</IconButton>
              <IconButton onClick={() => updateCurrentInterState('Annulée')} aria-label="annuler" style={{ color: 'white' }}><CloseIcon /> Annuler</IconButton>
            </div>}
            {(currentTasks.agence === syndic) && currentTasks.etat === 'Annulée' && <div key="wrapper_0" className="actionBtnWrapper">
              <IconButton onClick={() => updateCurrentInterState('En attente')} aria-label="reactiver" style={{ color: 'white' }}><FlipCameraAndroidIcon /> Réactiver</IconButton>
            </div>}
            {(currentTasks.agence === syndic) && currentTasks.etat === 'Finalisée' && <div key="wrapper_0" className="actionBtnWrapper">
              <IconButton onClick={() => updateCurrentInterState('SAV')} aria-label="reactiver" style={{ color: 'white' }}><AnnouncementIcon /> SAV</IconButton>
              <IconButton onClick={() => updateCurrentInterState('Facturée')} aria-label="delete" style={{ color: 'white' }}><AssignmentTurnedInIcon /> Facturée</IconButton>
              <IconButton onClick={() => updateCurrentInterState('Payée')} aria-label="delete" style={{ color: 'white' }}><EuroIcon /> Payée</IconButton>
            </div>}
            {(currentTasks.agence === syndic) && currentTasks.etat === 'Facturée' && <div key="wrapper_0" className="actionBtnWrapper">
              <IconButton onClick={() => updateCurrentInterState('SAV')} aria-label="reactiver" style={{ color: 'white' }}><AnnouncementIcon /> SAV</IconButton>
              <IconButton onClick={() => updateCurrentInterState('Payée')} aria-label="delete" style={{ color: 'white' }}><EuroIcon /> Payée</IconButton>
            </div>}
            {(currentTasks.agence !== syndic) && <div key="wrapper_0" className="actionBtnWrapper">
              <IconButton onClick={updateCurrentInterSyndic} aria-label="delete" style={{ color: 'white' }}><SwapHorizIcon /> Affecter au calendrier</IconButton>
            </div>}
            <Card key="wrapper_1" elevation={1} square>
              <CardContent key="wrapper_1-1" className={"CardHeaderWrapper " + colorizedState('bg', currentTasks)} style={{ color: '#fff' }}>
                <Typography variant="body2" style={{ display: 'flex' }} component="div">
                  <div style={{ flex: 5 }}><span style={{ fontWeight: '700', fontSize: '24px' }}>{"N°" + currentTasks.codeInter}</span> <br /> {currentTasks.dateInter.toDate().toLocaleDateString('fr')}<br /> {unescape(currentTasks.hours)}</div>
                  <div style={{ flex: 1 }}><img style={{ maxWidth: '100%' }} src={CagnotteChart[nbCagnotte].default} alt="completionInter" /></div>
                </Typography>
              </CardContent>
              <CardContent key="wrapper_1-2">
                <Typography gutterBottom variant="h5" component="h2">
                  {unescape(currentTasks.names)}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="div">
                  <TooltipBtn title="Voir l'adresse du client sur Google Maps"><div onClick={() => openAddrInGMaps(currentTasks.addr)} style={{ fontWeight: '700', cursor: 'pointer' }}>{unescape(currentTasks.addrText)}</div></TooltipBtn>
                  <div style={{ fontWeight: '700', marginTop: 12 }}>{unescape(currentTasks.tel.mobile)}</div>
                </Typography>
              </CardContent>
              <CardContent key="wrapper_1-3" style={{ background: '#333', color: '#fff' }}>
                <Typography variant="body2" component="div">
                  Materiel requis : <br />
                  <span style={{ fontWeight: '700' }}>{unescape(currentTasks.materiel.join(', '))}</span>
                </Typography>
              </CardContent>
              {
                (currentTasks.taches || []).map((cTask, i) => {
                  return (
                    <Fragment key={i}>
                      <Task tache={cTask} imgName={cTask.tache.image} imgRetourName={cTask.retourPhoto} suppressTask={suppressTask} />
                      {i < (currentTasks.taches.length - 1) && <hr style={{ border: 'none', borderBottom: ' 1px solid #ddd' }}></hr>}
                    </Fragment>
                  )
                })
              }
              {ajouterTache &&
                (
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
                )
              }
              <CardActions key="wrapper_1-4" style={{ justifyContent: "center" }}>
                {!ajouterTache &&
                  <Button size="small" color="primary" onClick={() => setAjouterTache(true)}>Ajouter une tache</Button>
                }
                {ajouterTache &&
                  <>
                    <Button size="small" color="error" onClick={() => setAjouterTache(false)}>Annuler l'ajout</Button>
                    <Button size="small" color="primary" onClick={() => { addTask(); setAjouterTache(false); }}>Valider</Button>
                  </>
                }
              </CardActions>
            </Card>
          </div>
        </div>
      </Dialog>
      }

      {notifyModalOpening && <Dialog open={notifyModalOpening} maxWidth="sm" fullWidth TransitionComponent={Transition} onClose={() => setNotifyModalOpening(false)}>
        <DialogTitle style={{ textAlign: 'center', background: '#3f51b5', color: '#fff' }}>Notifications de la direction</DialogTitle>
        <div style={{ padding: 24, textAlign: 'center' }}>
          {notifyModalMsg}
        </div>
      </Dialog>}

      {cagnotteModalOpening && <Dialog open={cagnotteModalOpening} maxWidth="sm" fullWidth TransitionComponent={Transition} onClose={() => setCagnotteModalOpening(false)}>
        <DialogTitle style={{ textAlign: 'center', background: '#3f51b5', color: '#fff' }}>Cagnotte</DialogTitle>
        <div style={{ padding: 24, textAlign: 'center' }}>
        </div>
      </Dialog>}
      <Login open={!logged} userId={setUserId} setLogged={setLogged} />
      <audio autoPlay={true}>
        <source src="./son.mp3" />
      </audio>
    </div >
  );
}

export default App;
