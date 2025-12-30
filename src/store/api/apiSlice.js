import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        // Only set header from localStorage if it hasn't been set specifically by an endpoint
        if (token && !headers.has('authorization')) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    console.log("BASE_QUERY_REQUEST:", args);
    let result = await baseQuery(args, api, extraOptions);
    console.log("BASE_QUERY_RESPONSE:", result);

    if (result.error && result.error.status === 401) {
        // specific check to avoid reloading on failed login attempt
        const url = typeof args === 'string' ? args : args.url;
        if (url !== '/auth/login' && url !== '/mfa/verify-login') {
            // Token expired or invalid - logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Auth', 'Employee', 'Department', 'Leave', 'Attendance', 'User', 'Holiday', 'Policy', 'Role'],
    endpoints: () => ({}),
});
