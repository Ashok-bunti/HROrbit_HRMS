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
    Tabs,
    Tab,
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

const StatCard = ({ title, value, subtitle, color, icon: Icon }) => {
    const theme = useTheme();
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`,
                border: `1px solid ${alpha(color, 0.2)}`,
                backdropFilter: 'blur(10px)',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(color, 0.1), color: color }}>
                    <Icon />
                </Box>
                {subtitle && <Chip label={subtitle} size="small" variant="outlined" sx={{ color: color, borderColor: alpha(color, 0.3) }} />}
            </Box>
            <Typography variant="h4" fontWeight="800" gutterBottom>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Paper>
    );
};

const EmployeeBiometricView = ({ attendanceData, user, isLoading }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [tabValue, setTabValue] = React.useState(0);
    const [dateRange, setDateRange] = React.useState({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });

    const { data: historyResponse, isLoading: historyLoading } = useGetBiometricUserHistoryQuery({
        employeeId: user?.id,
        ...dateRange
    }, { skip: !user?.id || tabValue !== 1 });

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
                action={
                    tabValue === 1 && (
                        <Stack direction="row" spacing={2}>
                            <TextField
                                type="date"
                                size="small"
                                label="From"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                            />
                            <TextField
                                type="date"
                                size="small"
                                label="To"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                            />
                        </Stack>
                    )
                }
            />

            <Paper elevation={0} sx={{ mb: 4, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    sx={{
                        px: 3,
                        '& .MuiTabs-indicator': { height: 4, borderRadius: '4px 4px 0 0' },
                        '& .MuiTab-root': {
                            minHeight: 64,
                            fontWeight: 700,
                            fontSize: '0.85rem',
                        }
                    }}
                >
                    <Tab icon={<Fingerprint sx={{ mr: 1 }} />} iconPosition="start" label="OVERVIEW" />
                    <Tab icon={<History sx={{ mr: 1 }} />} iconPosition="start" label="MY HISTORY" />
                </Tabs>
                <Divider />

                {tabValue === 0 && (
                    <Box sx={{ p: 4 }}>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Today's Status"
                                    value={myToday ? myToday.status : 'Not Clocked'}
                                    color={myToday?.status === 'Active' ? theme.palette.warning.main : theme.palette.success.main}
                                    icon={Fingerprint}
                                    subtitle="Current Session"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Time Logged"
                                    value={myToday ? `${Math.floor((myToday.total_worked_minutes || 0) / 60)}h ${myToday.total_worked_minutes % 60}m` : '0h 0m'}
                                    color={theme.palette.primary.main}
                                    icon={AccessTime}
                                    subtitle="Worked Today"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Breaks Taken"
                                    value={myToday ? `${myToday.breaks_count || 0}` : '0'}
                                    color={theme.palette.info.main}
                                    icon={History}
                                    subtitle={`${myToday?.total_break_minutes || 0} mins total`}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Overtime"
                                    value={myToday?.overtime_minutes ? `${myToday.overtime_minutes}m` : '0m'}
                                    color={theme.palette.secondary.main}
                                    icon={History}
                                    subtitle="Extra Hours"
                                />
                            </Grid>
                        </Grid>

                        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.02), borderStyle: 'dashed' }}>
                            <Typography variant="h6" fontWeight={800} gutterBottom>Today's Activity</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Your biometric sync trail for the last 24 hours.
                            </Typography>

                            <Stack spacing={3}>
                                {myToday ? (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Box sx={{ p: 1, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', borderRadius: 2 }}>
                                                    <Login />
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={700}>Clocked In</Typography>
                                                    <Typography variant="caption" color="text.secondary">Main Entrance Gate</Typography>
                                                </Box>
                                            </Stack>
                                            <Typography variant="h6" fontWeight={700}>{myToday.login_time}</Typography>
                                        </Box>

                                        <Divider />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Box sx={{ p: 1, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', borderRadius: 2 }}>
                                                    <Logout />
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={700}>Clocked Out</Typography>
                                                    <Typography variant="caption" color="text.secondary">Campus Exit</Typography>
                                                </Box>
                                            </Stack>
                                            <Typography variant="h6" fontWeight={700}>{myToday.logout_time || 'Present'}</Typography>
                                        </Box>
                                    </>
                                ) : (
                                    <Box sx={{ py: 4, textAlign: 'center' }}>
                                        <CalendarToday sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            No biometric scans recorded for you today.
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Box>
                )}

                {tabValue === 1 && (
                    <Box sx={{ mt: 3 }}>
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
                                    height: 565,
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
                                                width: 130,
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
                                                width: 130,
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
                                                width: 110,
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
                                                width: 110,
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
                                                width: 110,
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
                                                width: 110,
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
                                                width: 120,
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
                                                width: 120,
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
                                                width: 130,
                                                align: 'center',
                                                headerAlign: 'center',
                                                valueGetter: (value, row) => {
                                                    if (!row.total_worked_minutes) return '--';
                                                    const h = Math.floor(row.total_worked_minutes / 60);
                                                    const m = row.total_worked_minutes % 60;
                                                    return `${h}h ${m}m`;
                                                }
                                            },
                                            {
                                                field: 'overtime_minutes',
                                                headerName: 'OVERTIME',
                                                width: 120,
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
                                                width: 150,
                                                align: 'center',
                                                headerAlign: 'center',
                                                renderCell: (params) => (
                                                    <Stack alignItems="center" spacing={0.5} justifyContent="center" sx={{ height: '100%' }}>
                                                        <Chip
                                                            label={params.value?.toUpperCase()}
                                                            color={params.value === 'Completed' ? 'success' : 'warning'}
                                                            size="small"
                                                            sx={{ fontWeight: 800, fontSize: '0.65rem', minWidth: 90 }}
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
                )}
            </Paper>
        </Box>
    );
};

export default EmployeeBiometricView;
