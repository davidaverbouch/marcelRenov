import { useState, useEffect } from "react";
import { SchedulerDay } from './SchedulerDay';
import { Grow, Tooltip, withStyles } from '@material-ui/core';

const TooltipBtn = withStyles((theme) => ({
    tooltip: {
        backgroundColor: '#3f50b5',
        color: '#fff',
        padding: '.5em 1em',
        boxShadow: theme.shadows[1],
        fontSize: 14,
    },
}))(Tooltip);

function CalendarInter(props) {
    const [realHour, setRealHour] = useState(0);
    const [realMinute, setRealMinute] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [allTechniciens, setAllTechniciens] = useState(props.allTechniciens || []);
    const [weekTasks, setWeekTasks] = useState(props.weekTasks || []);

    useEffect(() => {
        if (props.allTechniciens) setAllTechniciens(props.allTechniciens);
        if (props.weekTasks) setWeekTasks(props.weekTasks);
    }, [props]);

    useEffect(() => {
        let realHour = currentTime;
        setRealHour(realHour.getHours());
        setRealMinute(realHour.getMinutes());
        setTimeout(() => { setCurrentTime(new Date()) }, 60000);
    }, [currentTime]);

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

    const colorizedTaskState = (etat) => {
        let res = "";
        if (etat === 'Non réalisé') res = ' UnmakeStatePillule ';
        if (etat === 'Complete') res = ' CompleteState ';
        if (etat === 'Non complete') res = ' UncompleteStatePillule ';
        if (etat === 'Annulée') res = ' CancelState ';
        if (etat === 'Refusée') res = ' RejectState ';

        return res
    };

    return (
        <div className="SchedulerDayWrapper">
            <Grow in={allTechniciens.length > 0} timeout={{ enter: 500, exit: 250 }} mountOnEnter unmountOnExit>
                <div style={{ display: 'flex' }}>
                    {allTechniciens.map((t, index) => {
                        let bL = (index !== 0) ? '1px solid #ddd' : 'none';
                        return <div key={index} style={{ flex: 1, borderLeft: bL }}>
                            <div className="technicienId"><div style={{ fontWeight: '700' }}>{t.nom}<span style={{ fontWeight: '500' }}>{t.prenom.substr(0, 1)}.</span></div></div>
                            {
                                SchedulerDay.map((obj, i) => {
                                    let cN = (i % 2 === 0) ? 'halfHour hLines' : 'quartHour hLines';
                                    if (i % 4 === 0) cN = 'Hour hLines';

                                    let currentHoraire = obj.split('h');
                                    let currentHour = parseInt(currentHoraire[0]);
                                    let currentMinute = parseInt(currentHoraire[1]);
                                    if (realHour === currentHour && (realMinute >= currentMinute && (realMinute - currentMinute) < 15)) cN += ' selected ';

                                    return (
                                        <div key={i} className={cN}>
                                            {index === 0 && <span className="displayTime">{(i % 4 === 0) ? obj : ''}</span>}
                                            {weekTasks.filter(task => (task.technicien === t.id && task.dateInter.toDate().getDay() === props.date.getDay())).map((task, idx) => {
                                                let h = task.dateInter.toDate().getHours();
                                                let m = task.dateInter.toDate().getMinutes();
                                                if (h < 10) h = '0' + h;
                                                if (m < 10) m = '0' + m;
                                                let horaireTask = h + 'h' + m;

                                                let d = parseFloat(task.duree) / 0.25;
                                                let height = 18 * d;
                                                let otherSyndicCss = (task.agence === props.syndic) ? ' InterventionCardCurrent ' : ' InterventionCardOther ';

                                                if (horaireTask === obj) {
                                                    // console.log('refresh task')
                                                    let colorBGCard = colorizedState('bg', task);
                                                    return (
                                                        <TooltipBtn key={idx} title={(
                                                            <div>
                                                                {task.agence !== props.syndic && <div><div style={{ fontSize: 11, fontWeight: '700', marginBottom: '16px', border: '1px solid white', borderRadius: 4, padding: "8px" }}>Emploi du temps : {task.agence}</div></div>}
                                                                {task.agence === props.syndic && <div style={{ marginBottom: 14, fontWeight: '700' }}>{task.agence}</div>}
                                                                <div style={{ fontSize: 16, fontWeight: '700', marginBottom: 14 }}>{task.codeInter} - <span style={{ marginBottom: 8 }}><b>{unescape(task.etat)}</b> <span style={{ marginLeft: '4px', border: '1px solid white' }} className={"interventionTacheCouleurIndicator " + colorBGCard}> </span> </span></div>

                                                                <div style={{ fontSize: 14 }}><b>{unescape(task.names)}</b></div>
                                                                <div style={{ fontSize: 12 }}><b>De {unescape(task.hours)}</b></div>
                                                                <div style={{ fontSize: 12, marginBottom: 8 }}><b>Le {task.dateInter.toDate().toLocaleDateString('fr')}</b></div>
                                                                {task.taches.map((cTask, i) => {
                                                                    let colorBGTache = colorizedTaskState(cTask.etat);
                                                                    return <div key={i} style={{ margin: '6px, 0' }}><div><b>{unescape(cTask.tache.title)}</b></div> &nbsp;<span className={"interventionTacheCouleurIndicator " + colorBGTache}> </span> &nbsp;<b>{cTask.etat}</b></div>
                                                                })}
                                                            </div>
                                                        )} placement="right">
                                                            <div onClick={() => { props.setAnimateCurrentTask(false); setTimeout(() => { props.setCurrentInterId(idx); props.setCurrentTasks(task); }, 350); }} style={{ height: height }} className={"InterventionCard " + colorBGCard + otherSyndicCss}>N° {task.codeInter}</div>
                                                        </TooltipBtn>
                                                    );
                                                }
                                                else return false;
                                            })}
                                        </div>
                                    )
                                })
                            }
                        </div>
                    })}
                </div>
            </Grow>
        </div>
    )
}

export default CalendarInter;
