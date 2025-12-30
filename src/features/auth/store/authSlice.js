import { createSlice } from '@reduxjs/toolkit';

const getStoredUser = () => {
    try {
        const user = localStorage.getItem('user');
        if (!user || user === 'undefined') return null;
        return JSON.parse(user);
    } catch (e) {
        return null;
    }
};

const initialState = {
    user: getStoredUser(),
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            if (token) localStorage.setItem('token', token);
            if (user) localStorage.setItem('user', JSON.stringify(user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            if (state.user) localStorage.setItem('user', JSON.stringify(state.user));
        },
    },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectIsHR = (state) =>
    state.auth.user?.role === 'hr' || state.auth.user?.role === 'admin';
export const selectUserPermissions = (state) => state.auth.user?.permissions || {};
export const selectToken = (state) => state.auth.token;
