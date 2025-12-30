import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Link as MuiLink,
    IconButton,
    InputAdornment,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { useRequestPasswordResetMutation } from '../store/passwordResetApi';
import logo_image from '../../../../public/logo.png';
import rightImage from '../../../../public/african-american-employer-holding-employment-agreement-handshaking-candidate-close-up-view 1.png';

const ForgotPassword = () => {
    const theme = useTheme();
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
    const [requestReset, { isLoading, isSuccess }] = useRequestPasswordResetMutation();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await requestReset(formData.email).unwrap();
        } catch (err) {
            setError(err.data?.error || 'Failed to request password reset');
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
                            Reset your account password
                        </Typography>
                    </Box>

                    {isSuccess ? (
                        <>
                            <Alert severity="success" sx={{ mb: 3 }}>
                                If an account exists, a reset link has been sent to your email.
                            </Alert>

                            <Box mt={3}>
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
                        </>
                    ) : (
                        <>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="E-mail Address"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    sx={{ mb: 3 }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={isLoading}
                                    variant="contained"
                                    sx={{
                                        py: 1.4,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                    }}
                                >
                                    {isLoading ? (
                                        <CircularProgress size={22} sx={{ color: '#fff' }} />
                                    ) : (
                                        'Send Reset Link'
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
                        </>
                    )}
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

                    {/* CENTER TEXT - Matching Login component style */}
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
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Secure &{' '}
                            <Typography
                                component="span"
                                sx={{
                                    color: 'primary.contrastText',
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                }}
                            >
                                Simple Recovery
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
                            We'll help you get back into your account safely.
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Box>
    );
};

export default ForgotPassword;