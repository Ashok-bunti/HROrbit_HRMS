import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Stack,
    Chip,
    alpha,
    useTheme,
    CircularProgress,
    Divider,
    TextField,
    InputAdornment,
    Card,
    Tooltip,
    useMediaQuery,
} from '@mui/material';
import {
    Fingerprint,
    AccessTime,
    Login,
    Logout,
    History,
    Search,
    CalendarToday,
    Timer,
    NightsStay,
    Warning
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import { DataGrid } from '@mui/x-data-grid';
import { useGetBiometricUserHistoryQuery } from '../store/biometricApi';
import PageHeader from '../../../components/common/PageHeader';

const StatCard = ({ title, value, subtitle, color, icon: Icon, trend = "+0.0%" }) => {
    const theme = useTheme();
    // Consider positive if starts with +, is 'Active', 'Completed', or is neutral '0m'
    const isPositive = trend.startsWith('+') || ['Active', 'Completed', '0m'].includes(trend);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                height: '100%',
                width: '100%',
                borderRadius: '24px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.5),
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    borderColor: alpha(color, 0.5),
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    transform: 'scale(1.01)'
                }
            }}
        >
            <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '18px',
                bgcolor: 'primary.main',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
                <Icon sx={{ fontSize: '1.75rem' }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 700,
                        display: 'block',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 0.5
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="h5"
                    fontWeight="800"
                    sx={{
                        color: 'text.primary',
                        fontSize: '1.75rem',
                        lineHeight: 1.2,
                        letterSpacing: '-0.5px'
                    }}
                >
                    {value}
                </Typography>
            </Box>

            <Box sx={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
                <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{
                        color: isPositive ? 'success.main' : 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        fontSize: '0.9rem',
                        mb: 0.5,
                        bgcolor: isPositive ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                        px: 1,
                        py: 0.25,
                        borderRadius: '6px'
                    }}
                >
                    {trend}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.disabled',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mt: 'auto'
                    }}
                >
                    {subtitle}
                </Typography>
            </Box>
        </Paper>
    );
};

