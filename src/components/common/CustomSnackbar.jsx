import { Snackbar, Alert, Slide } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

// Custom styled Alert with enhanced styling
const StyledAlert = styled(Alert)(({ theme, severity }) => ({
    width: '100%',
    borderRadius: 12,
    padding: '12px 20px',
    fontSize: '0.925rem',
    fontWeight: 600,
    backgroundColor: '#ffffff', // White background for all severities
    color: severity === 'success'
        ? theme.palette.success.main
        : severity === 'error'
            ? theme.palette.error.main
            : severity === 'warning'
                ? theme.palette.warning.main
                : theme.palette.info.main,

    '& .MuiAlert-icon': {
        fontSize: '1.5rem',
        marginRight: theme.spacing(1.5),
        color: severity === 'success'
            ? theme.palette.success.main
            : severity === 'error'
                ? theme.palette.error.main
                : severity === 'warning'
                    ? theme.palette.warning.main
                    : theme.palette.info.main,
    },

    '& .MuiAlert-message': {
        display: 'flex',
        alignItems: 'center',
        padding: 0,
        color: theme.palette.text.primary, // Use primary text color for better readability
    },

    '& .MuiAlert-action': {
        paddingLeft: theme.spacing(2),
    },
}));

// Slide transition component
function SlideTransition(props) {
    return <Slide {...props} direction="left" />;
}

// Icon mapping
const iconMapping = {
    success: <CheckCircleIcon fontSize="inherit" />,
    error: <ErrorIcon fontSize="inherit" />,
    warning: <WarningIcon fontSize="inherit" />,
    info: <InfoIcon fontSize="inherit" />,
};

/**
 * CustomSnackbar - A reusable, consistently styled Snackbar component
 * 
 * @param {boolean} open - Controls whether the snackbar is visible
 * @param {function} onClose - Callback function when snackbar is closed
 * @param {string} message - The message to display in the snackbar
 * @param {string} severity - The severity type: 'success', 'error', 'warning', or 'info'
 * @param {number} autoHideDuration - Duration in milliseconds before auto-hiding (default: 6000)
 * @param {object} anchorOrigin - Position of the snackbar (default: top-center)
 */
const CustomSnackbar = ({
    open,
    onClose,
    message,
    severity = 'success',
    autoHideDuration = 6000,
    anchorOrigin = { vertical: 'top', horizontal: 'center' }
}) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={anchorOrigin}
            TransitionComponent={SlideTransition}
            sx={{
                '& .MuiSnackbar-root': {
                    zIndex: 9999,
                }
            }}
        >
            <StyledAlert
                onClose={onClose}
                severity={severity}
                variant="filled"
                iconMapping={iconMapping}
            >
                {message}
            </StyledAlert>
        </Snackbar>
    );
};

export default CustomSnackbar;
