import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Divider,
    Link as MuiLink,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { useRegisterMutation } from '../store/authApi';
import logo_image from '../../../../public/logo.png';

const Register = () => {
    const navigate = useNavigate();
    const [register, { isLoading }] = useRegisterMutation();
    const theme = useTheme();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await register({
                email: formData.email,
                password: formData.password,
                role: formData.role,
            }).unwrap();

            navigate('/login', {
                state: { message: 'Registration successful! Please login.' },
            });
        } catch (err) {
            setError(err.data?.error || 'Registration failed');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'background.default',
            }}
        >
            <Container maxWidth={false} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                    elevation={4}
                    sx={{
                        width: 390,            // 👈 compact width
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        {/* Header */}
                        <Box textAlign="center" mb={2.5}>
                            <Box
                                component="img"
                                src={logo_image}
                                alt="Company Logo"
                                sx={{
                                    height: 42,
                                    mb: 1.5,
                                    objectFit: 'contain',
                                    filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none',
                                }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                HR Management System
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
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                sx={{ mb: 1.5 }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                sx={{ mb: 1.5 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                edge="end"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                sx={{ mb: 2.5 }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isLoading}
                                sx={{
                                    py: 1.3,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                }}
                            >
                                {isLoading ? <CircularProgress size={22} /> : 'Register'}
                            </Button>
                        </form>

                        <Divider sx={{ my: 2.5 }} />

                        <Typography variant="body2" align="center">
                            Already have an account?{' '}
                            <Link to="/login" style={{ textDecoration: 'none', fontWeight: 600 }}>
                                Login
                            </Link>
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Register;
