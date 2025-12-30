import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    IconButton,
    InputBase,
    Divider,
    Stack,
    Chip,
    useTheme,
    alpha,
    TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
    AccessTime,
    Login,
    Logout,
    Fingerprint,
    Dashboard as DashboardIcon,
    ListAlt,
    Devices,
    Search,
    FilterList,
    Add,
    CheckCircle,
    Cancel
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    useGetAllAttendanceQuery,
    useGetAttendanceStatsQuery
} from '../../attendance/store/attendanceApi';
import { useAuth } from '../../../context/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import PageHeader from '../../../components/common/PageHeader';

// --- Mock Data for Dashboard ---
const monthlyData = [
    { name: 'Week 1', onTime: 400, late: 24, absent: 10 },
    { name: 'Week 2', onTime: 300, late: 13, absent: 22 },
    { name: 'Week 3', onTime: 200, late: 58, absent: 5 },
    { name: 'Week 4', onTime: 278, late: 39, absent: 20 },
];

const mockDevices = [
    { id: 1, name: 'Main Entrance Gate 1', ip: '192.168.1.101', status: 'Online', lastSync: '2 mins ago', location: 'Lobby' },
    { id: 2, name: 'Rear Exit Gate 2', ip: '192.168.1.102', status: 'Offline', lastSync: '4 hours ago', location: 'Back Office' },
    { id: 3, name: 'Server Room Access', ip: '192.168.1.105', status: 'Online', lastSync: 'Just now', location: 'IT Dept' },
];

// --- Sub-components ---

const StatCard = ({ title, value, subtitle, color, icon: Icon }) => {
    const theme = useTheme();
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`,
                border: `1px solid ${alpha(color, 0.2)}`,
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 10px 20px ${alpha(color, 0.15)}`
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(color, 0.2), color: color }}>
                    <Icon fontSize="medium" />
                </Box>
                {subtitle && (
                    <Chip label={subtitle} size="small" sx={{ bgcolor: alpha(color, 0.1), color: color, fontWeight: 600 }} />
                )}
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5, color: theme.palette.text.primary }}>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
                {title}
            </Typography>
        </Paper>
    );
};

const DeviceCard = ({ device }) => {
    const theme = useTheme();
    const isOnline = device.status === 'Online';
    const statusColor = isOnline ? theme.palette.success.main : theme.palette.error.main;

    return (
        <Paper
            sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: alpha(statusColor, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: statusColor
                    }}
                >
                    <Fingerprint />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight="600">{device.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{device.ip} • {device.location}</Typography>
                </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
                <Chip
                    label={device.status}
                    size="small"
                    sx={{
                        bgcolor: alpha(statusColor, 0.1),
                        color: statusColor,
                        fontWeight: 600,
                        mb: 0.5
                    }}
                />
                <Typography variant="caption" display="block" color="text.secondary">
                    Sync: {device.lastSync}
                </Typography>
            </Box>
        </Paper>
    );
};

// --- Main Component ---



