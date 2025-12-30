import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
import { Visibility, VisibilityOff, ArrowBack, LockReset } from '@mui/icons-material';
import { useResetPasswordMutation, useVerifyResetTokenQuery } from '../store/passwordResetApi';
import logo_image from '../../../../public/logo.png';
import rightImage from '../../../../public/african-american-employer-holding-employment-agreement-handshaking-candidate-close-up-view 1.png';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
    const { data: verifyData, isLoading: isVerifying, isError: isTokenInvalid } = useVerifyResetTokenQuery(token);

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

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
            await resetPassword({
                token,
                newPassword: passwords.newPassword
            }).unwrap();

            navigate('/login', {
                state: { message: 'Password reset successful! Please login with your new password.' }
            });
        } catch (err) {
            setError(err.data?.error || 'Failed to reset password');
        }
    };

    if (isVerifying) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.default'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isTokenInvalid) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.default',
                p: 2
            }}>
                <Card sx={{
                    maxWidth: 500,
                    p: 5,
                    width: '100%',
                    textAlign: 'center',
                    borderRadius: 2,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
                }}>
                    <Box sx={{ mb: 3 }}>
                        <LockReset sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom fontWeight="600">
                            Invalid Reset Link
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            The password reset link is invalid or has expired. Please request a new one.
                        </Typography>
                    </Box>
                    <Alert severity="error" sx={{ mb: 4, textAlign: 'left' }}>
                        Invalid or expired password reset link.
                    </Alert>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: 'column' }}>
                        <Button
                            variant="contained"
                            component={Link}
                            to="/forgot-password"
                            sx={{ py: 1.2, fontWeight: 600, textTransform: 'none' }}
                        >
                            Request New Link
                        </Button>
                        <MuiLink
                            component={Link}
                            to="/login"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none',
                                color: 'primary.main',
                                fontWeight: 500,
                                fontSize: '0.9rem'
                            }}
                        >
                            <ArrowBack sx={{ fontSize: 16, mr: 0.5 }} /> Back to Login
                        </MuiLink>
                    </Box>
                </Card>
            </Box>
        );
    }

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
                        width: { xs: '100%', md: '50%' },
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
                            Enter your new password below.
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
                                'Reset Password'
                            )}
                        </Button>
                    </form>
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
                        <Box sx={{
                            p: 2,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <LockReset sx={{ fontSize: 48, color: '#fff' }} />
                        </Box>

                        <Typography
                            sx={{
                                fontSize: '1.8rem',
                                fontWeight: 600,
                                fontFamily: '"Poppins", "Inter", sans-serif',
                                lineHeight: 1.3,
                                mb: 1.5,
                            }}
                        >
                            Secure Your{' '}
                            <Typography
                                component="span"
                                sx={{
                                    color: 'primary.contrastText',
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                }}
                            >
                                Account
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

export default ResetPassword;

