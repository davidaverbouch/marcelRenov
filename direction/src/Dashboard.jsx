import React, { useState, useEffect } from "react";
import 'firebase/firestore';
import firebase from 'firebase/app';

import {
    Chart,
    PieSeries,
    BarSeries,
    ArgumentAxis,
    ValueAxis,
    Legend,
    Tooltip,
} from '@devexpress/dx-react-chart-material-ui';

import { EventTracker, HoverState, Animation, Stack } from '@devexpress/dx-react-chart';

import {
    Paper,
    Slide,
} from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

const legendStyles = () => ({
    root: {
        display: 'flex',
        margin: 'auto',
        flexDirection: 'row',
    },
});

const legendStyles2 = () => ({
    root: {
        display: 'flex',
        margin: 'auto',
        flexDirection: 'row',
        flexWrap: 'wrap',
        '& li': {
            width: 'auto',
            flex: 1,
            minWidth: '33%',
            maxWidth: '50%'
        }
    },
});

const legendRootBase = ({ classes, ...restProps }) => (
    <Legend.Root {...restProps} className={classes.root} />
);

const Root = withStyles(legendStyles, { name: 'LegendRoot' })(legendRootBase);
const Root2 = withStyles(legendStyles2, { name: 'LegendRoot' })(legendRootBase);

const legendLabelStyles = () => ({
    label: {
        whiteSpace: 'nowrap',
    },
});

const legendLabelBase = ({ classes, ...restProps }) => (
    <Legend.Label className={classes.label} {...restProps} />
);

const Label = withStyles(legendLabelStyles, { name: 'LegendLabel' })(legendLabelBase);


export default function Dashboard(props) {

    const [inter, setInter] = useState();
    const [interMonth, setInterMonth] = useState([]);
    const [interEtat, setInterEtat] = useState([]);
    const [interByUser, setInterByUser] = useState([]);

    const init = () => {

        firebase.firestore().collection('interventions').get().then((o) => {
            let tmpInterEtat = [
                { etat: 'en attente', value: 0 },
                { etat: 'en cours', value: 0 },
                { etat: 'réalisé', value: 0 },
                { etat: 'non réalisée', value: 0 },
                { etat: 'facturé', value: 0 },
                { etat: 'payé', value: 0 }
            ];

            let tmpInterMonth = [
                { month: 'Jan', EnAttente: 0, EnCours: 0, Terminée: 0, PasTerminée: 0, Payée: 0, value: 0 },
                { month: 'Fev', EnAttente: 0, EnCours: 0, Terminée: 0, PasTerminée: 0, Payée: 0, value: 0 },
                { month: 'Mars', EnAttente: 0, EnCours: 0, Terminée: 0, PasTerminée: 0, Payée: 0, value: 0 },
                { month: 'Avr', EnAttente: 0, EnCours: 0, Terminée: 0, PasTerminée: 0, Payée: 0, value: 0 },
                { month: 'Mai', EnAttente: 0, EnCours: 0, Terminée: 0, PasTerminée: 0, Payée: 0, value: 0 },
                { month: 'Juin', EnAttente: 0, EnCours: 0, Terminée: 0, PasTerminée: 0, Payée: 0, value: 0 },
                { month: 'Juil', EnAttente: 0, EnCours: 0, Terminée: 0, PasTerminée: 0, Payée: 0, value: 0 },
                { month: 'Aout', EnAttente: 0, EnCours: 0, Terminée: 0, PasTerminée: 0, Payée: 0, value: 0 },
                { month: 'Sept', EnAttente: 0, EnCours: 0, Terminée: 0, PasTerminée: 0, Payée: 0, value: 0 },
                { month: 'Oct', EnAttente: 0, EnCours: 0, Terminée: 0, PasTerminée: 0, Payée: 0, value: 0 },
                { month: 'Nov', EnAttente: 0, EnCours: 0, Terminée: 0, PasTerminée: 0, Payée: 0, value: 0 },
                { month: 'Dec', EnAttente: 0, EnCours: 0, Terminée: 0, PasTerminée: 0, Payée: 0, value: 0 },
            ];

            let u = o.docs.map((doc, i) => {
                let e = doc.data().etat;
                if (e === 'en attente') tmpInterEtat[0].value++;
                if (e === 'en cours') tmpInterEtat[1].value++;
                if (e === 'réalisé') tmpInterEtat[2].value++;
                if (e === 'non réalisé') tmpInterEtat[3].value++;
                if (e === 'facturé') tmpInterEtat[4].value++;
                if (e === 'payé') tmpInterEtat[5].value++;

                let month = parseInt(doc.data().date.split(' ')[0].split('/')[1]) - 1;
                console.log(tmpInterMonth[month], tmpInterMonth, month)
                if (e === 'payé') tmpInterMonth[month].Payée++;
                else if (e === 'en cours') tmpInterMonth[month].EnCours++;
                else if (e === 'en attente') tmpInterMonth[month].EnAttente++;
                else if (e === 'non réalisé') tmpInterMonth[month].PasTerminée++;
                else if (e === 'réalisé') tmpInterMonth[month].Terminée++;
                else tmpInterMonth[month].PasTerminée++;
                tmpInterMonth[month].value++;

                return { ...doc.data(), id: doc.id };
            });
            setInterEtat(tmpInterEtat);
            setInterMonth(tmpInterMonth);

            console.log('Firebase - Liste des interventions', u);
            setInter(u);
        });


        firebase.firestore().collection('users').get().then((o) => {

            let tmpInterByUser = [];

            let u = o.docs.map((doc, i) => {
                if (doc.data().role !== 'technicien') return;
                tmpInterByUser.push({ id: doc.id, name: doc.data().nom + ' ' + doc.data().prenom, value: Object.keys(doc.data().interventionsList).length })
                return { ...doc.data(), id: doc.id };
            });
            console.log('Firebase - Liste des utilisateurs', u);
            setInterByUser(tmpInterByUser);
        });
    }

    useEffect(init, []);

    return (
        <Slide direction="down" in={props.visibilityDashboard} mountOnEnter unmountOnExit>
            <div className="dashboardWrapper">
                <div style={{ flex: 1, display: 'flex', padding: '24px 0', borderBottom: '1px solid #ccc' }}>
                    <Paper elevation={1} style={{ flex: 1 }}>
                        <h3>Interventions Totales</h3>
                        <Chart data={interEtat} >
                            <PieSeries valueField="value" argumentField="etat" />
                            <Legend position="bottom" rootComponent={Root2} labelComponent={Label} />
                            <EventTracker />
                            <Tooltip />
                            <Animation />
                        </Chart>
                    </Paper>
                    <Paper elevation={1} style={{ flex: 1 }}>
                        <h3>Interventions par technicien</h3>
                        <Chart data={interByUser} rotated>
                            <ArgumentAxis />
                            <ValueAxis />
                            <BarSeries valueField="value" argumentField="name" />
                            <EventTracker />
                            <Tooltip />
                            <Animation />
                        </Chart>
                    </Paper>
                </div>

            </div>
        </Slide>
    )
}