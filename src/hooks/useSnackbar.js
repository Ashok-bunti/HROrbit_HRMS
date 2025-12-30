import { useState, useCallback } from 'react';

/**
 * useSnackbar - Custom hook to manage snackbar state consistently across the application
 * 
 * @returns {object} Object containing snackbar state and control functions
 * - snackbar: { open, message, severity }
 * - showSnackbar: function(message, severity)
 * - hideSnackbar: function()
 */
const useSnackbar = () => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    }, []);

    const hideSnackbar = useCallback(() => {
        setSnackbar(prev => ({
            ...prev,
            open: false
        }));
    }, []);

    return {
        snackbar,
        showSnackbar,
        hideSnackbar
    };
};

export default useSnackbar;
