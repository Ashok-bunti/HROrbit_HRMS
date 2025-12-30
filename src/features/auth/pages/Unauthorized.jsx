import React from 'react';
import { Box, Typography, Button, Paper, useTheme, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Unauthorized = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                // Use default background from theme (which includes the nice radial gradient in light mode)
                // or specific background color if needed to cover potential existing content
                backgroundColor: 'background.default',
            }}
        >
            <Paper
                elevation={theme.palette.mode === 'dark' ? 2 : 0}
                sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: 4,
                    maxWidth: 550,
                    width: '100%',
                    // Glassmorphism using theme paper color
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[10],
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box
                    sx={{
                        mb: 4,
                        p: 3,
                        borderRadius: '50%',
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 2s infinite ease-in-out',
                        '@keyframes pulse': {
                            '0%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.4)}` },
                            '70%': { transform: 'scale(1.05)', boxShadow: `0 0 0 15px ${alpha(theme.palette.error.main, 0)}` },
                            '100%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}` }
                        }
                    }}
                >
                    <HttpsOutlinedIcon sx={{ fontSize: 60, color: 'error.main' }} />
                </Box>

                <Typography variant="h3" component="h1" fontWeight="800" gutterBottom sx={{
                    color: 'text.primary',
                    mb: 2
                }}>
                    Access Denied
                </Typography>

                <Typography variant="h6" color="textSecondary" sx={{ mb: 1, fontWeight: 600 }}>
                    403 - Unauthorized Access
                </Typography>

                <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: '80%', lineHeight: 1.6 }}>
                    This area is restricted. You do not have the necessary permissions to view this content.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{
                            px: 4,
                            py: 1.5,
                        }}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<DashboardIcon />}
                        onClick={() => navigate('/dashboard')}
                        sx={{
                            px: 4,
                            py: 1.5,
                        }}
                    >
                        Return to Dashboard
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};


export default Unauthorized;
