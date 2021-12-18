import { useEffect, useState } from "react";

import './App.css';

import 'firebase/firestore';
import 'firebase/storage';
import "firebase/database";
import styled from 'styled-components';
import Calendar from "./Calendar";

import { useDispatch } from 'react-redux';
import { addSyndics, addUsers, addInterventions } from './features/calendar/CalendarSlice';
import { users } from "./usersList";
import { interventions } from "./interventionsList";
import { syndics } from "./syndicsList";

const Appli = styled.div`
  padding-top: 84px;
`;

function App(props) {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(addSyndics(syndics));
    dispatch(addUsers(users));
    dispatch(addInterventions(interventions));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Appli className="App">
      <div style={{ display: 'flex', width: '100%', height: '60px', background: 'linear-gradient(#fff, transparent)', position: 'absolute', top: 0, left: 0, right: 0 }}>
        <h2 style={{ paddingLeft: 30, color: '#3f51b5' }}>Marcel rénovation</h2>
      </div>
      <Calendar nbQuarter={52} />
    </Appli >
  );
}

export default App;
