import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Link as MuiLink,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Visibility, VisibilityOff, ArrowBack, VpnKey } from '@mui/icons-material';
import { useForceChangePasswordMutation } from '../store/authApi';
import { useAuth } from '../../../context/AuthContext';
import logo_image from '../../../../public/logo.png';
import rightImage from '../../../../public/african-american-employer-holding-employment-agreement-handshaking-candidate-close-up-view 1.png';

const ForcePasswordChange = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { login } = useAuth();

    // Get temp token from location state (passed from Login.jsx)
    const tempToken = location.state?.tempToken;
    const email = location.state?.email;

    const [forceChangePassword, { isLoading: isResetting }] = useForceChangePasswordMutation();

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    if (!tempToken) {
        return <Navigate to="/login" replace />;
    }

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return 'Password must be at least 8 characters long';
        }
        if (!hasUpperCase) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!hasLowerCase) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!hasNumber) {
            return 'Password must contain at least one number';
        }
        if (!hasSpecialChar) {
            return 'Password must contain at least one special character';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const validationError = validatePassword(passwords.newPassword);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            await forceChangePassword({
                token: tempToken,
                newPassword: passwords.newPassword
            }).unwrap();

            navigate('/login', {
                state: { message: 'Password updated successfully! Please login with your new password.', email }
            });

        } catch (err) {
            setError(err.data?.error || 'Failed to update password');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.default',
                px: 2,
            }}
        >
            <Card
                sx={{
                    width: '100%',
                    maxWidth: 900,
                    minHeight: 520,
                    display: 'flex',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
                }}
            >
                {/* LEFT – FORM */}
                <Box
                    sx={{
                        width: '50%',
                        p: 5,
                        backgroundColor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    {/* LOGO */}
                    <Box
                        sx={{
                            mb: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                    >
                        <Box
                            component="img"
                            src={logo_image}
                            alt="Application Logo"
                            sx={{
                                height: 64,
                                mb: 2,
                                objectFit: 'contain',
                                filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none',
                            }}
                        />

                        <Typography
                            sx={{
                                fontSize: '1rem',
                                fontWeight: 500,
                                color: 'text.secondary',
                            }}
                        >
                            Update your password to continue
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="New Password"
                            name="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={passwords.newPassword}
                            onChange={handleChange}
                            required
                            autoFocus
                            placeholder="Min. 8 characters"
                            sx={{ mb: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwords.confirmPassword}
                            onChange={handleChange}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            disabled={isResetting}
                            variant="contained"
                            sx={{
                                py: 1.4,
                                fontWeight: 600,
                                textTransform: 'none',
                            }}
                        >
                            {isResetting ? (
                                <CircularProgress size={22} sx={{ color: '#fff' }} />
                            ) : (
                                'Set New Password'
                            )}
                        </Button>
                    </form>

                    {/* Back to Login */}
                    <Box
                        sx={{
                            mt: 3,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <MuiLink
                            component={Link}
                            to="/login"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                fontSize: 14,
                                fontWeight: 500,
                                color: 'primary.main',
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' },
                            }}
                        >
                            <ArrowBack sx={{ fontSize: 16, mr: 0.5 }} />
                            Back to Login
                        </MuiLink>
                    </Box>
                </Box>

                {/* RIGHT – IMAGE SECTION */}
                <Box
                    sx={{
                        width: '50%',
                        position: 'relative',
                        backgroundImage: `url(${rightImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: { xs: 'none', md: 'block' },
                    }}
                >
                    {/* OVERLAY */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            background: alpha(theme.palette.primary.main, 0.85),
                        }}
                    />

                    {/* CENTER TEXT */}
                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            color: '#fff',
                            px: 4,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '1.8rem',
                                fontWeight: 600,
                                fontFamily: '"Poppins", "Inter", sans-serif',
                                lineHeight: 1.3,
                                mb: 1.5,
                            }}
                        >
                            Enhanced{' '}
                            <Typography
                                component="span"
                                sx={{
                                    color: 'primary.contrastText',
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                }}
                            >
                                Data Security
                            </Typography>
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: '1rem',
                                fontWeight: 400,
                                fontFamily: '"Inter", sans-serif',
                                opacity: 0.9,
                                mb: 3,
                            }}
                        >
                            Protecting your information starts with a secure password.
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Box>
    );
};

export default ForcePasswordChange;
