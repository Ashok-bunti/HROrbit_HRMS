import { useState } from 'react';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    Link as MuiLink,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Visibility, VisibilityOff, CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';
import { FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import MFAVerification from '../components/MFAVerification';
import logo_image from '../../../../public/logo.png';
import rightImage from '../../../../public/african-american-employer-holding-employment-agreement-handshaking-candidate-close-up-view 1.png';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { login, logout, user } = useAuth();

    // Clear ghost tokens on landing
    useState(() => {
        logout();
    }, []);

    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loadingType, setLoadingType] = useState(null); // 'normal', 'mfa', or null
    const [mfaRequired, setMfaRequired] = useState(false);
    const [userId, setUserId] = useState(null);
    const [mfaData, setMfaData] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLogin = async (isMfa = false) => {
        setError('');
        setLoadingType(isMfa ? 'mfa' : 'normal');

        try {
            const result = await login(formData.email, formData.password, isMfa);

            if (result.mfa_required || result.qrCode) {
                setMfaRequired(true);
                setUserId(result.user_id || result.userId);
                setMfaData(result);
                setLoadingType(null);
                return;
            }

            if (result.password_change_required) {
                navigate('/force-password-change', {
                    state: {
                        tempToken: result.temp_token,
                        email: formData.email
                    }
                });
                return;
            }

            const userRole = result.user?.role || result.role;
            if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else if (userRole === 'hr') {
                navigate('/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } catch (err) {
            setError(err.data?.error || 'Login failed. Please try again.');
            setLoadingType(null);
        }
    };

    const handleMFAVerificationSuccess = (result) => {
        if (result.password_change_required) {
            navigate('/force-password-change', {
                state: {
                    tempToken: result.temp_token,
                    email: formData.email
                }
            });
            return;
        }

        const userRole = result.user?.role || result.role;
        if (userRole === 'admin') {
            navigate('/admin/dashboard');
        } else if (userRole === 'hr') {
            navigate('/dashboard');
        } else {
            navigate('/employee/dashboard');
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
                {/* LEFT – LOGIN FORM */}
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
                            mb: mfaRequired ? 1 : 4,
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

                        {!mfaRequired && (
                            <Typography
                                sx={{
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    color: 'text.secondary',
                                }}
                            >
                                Login to your account
                            </Typography>
                        )}
                    </Box>

                    {mfaRequired ? (
                        <MFAVerification
                            userId={userId}
                            mfaData={mfaData}
                            onVerificationSuccess={handleMFAVerificationSuccess}
                            onBack={() => setMfaRequired(false)}
                        />
                    ) : (
                        <>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {location.state?.message && !error && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    {location.state.message}
                                </Alert>
                            )}

                            <form>
                                <TextField
                                    fullWidth
                                    label="E-mail Address"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
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
                                    sx={{ mb: 1.5 }}
                                />

                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={3}
                                >
                                    <FormControlLabel
                                        control={<Checkbox size="small" />}
                                        label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
                                    />

                                    <MuiLink component={Link} to="/forgot-password" sx={{ fontSize: '0.875rem' }}>
                                        Reset Password?
                                    </MuiLink>
                                </Box>

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={!!loadingType || !formData.email || !formData.password}
                                    variant="contained"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleLogin(false);
                                    }}
                                    sx={{
                                        py: 1.4,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        whiteSpace: 'nowrap',
                                        '&:hover': {
                                            bgcolor: theme.palette.primary.dark,
                                            boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                                        }
                                    }}
                                >
                                    {loadingType === 'normal' ? '...' : 'Login'}
                                </Button>
                            </form>
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
                            Manage all{' '}
                            <Typography
                                component="span"
                                sx={{
                                    color: 'primary.contrastText',
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                }}
                            >
                                HR Operations
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
                            from the comfort of your home.
                        </Typography>

                    </Box>
                </Box>
            </Card>
        </Box>
    );
};

export default Login;
