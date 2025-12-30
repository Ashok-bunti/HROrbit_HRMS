import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Stack, Button } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SpaIcon from '@mui/icons-material/Spa';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';

const DashboardHeader = ({
    user,
    leaveStats,
    holidays,
    policies,
    todayAttendance,
    onClockIn,
    onClockOut,
    isClockingIn,
    isClockingOut
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const isCheckedIn = !!todayAttendance?.check_in_time && !todayAttendance?.check_out_time;
    const isCheckedOut = !!todayAttendance?.check_out_time;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return { text: 'Good Morning', icon: <WbSunnyIcon sx={{ color: '#FFD700', fontSize: 48 }} /> };
        } else if (hour >= 12 && hour < 17) {
            return { text: 'Good Afternoon', icon: <WbSunnyIcon sx={{ color: '#FFD700', fontSize: 48 }} /> };
        } else {
            return { text: 'Good Evening', icon: <WbSunnyIcon sx={{ color: '#4c1d95', fontSize: 48, transform: 'rotate(180deg)' }} /> };
        }
    };

    const { text, icon } = getGreeting();

    return (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            {/* Left: Greeting */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                    <Typography variant="h5" color="text.secondary">Hello,{user?.employee?.first_name || user?.email}
                    </Typography>
                    <Typography variant="h2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {text}
                        {icon}
                    </Typography>
                </Box>
            </Box>

            {/* Center: Check-In/Timer */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                mx: 2 // Add some margin to separate from other sections
            }}>
                <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: 'monospace', letterSpacing: 2, color: 'text.primary' }}>
                    {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ borderLeft: 1, borderColor: 'divider', pl: 3, py: 1 }}>
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </Typography>

                {isCheckedOut ? (
                    <Button
                        variant="contained"
                        disabled
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            textTransform: 'none',
                            borderRadius: 10,
                            px: 4,
                            '&:disabled': {
                                bgcolor: '#d8b4fe',
                                color: 'white'
                            }
                        }}
                    >
                        Completed
                    </Button>
                ) : isCheckedIn ? (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={onClockOut}
                        disabled={isClockingOut}
                        endIcon={<HistoryToggleOffIcon />}
                        sx={{
                            bgcolor: 'error.main',
                            color: 'white',
                            textTransform: 'none',
                            borderRadius: 10,
                            px: 4,
                            '&:hover': { bgcolor: '#dc2626' }
                        }}
                    >
                        Check out
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onClockIn}
                        disabled={isClockingIn}
                        endIcon={<HistoryToggleOffIcon />}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            textTransform: 'none',
                            borderRadius: 10,
                            px: 4,
                            '&:hover': { bgcolor: 'primary.main' }
                        }}
                    >
                        Check in
                    </Button>
                )}
            </Box>

            {/* Right: Stats */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'background.paper',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <CalendarTodayIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">{holidays?.name || 'Upcoming holiday'}</Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {holidays?.date || '--'} <Typography component="span" variant="body1" color="text.secondary">{holidays?.day || ''}</Typography>
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: 'background.paper',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                    >
                        <SpaIcon sx={{ fontSize: 28, color: 'success.main' }} />
                    </Box>

                    <Box>
                        <Typography variant="body2" color="text.secondary">Your leaves</Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {leaveStats?.stats?.approved || 0} <Typography component="span" variant="body1" color="text.secondary">Approved</Typography>
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'background.paper',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <MenuBookIcon sx={{ fontSize: 28, color: 'info.main' }} />
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">{policies?.name || 'Policies'}</Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {policies?.count || '0 min'} <Typography component="span" variant="body1" color="text.secondary">{policies?.action || 'Read'}</Typography>
                        </Typography>
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
};

export default DashboardHeader;
