import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isOpenDetail: false,
    currentDate: new Date().toLocaleDateString(),
    currentSyndic: 'Foncia',
    currentIntervention: false,
    syndics: {},
    users: {},
    interventions: {},
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
                Object.keys(action.payload).forEach((o, i) => {
                    state.users[o] = action.payload[o];
                });
            },
        },
        addInterventions: {
            reducer: (state, action) => {
                Object.keys(action.payload).forEach((o, i) => {
                    state.interventions[o] = action.payload[o];
                });
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
            reducer: (state, action) => { state.currentIntervention = state.interventions[action.payload]; },
        }
    },
});

export const {
    setOpenDetail,
    addSyndics,
    addUsers,
    addInterventions,
    setCurrentDate,
    setCurrentIntervention,
    setCurrentSyndic } = calendarSlice.actions;

// Get global object
export const getSyndics = (state) => state.calendar.syndics;
export const getUsers = (state) => state.calendar.users;
export const getInterventions = (state) => state.calendar.interventions;

// get one instance of object
export const getSyndic = (state, id) => state.calendar.syndics[id];
export const getUser = (state, id) => state.calendar.users[id];
export const getIntervention = (state, id) => state.calendar.interventions[id];
export const getCurrentIntervention = (state) => state.calendar.currentIntervention;
export const getCurrentSyndic = (state) => state.calendar.currentSyndic;
export const getCurrentDate = (state) => state.calendar.currentDate;

export const detailIsOpen = (state) => state.calendar.isOpenDetail;

export default calendarSlice.reducer;
