import { useEffect, useState } from "react";

import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, Toolbar, AppBar, Typography, Button, Tooltip, Menu, MenuItem, Badge } from '@material-ui/core';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";

import { DatePicker, MuiPickersUtilsProvider, } from "@material-ui/pickers";

import InterventionModal from './InterventionModal';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import TextsmsIcon from '@material-ui/icons/Textsms';

const TooltipBtn = withStyles((theme) => ({
    tooltip: {
        backgroundColor: '#3f50b5',
        color: '#fff',
        padding: '.5em 1em',
        boxShadow: theme.shadows[1],
        fontSize: 14,
    },
}))(Tooltip);

export default function TopBar(props) {
    const [syndic, setSyndic] = useState('Foncia');
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);
    const [syndics, setSyndics] = useState(props.syndics || []);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleClickOpen = () => setOpen(true);
    const handleCloseModal = () => setOpen(false);
    const selectSyndic = (syndicVal) => {
        setSyndic(syndicVal);
        handleClose();
        props.selectSyndic(syndicVal)
    };

    useEffect(() => { if (props.syndics && props.syndics.length !== syndics.length) setSyndics(props.syndics) }, [props])

    return (
        <>
            <CssBaseline />
            <AppBar>
                <Toolbar>
                    <Button style={{ display: 'flex', minWidth: '48px', padding: 0, paddingRight: 8, paddingLeft: 8, marginRight: 36, alignItems: 'center' }} onClick={() => props.setCalendarInDrawerOpened(!props.calendarInDrawerOpened)}>
                        <CalendarTodayIcon style={{ height: 25, color: '#fff', marginTop: -4 }} />
                        <div style={{ height: 25, fontWeight: '700', color: '#fff', fontSize: '24px', paddingLeft: '6px', lineHeight: 1 }}>{(props.date.getDate() < 10) ? '0' + props.date.getDate() : props.date.getDate()} / </div>
                        <div style={{ height: 25, fontWeight: '700', color: '#eee', fontSize: '24px', paddingLeft: '6px', lineHeight: 1 }}>{((props.date.getMonth() + 1) < 10) ? '0' + (props.date.getMonth() + 1) : props.date.getMonth() + 1} / </div>
                        <div style={{ height: 25, fontWeight: '500', color: '#ccc', fontSize: '12px', paddingLeft: '6px', lineHeight: '28px' }}>{props.date.getFullYear()}</div>
                    </Button>
                    <div className={props.calendarInDrawerOpened ? "LeftContentSmallCalendar LeftContentSmallOpenCalendar" : "LeftContentSmallCalendar LeftContentSmallCloseCalendar"}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                            <DatePicker autoOk variant="static" openTo="date" value={props.date} onChange={props.changeDate} />
                        </MuiPickersUtilsProvider>
                    </div>
                    <Typography style={{ fontSize: '16px', fontWeight: '700' }} variant="h1"><Typography component="span" style={{ cursor: 'pointer', fontWeight: '700' }} onClick={handleClick}>{syndic}</Typography></Typography>
                    <Typography style={{ cursor: 'pointer', marginLeft: 32, lineHeight: 1, paddingLeft: 16 }}><TooltipBtn title="Ajouter une intervention"><IconButton onClick={handleClickOpen} style={{ padding: '6px' }}><AddIcon style={{ fontSize: 28, color: '#fff' }} /></IconButton></TooltipBtn></Typography>
                    <Typography style={{ flex: 1 }}></Typography>
                    <IconButton onClick={() => props.setHistoryInDrawerOpened(!props.historyInDrawerOpened)}>
                        {!props.historyInDrawerOpened && <MenuIcon style={{ color: '#fff' }} />}
                        {props.historyInDrawerOpened && <MenuOpenIcon style={{ color: '#fff' }} />}
                    </IconButton>
                    <IconButton onClick={() => { props.setMessageInDrawerOpened(!props.messageInDrawerOpened); props.messageInDrawerOpened && props.setPastilleMsg(false); props.setUserMessaged([]); }}>
                        <Badge color="secondary" badgeContent={props.userMessaged.length} invisible={!props.pastilleMsg}><TextsmsIcon style={{ color: '#fff' }} /></Badge>
                    </IconButton>
                    <IconButton onClick={() => { props.setNotificationInDrawerOpened(!props.notificationInDrawerOpened); props.notificationInDrawerOpened && props.setPastilleNotif(false); }}>
                        <Badge color="secondary" invisible={!props.pastilleNotif}><NotificationsIcon style={{ color: '#fff' }} /></Badge>
                    </IconButton>
                    <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose} > {syndics.map((s, i) => <MenuItem key={i} onClick={() => selectSyndic(s)}>{s}</MenuItem>)} </Menu>
                </Toolbar>
            </AppBar>
            <InterventionModal date={props.date} userId={props.userId} addMessageWhenNewInter={props.addMessageWhenNewInter} mode="addItem" open={open} close={handleCloseModal} syndic={syndic} techniciens={props.techniciens} />
        </>
    );
}