const EmployeeBiometricView = ({ attendanceData, user, isLoading }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [dateRange, setDateRange] = React.useState({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });

    const { data: historyResponse, isLoading: historyLoading } = useGetBiometricUserHistoryQuery({
        employeeId: user?.id,
        ...dateRange
    }, { skip: !user?.id });

    const historyData = historyResponse?.data || [];

    const myToday = attendanceData.find(a => a.employee_id === user?.id) || null;

    const formatTo12Hr = (timeStr) => {
        if (!timeStr || timeStr === '--:--') return timeStr;
        // If already in 12hr format, return as is
        if (timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
            return timeStr;
        }
        try {
            const parts = timeStr.split(':');
            const h = parseInt(parts[0]);
            const m = parts[1];
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${m.substring(0, 2).padStart(2, '0')} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    };

    return (
        <Box sx={{ pb: 5 }}>
            <PageHeader
                title="Personal Biometric Log"
                subtitle="Your real-time campus presence and sync status."
                action={null}
            />

            <Box sx={{ mb: 4 }}>
                <Box sx={{
                    mt: 2,
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 3,
                    alignItems: 'stretch',
                    mb: 4
                }}>
                    {/* Left Section: Stats Cards */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gridTemplateRows: 'repeat(2, 1fr)',
                        gap: 2,
                        width: '100%',
                        minHeight: 300
                    }}>
                        <StatCard
                            title="Today's Status"
                            value={myToday ? myToday.status : 'Not Clocked'}
                            color="#22c55e"
                            icon={Fingerprint}
                            subtitle="SESSION"
                            trend={myToday?.status === 'Active' ? 'Active' : 'N/A'}
                        />
                        <StatCard
                            title="Time Logged"
                            value={myToday ? `${Math.floor((myToday.total_worked_minutes || 0) / 60)}h ${myToday.total_worked_minutes % 60}m` : '0h 0m'}
                            color="#6366f1"
                            icon={AccessTime}
                            subtitle="WORKED"
                            trend="+0m"
                        />
                        <StatCard
                            title="Breaks Taken"
                            value={myToday ? `${myToday.breaks_count || 0}` : '0'}
                            color="#06b6d4"
                            icon={History}
                            subtitle="TOTAL BREAKS"
                            trend={`${myToday?.total_break_minutes || 0}m`}
                        />
                        <StatCard
                            title="Overtime"
                            value={myToday?.overtime_minutes ? `${myToday.overtime_minutes}m` : '0m'}
                            color="#8b5cf6"
                            icon={History}
                            subtitle="EXTRA HOURS"
                            trend={myToday?.overtime_minutes > 0 ? `+${myToday.overtime_minutes}m` : '0m'}
                        />
                    </Box>

                    {/* Right Section: Today's Activity */}
                    <Paper sx={{
                        p: 3,
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.4),
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        bgcolor: 'background.paper',
                        '&:hover': {
                            boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
                            borderColor: theme.palette.primary.main,
                            transform: 'translateY(-4px)'
                        }
                    }}>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 800,
                                color: 'text.secondary',
                                letterSpacing: '0.1em',
                                mb: 2.5,
                                display: 'block',
                                opacity: 0.8
                            }}
                        >
                            TODAY'S ACTIVITY
                        </Typography>

                        <Stack spacing={2} sx={{ flex: 1 }}>
                            {myToday ? (
                                <>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 1.5,
                                        bgcolor: alpha(theme.palette.success.main, 0.05),
                                        borderRadius: '16px',
                                        border: '1px dashed',
                                        borderColor: alpha(theme.palette.success.main, 0.2)
                                    }}>
                                        <Box sx={{
                                            minWidth: 42,
                                            height: 42,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'background.paper',
                                            borderRadius: '10px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.divider, 0.5),
                                            color: 'success.main'
                                        }}>
                                            <Login fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={800} color="text.primary">Clocked In</Typography>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                                {myToday.login_time} • Main Entrance
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 1.5,
                                        bgcolor: alpha(theme.palette.error.main, 0.05),
                                        borderRadius: '16px',
                                        border: '1px dashed',
                                        borderColor: alpha(theme.palette.error.main, 0.2)
                                    }}>
                                        <Box sx={{
                                            minWidth: 42,
                                            height: 42,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'background.paper',
                                            borderRadius: '10px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.divider, 0.5),
                                            color: 'error.main'
                                        }}>
                                            <Logout fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={800} color="text.primary">Clocked Out</Typography>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                                {myToday.logout_time || 'Active Session'} • Campus Exit
                                            </Typography>
                                        </Box>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, opacity: 0.5 }}>
                                    <CalendarToday sx={{ fontSize: 40, mb: 1, color: 'text.disabled' }} />
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">NO ACTIVITY RECORDED</Typography>
                                </Box>
                            )}
                        </Stack>
                    </Paper>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', letterSpacing: '-0.5px' }}>
                        ATTENDANCE HISTORY
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            type="date"
                            size="small"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                        />
                        <TextField
                            type="date"
                            size="small"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                        />
                    </Stack>
                </Box>
                {isMobile ? (
                    <Stack spacing={2}>
                        {historyData.map((record) => (
                            <Card key={record.id} sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[1] }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                    <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                                        {format(new Date(record.date), 'dd/MM/yy')}
                                    </Typography>
                                    <Chip
                                        label={record.status?.toUpperCase()}
                                        color={record.status === 'Completed' ? 'success' : 'warning'}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 800, fontSize: '0.6rem', height: 20 }}
                                    />
                                </Box>

                                <Divider sx={{ my: 1.5, opacity: 0.6 }} />

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block">LOGIN / LOGOUT</Typography>
                                        <Typography variant="body2" fontWeight={700}>
                                            {formatTo12Hr(record.login_time) || '--:--'} - {formatTo12Hr(record.logout_time) || '--:--'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block">SHIFT</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {formatTo12Hr(record.shift_start_time) || '--:--'} - {formatTo12Hr(record.shift_end_time) || '--:--'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block">WORKED / BREAKS</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {record.total_worked_minutes ? `${Math.floor(record.total_worked_minutes / 60)}h ${record.total_worked_minutes % 60}m` : '--'}
                                            <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                                                ({record.breaks_count || 0} b)
                                            </Typography>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {record.late_login && (
                                                <Chip label="LATE" size="small" color="error" variant="soft" sx={{ fontSize: '0.6rem', fontWeight: 800, height: 18 }} />
                                            )}
                                            {record.overtime_minutes > 0 && (
                                                <Chip label={`+${record.overtime_minutes}m OT`} size="small" color="success" variant="soft" sx={{ fontSize: '0.6rem', fontWeight: 800, height: 18 }} />
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>

                                {record.auto_closed && (
                                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
                                        <Warning sx={{ fontSize: '0.9rem' }} />
                                        <Typography variant="caption" fontWeight={700}>AUTO-CLOSED</Typography>
                                    </Box>
                                )}
                            </Card>
                        ))}
                        {historyData.length === 0 && !historyLoading && (
                            <Box sx={{ py: 5, textAlign: 'center', color: 'text.disabled' }}>
                                <History sx={{ fontSize: 48, opacity: 0.2, mb: 1 }} />
                                <Typography variant="body2">No history records found for this period</Typography>
                            </Box>
                        )}
                    </Stack>
                ) : (
                    <Card sx={{ overflow: 'hidden', borderRadius: 1 }}>
                        <Box sx={{
                            height: 720,
                            width: '100%',
                            '& .MuiDataGrid-root': {
                                border: 'none',
                                '& .MuiDataGrid-main': {
                                    borderRadius: 0
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    fontSize: '0.875rem',
                                    '&:focus': {
                                        outline: 'none'
                                    },
                                    '&:focus-within': {
                                        outline: 'none'
                                    }
                                },
                                '& .MuiDataGrid-columnHeader': {
                                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                                    color: 'text.secondary',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    '&:focus': {
                                        outline: 'none'
                                    },
                                    '&:focus-within': {
                                        outline: 'none'
                                    }
                                },
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: (theme) => theme.palette.action.hover,
                                },
                                '& .MuiDataGrid-columnSeparator': {
                                    display: 'none'
                                },
                                // Custom Scrollbar
                                '& ::-webkit-scrollbar': {
                                    width: 8,
                                    height: 8,
                                },
                                '& ::-webkit-scrollbar-track': {
                                    backgroundColor: 'transparent',
                                },
                                '& ::-webkit-scrollbar-thumb': {
                                    backgroundColor: (theme) => theme.palette.divider,
                                    borderRadius: 4,
                                    '&:hover': {
                                        backgroundColor: (theme) => theme.palette.text.disabled,
                                    },
                                },
                            }
                        }}>
                            <DataGrid
                                rows={historyData}
                                loading={historyLoading}
                                columns={[
                                    {
                                        field: 'date',
                                        headerName: 'DATE',
                                        flex: 1,
                                        minWidth: 120,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => {
                                            if (!params.value) return '--';
                                            const d = new Date(params.value);
                                            const dd = d.getDate().toString().padStart(2, '0');
                                            const mm = (d.getMonth() + 1).toString().padStart(2, '0');
                                            const yy = d.getFullYear().toString().slice(-2);
                                            return (
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight={700} color="text.primary">
                                                        {`${dd}/${mm}/${yy}`}
                                                    </Typography>
                                                </Box>
                                            );
                                        }
                                    },
                                    {
                                        field: 'biometric_id',
                                        headerName: 'BIOMETRIC ID',
                                        flex: 1,
                                        minWidth: 130,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                                    {params.value || '--'}
                                                </Typography>
                                            </Box>
                                        )
                                    },
                                    {
                                        field: 'login_time',
                                        headerName: 'LOGIN',
                                        flex: 1,
                                        minWidth: 110,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
                                                    {formatTo12Hr(params.value) || '--:--'}
                                                </Typography>
                                            </Box>
                                        )
                                    },
                                    {
                                        field: 'logout_time',
                                        headerName: 'LOGOUT',
                                        flex: 1,
                                        minWidth: 110,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                                                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
                                                        {formatTo12Hr(params.value) || '--:--'}
                                                    </Typography>
                                                    {params.row.is_overnight_shift && (
                                                        <Tooltip title="Overnight Shift">
                                                            <NightsStay sx={{ fontSize: '0.8rem', color: 'info.main' }} />
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                            </Box>
                                        )
                                    },
                                    {
                                        field: 'shift_start_time',
                                        headerName: 'SHIFT IN',
                                        flex: 1,
                                        minWidth: 110,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary' }}>
                                                    {formatTo12Hr(params.value) || '--:--'}
                                                </Typography>
                                            </Box>
                                        )
                                    },
                                    {
                                        field: 'shift_end_time',
                                        headerName: 'SHIFT OUT',
                                        flex: 1,
                                        minWidth: 110,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary' }}>
                                                    {formatTo12Hr(params.value) || '--:--'}
                                                </Typography>
                                            </Box>
                                        )
                                    },
                                    {
                                        field: 'total_break_minutes',
                                        headerName: 'BREAKS',
                                        flex: 1.5,
                                        minWidth: 140,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                                    {params.row.breaks_count || 0} breaks({params.row.total_break_minutes || 0}min)
                                                </Typography>
                                            </Box>
                                        )
                                    },
                                    {
                                        field: 'late_login',
                                        headerName: 'LATE',
                                        flex: 1,
                                        minWidth: 120,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => {
                                            if (!params.value) return <Typography sx={{ fontSize: '0.875rem', color: 'success.main', fontWeight: 700 }}>On Time</Typography>;

                                            const totalMinutes = params.row.late_by_minutes || 0;
                                            const hh = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
                                            const mm = (totalMinutes % 60).toString().padStart(2, '0');
                                            const ss = '00';

                                            return (
                                                <Chip
                                                    label={`${hh}:${mm}:${ss}`}
                                                    size="small"
                                                    color="error"
                                                    variant="soft"
                                                    sx={{ fontWeight: 700 }}
                                                />
                                            );
                                        }
                                    },
                                    {
                                        field: 'total_worked_minutes',
                                        headerName: 'WORKED',
                                        flex: 1,
                                        minWidth: 130,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => {
                                            const isLive = params.row.status === 'Active' && (!params.row.total_worked_minutes || params.row.total_worked_minutes === 0);
                                            if (isLive) return (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main', boxShadow: '0 0 4px #2e7d32' }} />
                                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'success.main' }}>On Premise</Typography>
                                                </Box>
                                            );

                                            if (!params.value) return '--';
                                            const h = Math.floor(params.value / 60);
                                            const m = params.value % 60;
                                            return (
                                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                                    {`${h}h ${m}m`}
                                                </Typography>
                                            );
                                        }
                                    },
                                    {
                                        field: 'overtime_minutes',
                                        headerName: 'OVERTIME',
                                        flex: 1,
                                        minWidth: 120,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => (
                                            params.value > 0 ? (
                                                <Chip
                                                    label={`+${params.value}m`}
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 600, borderRadius: 1 }}
                                                />
                                            ) : <Typography sx={{ fontSize: '0.875rem', color: 'text.disabled' }}>-</Typography>
                                        )
                                    },
                                    {
                                        field: 'status',
                                        headerName: 'STATUS',
                                        flex: 1,
                                        minWidth: 140,
                                        align: 'center',
                                        headerAlign: 'center',
                                        renderCell: (params) => (
                                            <Stack alignItems="center" spacing={0.5} sx={{ height: '100%', justifyContent: 'center' }}>
                                                <Chip
                                                    label={params.value === 'Completed' ? 'Completed' : params.value === 'Active' ? 'Active' : params.value}
                                                    color={params.value === 'Completed' ? 'success' : 'warning'}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        minWidth: 90,
                                                        borderRadius: 1
                                                    }}
                                                />
                                                {params.row.auto_closed && (
                                                    <Chip
                                                        icon={<Warning sx={{ fontSize: '0.7rem !important' }} />}
                                                        label="AUTO"
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.6rem', height: 18, borderStyle: 'dashed' }}
                                                    />
                                                )}
                                            </Stack>
                                        )
                                    }
                                ]}
                                pageSizeOptions={[15, 25, 50]}
                                initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
                                disableRowSelectionOnClick
                                density="compact"
                                rowHeight={52}
                                columnHeaderHeight={48}
                            />
                        </Box>
                    </Card>
                )}
            </Box>
        </Box>
    );
};

export default EmployeeBiometricView;
