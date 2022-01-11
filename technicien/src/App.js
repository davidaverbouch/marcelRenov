import { useEffect, useState } from "react";

import './App.css';

import 'firebase/firestore';
import 'firebase/storage';
import "firebase/database";
import { onAuthStateChanged } from "@firebase/auth";
import styled from 'styled-components';
import Calendar from "./Calendar";

import { useDispatch, useSelector } from 'react-redux';
import {
  addSyndics,
  addUsers,
  clearIntervention,
  addIntervention,
  addInterventionToday,
  addInterventionTomorrow,
  getCurrentDate,
  getUsers,
  addReducedInfo,
  getCurrentGestionnaireId,
  addInterventions
} from './features/calendar/CalendarSlice';
import Login from "./login";

import { firestoreQuery, getInter, getFirestoreUsers, getFirestoreReducedInfo } from './firebaseConfig';

const Appli = styled.div`
  padding-top: ${(props) => props.logged ? '68px' : '0'};
`;

function App(props) {

  const dispatch = useDispatch();
  const [online, setOnline] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [logged, setLogged] = useState(false);
  const [uid, setUid] = useState(false);
  const employes = useSelector(getUsers);
  const currentDate = useSelector(getCurrentDate);
  const currentGestionnaireId = useSelector(getCurrentGestionnaireId);

  window.ononline = function () { if (!online) setLogged(true); console.log(new Date().toLocaleString()); }
  window.onoffline = function () { setOnline(false); setLogged(false); console.log(new Date().toLocaleString()); }

  useEffect(() => {
    dispatch(clearIntervention());
    if (!(currentGestionnaireId && employes && employes[currentGestionnaireId])) return;
    const listInter = employes[currentGestionnaireId].interventionsList;
    const dateToday = new Date().toLocaleDateString().replaceAll('/', '_');
    const dateTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString().replaceAll('/', '_');
    const listInterToday = listInter[dateToday];
    const listInterTomorrow = listInter[dateTomorrow];

    if (listInterToday)
      Object.keys(listInterToday).map(key => getInter(key.trim(), (i) => {
        dispatch(addInterventionToday(i));
        dispatch(addIntervention(i));
      }));

    if (listInterTomorrow)
      Object.keys(listInterTomorrow).map(key => getInter(key.trim(), (i) => {
        dispatch(addInterventionTomorrow(i));
        dispatch(addIntervention(i));
      }));
  }, [employes, currentGestionnaireId, dispatch]);

  useEffect(() => {
    firestoreQuery('syndics', (s) => { dispatch(addSyndics(s)) });
    getFirestoreReducedInfo((s) => { dispatch(addReducedInfo(s)) });

    getFirestoreUsers((u) => {
      if (logged) {
        let res = {};
        u.map(o => {
          o.dateEntree = o.dateEntree.toDate().toLocaleDateString();
          o.dateNaissance = o.dateNaissance.toDate().toLocaleDateString();
          res[o.uid] = o;
          return o;
        });

        setLoaded(true);
        dispatch(addUsers(res));
      }
    });
  }, [logged, dispatch])

  return (
    <Appli logged={logged} className="App">
      <Login userId={setUid} setLogged={setLogged} />
      {loaded &&
        <>
          <div style={{ display: 'flex', width: '768px', maxWidth: '100%', margin: 'auto', height: '60px', position: 'absolute', top: 0, left: 0, right: 0 }}>
            <h2 style={{ paddingLeft: 30, paddingRight: 30, textAlign: 'center', width: '100%', color: '#3f51b5', fontSize: 24 }}>Marcel rénovation</h2>
          </div>
          <Calendar nbQuarter={52} />
        </>
      }
    </Appli >
  );
}

export default App;
