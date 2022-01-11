import { createSlice } from '@reduxjs/toolkit';
import { getInter } from '../../firebaseConfig';

const initialState = {
    isOpenDetail: false,
    currentGestionnaireId: false,
    currentDate: new Date().toLocaleDateString(),
    currentSyndic: 'Foncia',
    currentIntervention: false,
    currentInterventionId: false,
    syndics: {},
    users: {},
    interventions: {},
    interToday: {},
    interTomorrow: {},
    reducedInfo: {}
};

export const calendarSlice = createSlice({
    name: 'calendar',
    initialState,

    reducers: {
        setOpenDetail: {
            reducer: (state, action) => {
                if (state.isOpenDetail !== action.payload) state.isOpenDetail = action.payload;
            },
        },
        addSyndics: {
            reducer: (state, action) => {
                Object.keys(action.payload).forEach((o, i) => {
                    state.syndics[o] = action.payload[o];
                });
            },
        },
        addUsers: {
            reducer: (state, action) => {
                state.users = action.payload;
            },
        },
        clearIntervention: {
            reducer: (state, action) => {
                state.interventions = {};
            },
        },
        addInterventionToday: {
            reducer: (state, action) => {
                state.interToday[action.payload.uid.trim()] = action.payload;
            },
        },
        addInterventionTomorrow: {
            reducer: (state, action) => {
                state.interTomorrow[action.payload.uid.trim()] = action.payload;
            },
        },
        addIntervention: {
            reducer: (state, action) => {
                state.interventions[action.payload.uid.trim()] = action.payload;
            },
        },
        addInterventions: {
            reducer: (state, action) => {
                Object.keys(action.payload).forEach((o, i) => {
                    state.interventions[o] = action.payload[o];
                });
            },
        },
        addReducedInfo: {
            reducer: (state, action) => {
                state.reducedInfo = action.payload;
            },
        },
        setCurrentDate: {
            reducer: (state, action) => {
                state.currentDate = new Date(action.payload).toLocaleDateString();
            },
        },
        setCurrentSyndic: {
            reducer: (state, action) => { state.currentSyndic = action.payload; },
        },
        setCurrentIntervention: {
            reducer: (state, action) => { state.currentIntervention = state.interventions[action.payload]; state.currentInterventionId = action.payload },
        },
        setCurrentGestionnaireId: {
            reducer: (state, action) => { state.currentGestionnaireId = action.payload; },
        }
    },
});

export const {
    setOpenDetail,
    addSyndics,
    addUsers,
    clearIntervention,
    addIntervention,
    addInterventionToday,
    addInterventionTomorrow,
    addInterventions,
    addReducedInfo,
    setCurrentDate,
    setCurrentIntervention,
    setCurrentSyndic,
    setCurrentGestionnaireId } = calendarSlice.actions;

// Get global object
export const getSyndics = (state) => state.calendar.syndics;
export const getUsers = (state) => state.calendar.users;
export const getInterventions = (state) => state.calendar.interventions;
export const getInterventionsToday = (state) => state.calendar.interToday;
export const getInterventionsTomorrow = (state) => state.calendar.interTomorrow;
export const getCurrentInterventionId = (state) => state.calendar.currentInterventionId;

// get one instance of object
export const getSyndic = (state, id) => state.calendar.syndics[id];
export const getUser = (state, id) => state.calendar.users[id];
export const getIntervention = (state, id) => state.calendar.interventions[id];
export const getCurrentIntervention = (state) => state.calendar.currentIntervention;
export const getCurrentSyndic = (state) => state.calendar.currentSyndic;
export const getCurrentDate = (state) => state.calendar.currentDate;
export const getCurrentGestionnaireId = (state) => state.calendar.currentGestionnaireId;

export const detailIsOpen = (state) => state.calendar.isOpenDetail;

export const searchInfo = (state) => state.calendar.reducedInfo;

export default calendarSlice.reducer;
