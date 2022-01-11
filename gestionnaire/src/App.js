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
  getCurrentDate,
  getUsers,
  addReducedInfo
} from './features/calendar/CalendarSlice';
import Login from "./login";

import { firestoreQuery, getInter, getFirestoreUsers, getFirestoreReducedInfo } from './firebaseConfig';

const Appli = styled.div`
  padding-top: ${(props) => props.logged ? '84px' : '0'};
`;

function App(props) {

  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);
  const [logged, setLogged] = useState(false);
  const [uid, setUid] = useState(false);
  const employes = useSelector(getUsers);
  const currentDate = useSelector(getCurrentDate);

  useEffect(() => {
    dispatch(clearIntervention())
    Object.values(employes).forEach(u => {
      Object.entries(u.interventionsList || {})
        .filter(o => o[0] === currentDate.replaceAll('/', '_'))
        .map(inter => {
          let keys = Object.keys(inter[1]);
          return keys.map(key => getInter(key.trim(), (i) => dispatch(addIntervention(i))))
        })
    })
  }, [currentDate, employes, dispatch]);

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

          // get intervention par utilisateur
          const listInter = o.interventionList || {};
          Object.entries(listInter)
            .filter(o => o[0] === new Date().toLocaleDateString())
            .map(inter => {
              let keys = Object.keys(inter[1]);
              return keys.map(key => getInter(key.trim(), (i) => dispatch(addIntervention(i))))
            })

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
          <div style={{ display: 'flex', width: '100%', height: '60px', position: 'absolute', top: 0, left: 0, right: 0 }}>
            <h2 style={{ paddingLeft: 30, paddingRight: 30, color: '#3f51b5' }}>Marcel rénovation</h2>
          </div>
          <Calendar nbQuarter={52} />
        </>
      }
    </Appli >
  );
}

export default App;
