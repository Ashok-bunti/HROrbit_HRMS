import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    BeachAccess,
    LocalHospital,
    EventAvailable,
    PendingActions
} from '@mui/icons-material';

const StatCard = ({ icon, value, label, trend, trendUp, color }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                height: 100,
                borderRadius: '16px',
                px: '24px',
                py: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',

            }}
        >
            {/* LEFT SECTION */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                {/* ICON CONTAINER */}
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: `${color}12`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color,
                        boxShadow: `0 4px 10px ${color}15`
                    }}
                >
                    {React.cloneElement(icon, { sx: { fontSize: 24 } })}
                </Box>

                {/* CONTENT */}
                <Box>
                    <Typography
                        sx={{
                            fontSize: '22px',
                            fontWeight: 800,
                            color: 'text.primary',
                            lineHeight: 1,
                            mb: 0.5,
                            letterSpacing: '-0.02em'
                        }}
                    >
                        {value}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'text.secondary',
                            letterSpacing: '0.01em'
                        }}
                    >
                        {label}
                    </Typography>
                </Box>
            </Box>

            {/* RIGHT SECTION: Trend */}
            <Box sx={{ textAlign: 'right' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px',
                        color: trendUp ? '#10B981' : '#EF4444',
                        bgcolor: trendUp ? '#10B98112' : '#EF444412',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1
                    }}
                >
                    {trendUp ? (
                        <TrendingUp sx={{ fontSize: 14 }} />
                    ) : (
                        <TrendingDown sx={{ fontSize: 14 }} />
                    )}
                    <Typography sx={{ fontSize: '12px', fontWeight: 800 }}>
                        {trend}
                    </Typography>
                </Box>

                <Typography
                    sx={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'text.disabled',
                        mt: 0.75,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                    }}
                >
                    vs 30 days
                </Typography>
            </Box>
        </Paper>
    );
};

const LeaveBalanceWidget = ({ leaveBalance }) => {
    const stats = [
        {
            label: 'Casual Leaves',
            value: leaveBalance?.casual || 0,
            icon: <BeachAccess />,
            color: '#3B82F6',
            trend: '+2.1%',
            trendUp: true
        },
        {
            label: 'Sick Leaves',
            value: leaveBalance?.sick || 0,
            icon: <LocalHospital />,
            color: '#EF4444',
            trend: '-2%',
            trendUp: false
        },
        {
            label: 'Earned Leaves',
            value: leaveBalance?.earned || 0,
            icon: <EventAvailable />,
            color: '#10B981',
            trend: '+2%',
            trendUp: true
        },
        {
            label: 'Pending Requests',
            value: leaveBalance?.pending || 0,
            icon: <PendingActions />,
            color: '#F59E0B',
            trend: '+2.5%',
            trendUp: true
        }
    ];

    return (
        <>
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </>
    );
};

export default LeaveBalanceWidget;
