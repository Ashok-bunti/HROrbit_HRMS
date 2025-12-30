import { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials, logout as logoutAction, updateUser as updateUserAction } from '../features/auth/store/authSlice';
import { useLoginMutation, useRegisterMutation } from '../features/auth/store/authApi';
import { useVerifyMFALoginMutation } from '../features/auth/store/mfaApi';
import { selectCurrentUser, selectIsAuthenticated, selectIsAdmin, selectIsHR, selectToken } from '../features/auth/store/authSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isAdmin = useSelector(selectIsAdmin);
    const isHR = useSelector(selectIsHR);
    const token = useSelector(selectToken);

    const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
    const [registerMutation] = useRegisterMutation();
    const [verifyMFALoginMutation, { isLoading: isVerifyingMFA }] = useVerifyMFALoginMutation();

    const login = async (email, password, enableMfa = false) => {
        const result = await loginMutation({ email, password, enableMfa }).unwrap();
        if (result.token) {
            dispatch(setCredentials({ user: result.user, token: result.token }));
        }
        return result;
    };

    const verifyMFALogin = async (mfaData) => {
        const result = await verifyMFALoginMutation(mfaData).unwrap();
        if (result.token) {
            dispatch(setCredentials({ user: result.user, token: result.token }));
        }
        return result;
    };

    const logout = () => {
        dispatch(logoutAction());
    };

    const register = async (userData) => {
        return await registerMutation(userData).unwrap();
    };

    const updateUser = (updatedUser) => {
        dispatch(updateUserAction(updatedUser));
    };

    const value = {
        user,
        loading: isLoggingIn || isVerifyingMFA,
        login,
        verifyMFALogin,
        logout,
        register,
        updateUser,
        isAuthenticated,
        isAdmin,
        isHR,
        token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