const Biometric = () => {
    const theme = useTheme();
    const { can } = usePermissions();
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const { data: attendanceData, isLoading, error } = useGetAllAttendanceQuery({});
    const { data: statsData } = useGetAttendanceStatsQuery({});

    // Columns
    const columns = [
        {
            field: 'employee_name',
            headerName: 'EMPLOYEE',
            flex: 1.5,
            minWidth: 200,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                        {params.value || '- -'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'date',
            headerName: 'DATE',
            flex: 1,
            minWidth: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const dateVal = params.row.check_in_time || params.row.date;
                const dateStr = dateVal ? format(new Date(dateVal), 'dd MMM, yyyy') : '- -';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {dateStr}
                    </Box>
                );
            }
        },
        {
            field: 'check_in_time',
            headerName: 'TIME IN',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2">
                            {params.value ? format(new Date(params.value), 'hh:mm a') : '- -'}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: 'check_out_time',
            headerName: 'TIME OUT',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2">
                            {params.value ? format(new Date(params.value), 'hh:mm a') : '- -'}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const statusColors = {
                    Present: 'success',
                    Absent: 'error',
                    Late: 'warning',
                    'On Leave': 'info'
                };
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Chip
                            label={params.value?.toUpperCase() || 'ABSENT'}
                            color={statusColors[params.value] || 'default'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.65rem', minWidth: 90 }}
                        />
                    </Box>
                );
            }
        }
    ];

    if (!can('biometric', 'read')) return <Alert severity="error">Unauthorized Access</Alert>;
    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">Error loading biometric data</Alert>;

    return (
        <Box sx={{ pb: 5 }}>
            <PageHeader
                title="Biometric Dashboard"
                subtitle="Real-time tracking and device management hub."
            />

            {/* Tabs */}
            <Paper
                elevation={0}
                sx={{
                    mb: 4,
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                    bgcolor: 'background.paper',
                    overflow: 'hidden'
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    sx={{
                        px: 3,
                        pt: 1,
                        '& .MuiTabs-indicator': {
                            height: 3,
                            borderRadius: '3px 3px 0 0'
                        },
                        '& .MuiTab-root': {
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            letterSpacing: 1,
                            fontSize: '0.75rem',
                            minHeight: 64,
                            mr: 2,
                            opacity: 0.7,
                            '&.Mui-selected': {
                                opacity: 1,
                                color: 'primary.main',
                            }
                        }
                    }}
                >
                    <Tab icon={<DashboardIcon sx={{ mr: 1 }} />} iconPosition="start" label="Overview" />
                    <Tab icon={<ListAlt sx={{ mr: 1 }} />} iconPosition="start" label="Activity Logs" />
                    <Tab icon={<Devices sx={{ mr: 1 }} />} iconPosition="start" label="Device Hub" />
                </Tabs>
                <Divider />

                {/* --- DASHBOARD TAB --- */}
                {tabValue === 0 && (
                    <Box sx={{ p: 4 }}>
                        {/* Stats Row */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={3}>
                                <StatCard
                                    title="Present Today"
                                    value={statsData?.stats?.present_today || 0}
                                    color={theme.palette.success.main}
                                    icon={CheckCircle}
                                    subtitle="Live Stats"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <StatCard
                                    title="Late Arrivals"
                                    value={statsData?.stats?.late_count || 0}
                                    color={theme.palette.warning.main}
                                    icon={AccessTime}
                                    subtitle="Review Needed"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <StatCard
                                    title="Absent"
                                    value={statsData?.stats?.absent_today || 0}
                                    color={theme.palette.error.main}
                                    icon={Cancel}
                                    subtitle="Today"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <StatCard
                                    title="Avg Work Hours"
                                    value={`${Number(statsData?.stats?.avg_work_hours_today || 0).toFixed(1)}h`}
                                    color={theme.palette.primary.main}
                                    icon={AccessTime}
                                    subtitle="Global Avg"
                                />
                            </Grid>
                        </Grid>

                        {/* Charts Row */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: 450, borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                        <Typography variant="h6" fontWeight="800">Attendance Trends</Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>DAILY ENGAGEMENT METRICS</Typography>
                                    </Box>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <AreaChart data={monthlyData}>
                                            <defs>
                                                <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dx={-10} />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: 12,
                                                    border: 'none',
                                                    boxShadow: theme.shadows[10],
                                                    padding: '12px 16px'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="onTime"
                                                stroke={theme.palette.primary.main}
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorOnTime)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: 450, borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                        <Typography variant="h6" fontWeight="800">Status Split</Typography>
                                    </Box>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Present', value: statsData?.stats?.present_today || 10 },
                                                    { name: 'Absent', value: statsData?.stats?.absent_today || 2 },
                                                    { name: 'Late', value: statsData?.stats?.late_count || 3 },
                                                    { name: 'Leave', value: statsData?.stats?.on_leave_today || 1 }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={75}
                                                outerRadius={100}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                <Cell key="cell-0" fill={theme.palette.success.main} />
                                                <Cell key="cell-1" fill={theme.palette.error.main} />
                                                <Cell key="cell-2" fill={theme.palette.warning.main} />
                                                <Cell key="cell-3" fill={theme.palette.info.main} />
                                            </Pie>
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* --- ACTIVITY LOGS TAB --- */}
                {tabValue === 1 && (
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                            <TextField
                                fullWidth
                                placeholder="Search activity logs..."
                                size="small"
                                InputProps={{
                                    startAdornment: <Search sx={{ mr: 1, color: 'text.disabled' }} />,
                                    sx: { borderRadius: 2 }
                                }}
                                sx={{ maxWidth: 450 }}
                            />
                            <Button startIcon={<FilterList />} variant="outlined" sx={{ borderRadius: 2 }}>
                                Advanced Search
                            </Button>
                        </Box>
                        <Box sx={{
                            height: 600,
                            width: '100%',
                            '& .MuiDataGrid-root': {
                                border: 'none',
                                '& .MuiDataGrid-main': {
                                    borderRadius: 2
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
                                    backgroundColor: theme.palette.action.hover,
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
                                    borderRadius: 2,
                                    '&:hover': {
                                        backgroundColor: (theme) => theme.palette.text.disabled,
                                    },
                                },
                            }
                        }}>
                            <DataGrid
                                rows={attendanceData?.attendance || []}
                                columns={columns}
                                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 15 } } }}
                                pageSizeOptions={[15, 30, 50]}
                                disableRowSelectionOnClick
                                density="compact"
                                rowHeight={52}
                                columnHeaderHeight={48}
                            />
                        </Box>
                    </Box>
                )}

                {/* --- DEVICES TAB --- */}
                {tabValue === 2 && (
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Connected Devices</Typography>
                                <Typography variant="body2" color="text.secondary">Manage your biometric scanners</Typography>
                            </Box>
                            {can('biometric', 'create') && (
                                <Button startIcon={<Add />} variant="contained" sx={{ borderRadius: 50 }}>
                                    Add Device
                                </Button>
                            )}
                        </Box>
                        <Grid container spacing={3}>
                            {mockDevices.map(device => (
                                <Grid item xs={12} md={6} key={device.id}>
                                    <DeviceCard device={device} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default Biometric;
