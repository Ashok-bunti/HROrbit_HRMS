import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';

const CheckInWidget = ({ todayAttendance, onClockIn, onClockOut, isClockingIn, isClockingOut }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const isCheckedIn = !!todayAttendance?.check_in_time && !todayAttendance?.check_out_time;
    const isCheckedOut = !!todayAttendance?.check_out_time;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                mb: 4,
                bgcolor: 'background.paper',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: '#fff', p: 1, borderRadius: '50%' }}>
                    <AccessTimeIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Ready for the day?</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Today - {currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant="body1" fontWeight="medium">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} hr
                </Typography>

                {isCheckedOut ? (
                    <Button
                        variant="contained"
                        disabled
                        sx={{
                            bgcolor: '#a855f7',
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
                        onClick={onClockOut}
                        disabled={isClockingOut}
                        endIcon={<HistoryToggleOffIcon />}
                        sx={{
                            bgcolor: '#ef4444',
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
                        onClick={onClockIn}
                        disabled={isClockingIn}
                        endIcon={<HistoryToggleOffIcon />}
                        sx={{
                            bgcolor: '#a855f7',
                            color: 'white',
                            textTransform: 'none',
                            borderRadius: 10,
                            px: 4,
                            '&:hover': { bgcolor: '#9333ea' }
                        }}
                    >
                        Check in
                    </Button>
                )}
            </Box>
        </Paper>
    );
};

export default CheckInWidget;
