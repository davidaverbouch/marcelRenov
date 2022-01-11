import { configureStore } from '@reduxjs/toolkit';
import calendarReducer from '../features/calendar/CalendarSlice';

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
  },
});
