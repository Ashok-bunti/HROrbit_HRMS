import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Stack, CircularProgress } from '@mui/material';
import {
    TimerOutlined,
    FiberManualRecord
} from '@mui/icons-material';
import { format } from 'date-fns';

const AttendanceWidget = ({
    attendance,
    onClockIn,
    onClockOut,
    isClockingIn,
    isClockingOut,
    todayAttendance
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const defaultAttendance = {
        date: format(new Date(), 'EEEE, MMMM dd, yyyy'),
        checkIn: '--:--',
        checkOut: '--:--',
        workingHours: '0h 0m',
        status: 'Not Checked In'
    };

    const data = { ...defaultAttendance, ...attendance };

    const getStatusTheme = (status) => {
        switch (status) {
            case 'Present': return { color: '#22C55E', bg: '#DCFCE7' };
            case 'Checked Out': return { color: '#9666D6', bg: '#F4F0FA' };
            case 'Absent': return { color: '#EF4444', bg: '#FEE2E2' };
            case 'On Leave': return { color: '#F59E0B', bg: '#FEF3C7' };
            default: return { color: '#7A7A7A', bg: '#F3F4F6' };
        }
    };

    const theme = getStatusTheme(data.status);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 0,
                bgcolor: 'background.paper',
                borderRadius: 2,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Decorative Background Blob */}
            <Box
                sx={{
                    position: 'absolute',
                    right: -40,
                    top: -40,
                    width: 180,
                    height: 180,
                    bgcolor: 'primary.lighter',
                    borderRadius: '50%',
                    opacity: 0.3,
                    zIndex: 0
                }}
            />

            <Box sx={{ p: 2.5, position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Header Section */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} mt={-10}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                            Daily Attendance
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {data.date}
                        </Typography>
                    </Box>
                    <Box sx={{
                        mt: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        bgcolor: theme.bg,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: `${theme.color}30`
                    }}>
                        <FiberManualRecord sx={{ fontSize: 8, color: theme.color }} />
                        <Typography variant="caption" sx={{ color: theme.color, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                            {data.status}
                        </Typography>
                    </Box>
                </Stack>

                {/* Central Time Display */}
                <Box sx={{ textAlign: 'center', my: 1.5 }}>
                    <Stack direction="row" alignItems="baseline" justifyContent="center" spacing={1}>
                        <Typography sx={{
                            fontWeight: 900,
                            color: 'primary.main',
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            lineHeight: 1,
                            letterSpacing: '-0.03em'
                        }}>
                            {format(currentTime, 'hh:mm')}
                        </Typography>
                        <Typography sx={{
                            fontSize: { xs: '1rem', md: '1.4rem' },
                            fontWeight: 700,
                            color: 'text.secondary',
                            lineHeight: 1,
                            opacity: 0.8
                        }}>
                            {format(currentTime, 'a')}
                        </Typography>
                    </Stack>
                </Box>

                {/* Timeline Stats Row */}
                <Stack
                    direction="row"
                    sx={{
                        mt: 2,
                        p: 0.75,
                        bgcolor: 'primary.light',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -15,
                            left: -15,
                            width: 60,
                            height: 60,
                            bgcolor: 'rgba(255,255,255,0.3)',
                            borderRadius: '50%',
                            zIndex: 0
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -20,
                            right: -10,
                            width: 90,
                            height: 90,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                            zIndex: 0
                        }
                    }}
                >
                    <Box sx={{ flex: 1, py: 1, textAlign: 'center', borderRight: '1px solid', borderColor: 'divider', position: 'relative', zIndex: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.25, fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.05em' }}>ENTRY</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>{data.checkIn}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, py: 1, textAlign: 'center', borderRight: '1px solid', borderColor: 'divider', position: 'relative', zIndex: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.25, fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.05em' }}>EXIT</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>{data.checkOut}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, py: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.25, fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.05em' }}>WORKING</Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                            <TimerOutlined sx={{ fontSize: 14, color: 'primary.main', opacity: 0.8 }} />
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>{data.workingHours}</Typography>
                        </Stack>
                    </Box>
                </Stack>
            </Box>

            {/* Action Buttons Section */}
            <Box sx={{
                p: 2.5,
                bgcolor: 'primary.lighter',
                borderTop: '1px solid',
                borderColor: 'primary.light',
                position: 'relative',
                zIndex: 1
            }}>
                <Stack direction="row" spacing={2}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={onClockIn}
                        disabled={isClockingIn || todayAttendance?.check_in_time}
                        sx={{
                            py: 1.25,
                            borderRadius: 2,
                            fontWeight: 800,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 12px rgba(150, 102, 214, 0.2)',
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' },
                            '&.Mui-disabled': {
                                bgcolor: 'action.disabledBackground',
                                color: 'action.disabled'
                            }
                        }}
                    >
                        {isClockingIn ? <CircularProgress size={20} color="inherit" /> : 'Clock In'}
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={onClockOut}
                        disabled={isClockingOut || !todayAttendance?.check_in_time || todayAttendance?.check_out_time}
                        sx={{
                            py: 1.25,
                            borderRadius: 2,
                            fontWeight: 800,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            bgcolor: 'background.paper',
                            color: 'primary.main',
                            border: '1.5px solid',
                            borderColor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'rgba(150, 102, 214, 0.05)',
                                borderWidth: 1.5
                            },
                            '&.Mui-disabled': {
                                borderColor: 'action.disabled',
                                color: 'action.disabled',
                                bgcolor: 'transparent'
                            }
                        }}
                    >
                        {isClockingOut ? <CircularProgress size={20} /> : 'Clock Out'}
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
};

export default AttendanceWidget;
