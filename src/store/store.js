import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import { payrollApi } from '../features/payroll/store/payrollApi';
import authReducer from '../features/auth/store/authSlice';

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        [payrollApi.reducerPath]: payrollApi.reducer,
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: { warnAfter: 128 },
            serializableCheck: { warnAfter: 128 },
        }).concat(apiSlice.middleware, payrollApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
