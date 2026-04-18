import { configureStore } from '@reduxjs/toolkit';
import { scoringApi } from '../api/scoringApi';
import scoringSlice from './scoringSlice';

export const store = configureStore({
  reducer: {
    [scoringApi.reducerPath]: scoringApi.reducer,
    scoring: scoringSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(scoringApi.middleware),
});

