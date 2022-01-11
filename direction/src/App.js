import { useEffect, useState } from 'react';
import './App.css';
import { Typography, Slide } from '@material-ui/core';
import Employes from './Employes';
import Login from './login';

import 'firebase/firestore';
import firebase from 'firebase/app';
import Dashboard from './Dashboard';

function App() {
  const [logged, setLogged] = useState(false);
  const [visibilityDashboard, setVisibilityDashboard] = useState(false);
  const [userId, setUserId] = useState('');

  const dashboardVisibilityToggle = () => {
    setVisibilityDashboard(!visibilityDashboard);
  }

  useEffect(() => {
    if (userId !== '') {
      firebase.firestore().collection('users').get().then((o) => {
        let u = o.docs.map((doc, i) => {
          if (doc.id === userId) {
            if (!(doc.data().role === 'DIRECTION' || doc.data().role === 'dev')) {
              setLogged(false);
              firebase.auth().signOut().then(() => { console.log('deconnecté'); }).catch((error) => { console.log(error) });
            } else setLogged(true);
          }
          return { ...doc.data(), id: doc.id };
        });
      });
    }
  }, [userId]);

  return (
    <div className="App">
      <header className="App-header">
        <Typography style={{ padding: '8px 24px' }} component="h4">Marcel Renovation - Direction</Typography>
        <Typography style={{ padding: '8px 24px', borderLeft: '1px solid', cursor: 'pointer' }} component="h4" onClick={dashboardVisibilityToggle}>Dashboard</Typography>
        <Typography style={{ flex: 1 }}></Typography>
      </header>

      {logged && <Employes />}
      <Dashboard visibilityDashboard={visibilityDashboard} />
      <Login open={!logged} userId={setUserId} setLogged={setLogged} />
    </div>
  );
}

export default App;
