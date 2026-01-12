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

    TextField,
    InputAdornment,
    Autocomplete,
    Card,
    Avatar,
    Tooltip,
    Pagination,
    useMediaQuery,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
    AccessTime,
    Login,
    Logout,
    Fingerprint,
    Dashboard as DashboardIcon,
    ListAlt,
    History,
    Search,
    FilterList,
    Add,
    CheckCircle,
    Cancel,
    NightsStay,
    Warning,
    Timer,
    Info,
    Person,
    TrendingUp,
    DonutLarge
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    useGetTodayBiometricAttendanceQuery,
    useGetAllBiometricAttendanceQuery,
    useGetBiometricSystemStatusQuery,
    useRunBiometricCleanupMutation
} from '../store/biometricApi';
import { useAuth } from '../../../context/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { useGetEmployeesQuery } from '../../employees/store/employeeApi';
import PageHeader from '../../../components/common/PageHeader';
import useSnackbar from '../../../hooks/useSnackbar';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import EmployeeBiometricView from '../components/EmployeeBiometricView';

// --- Global Styles for Animations & Gradients ---
const glassStyle = (color) => ({
    background: (theme) => `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
    backdropFilter: 'blur(8px)',
    border: (theme) => `1px solid ${alpha(color, 0.1)}`,
    borderRadius: 4,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: (theme) => `0 12px 24px -10px ${alpha(color, 0.2)}`,
        borderColor: alpha(color, 0.3)
    }
});

// --- Mock Data for Dashboard ---
const monthlyData = [
    { name: 'Week 1', onTime: 400, late: 24, absent: 10 },
    { name: 'Week 2', onTime: 300, late: 13, absent: 22 },
    { name: 'Week 3', onTime: 200, late: 58, absent: 5 },
    { name: 'Week 4', onTime: 278, late: 39, absent: 20 },
];

// --- Sub-components ---

const AttendanceCard = ({ row, formatTo12Hr }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                minHeight: 260,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.4),
                bgcolor: 'background.paper',
                position: 'relative',
                overflow: 'hidden',

            }}
        >
            {/* Header: Hierarchical Employee Info & Work Time */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2.5 }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography
                            variant="subtitle1"
                            fontWeight={800}
                            sx={{
                                color: 'text.primary',
                                lineHeight: 1.1,
                                fontSize: '1rem',
                                letterSpacing: '-0.2px'
                            }}
                        >
                            {row.name}
                        </Typography>
                        {row.late_login && (
                            <>
                                <Divider orientation="vertical" flexItem sx={{ height: 14, my: 'auto', borderColor: alpha(theme.palette.divider, 0.6) }} />
                                <Typography
                                    variant="caption"
                                    fontWeight={900}
                                    sx={{
                                        color: 'error.main',
                                        fontSize: '0.65rem',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    LATE
                                </Typography>
                            </>
                        )}
                    </Stack>
                    <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                            color: 'primary.main',
                            fontSize: '0.75rem',
                            mb: 0.2,
                            opacity: 0.9
                        }}
                    >
                        ID: {row.employee_code}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            display: 'block',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px'
                        }}
                    >
                        {row.department || '--'}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', pl: 2, minWidth: 'fit-content' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', mb: 0.5, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Work Time</Typography>
                    <Typography variant="h6" fontWeight={900} sx={{ color: 'primary.main', fontSize: '1.1rem', lineHeight: 1 }}>
                        {Math.floor(row.total_worked_minutes / 60)}h {row.total_worked_minutes % 60}m
                    </Typography>
                </Box>
            </Box>

            {/* Time Logs Table Formate */}
            <Box sx={{
                mb: 2.5,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.5),
                overflow: 'hidden',
                bgcolor: alpha(theme.palette.primary.main, 0.01)
            }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    bgcolor: alpha(theme.palette.divider, 0.05),
                    borderBottom: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.5),
                    p: 1.2
                }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase' }}>Type</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase', textAlign: 'center' }}>Actual</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase', textAlign: 'right' }}>Shift</Typography>
                </Box>

                {/* Login Row */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    p: 1.2,
                    borderBottom: '1px dashed',
                    borderColor: alpha(theme.palette.divider, 0.4),
                    alignItems: 'center'
                }}>
                    <Typography variant="caption" fontWeight={800} sx={{ color: 'text.primary', fontSize: '0.7rem' }}>LOGIN</Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: 'success.main', textAlign: 'center', fontSize: '0.85rem' }}>
                        {formatTo12Hr(row.login_time)}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textAlign: 'right', fontSize: '0.75rem' }}>
                        {formatTo12Hr(row.shift_start_time) || '--:--'}
                    </Typography>
                </Box>

                {/* Logout Row */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    p: 1.2,
                    alignItems: 'center'
                }}>
                    <Typography variant="caption" fontWeight={800} sx={{ color: 'text.primary', fontSize: '0.7rem' }}>LOGOUT</Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: row.logout_time ? 'error.main' : 'text.disabled', textAlign: 'center', fontSize: '0.85rem' }}>
                        {formatTo12Hr(row.logout_time) || '--:--'}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textAlign: 'right', fontSize: '0.75rem' }}>
                        {formatTo12Hr(row.shift_end_time) || '--:--'}
                    </Typography>
                </Box>
            </Box>

            {/* Footer Metrics */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Stack direction="row" spacing={0.8}>

                    {row.overtime_minutes > 0 && (
                        <Chip
                            label={`OT +${row.overtime_minutes}m`}
                            size="small"
                            variant="outlined"
                            sx={{
                                height: 20,
                                fontSize: '0.55rem',
                                fontWeight: 800,
                                color: 'success.main',
                                borderColor: 'success.main',
                                borderRadius: '4px',
                                px: 0.5
                            }}
                        />
                    )}
                </Stack>
            </Box>
        </Paper>
    );
};

const StatCard = ({ title, value, subtitle, color, icon: Icon, trend = "+0.0%" }) => {
    const theme = useTheme();
    const isPositive = trend.startsWith('+');

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                height: '100%',
                borderRadius: '20px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.5),
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    borderColor: alpha(color, 0.5),
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    transform: 'scale(1.01)'
                }
            }}
        >
            <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '16px',
                bgcolor: color,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 4px 12px ${alpha(color, 0.3)}`
            }}>
                <Icon sx={{ fontSize: '1.5rem' }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 700,
                        display: 'block',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 0.2
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="h5"
                    fontWeight="900"
                    sx={{
                        color: 'text.primary',
                        fontSize: '1.4rem',
                        lineHeight: 1.1
                    }}
                >
                    {value}
                </Typography>
            </Box>

            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{
                        color: isPositive ? 'success.main' : 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        fontSize: '0.8rem',
                        mb: 0.5
                    }}
                >
                    {trend}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.disabled',
                        fontWeight: 700,
                        fontSize: '0.6rem',
                        textTransform: 'uppercase'
                    }}
                >
                    {subtitle}
                </Typography>
            </Box>
        </Paper>
    );
};

const BiometricDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
    const { can, isHR, isAdmin } = usePermissions();
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: format(new Date(), 'yyyy-MM-01'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 12; // 4 cards per row * 3 rows

    // API Hooks
    const { data: employeesResponse } = useGetEmployeesQuery({ limit: 1000 });
    const { data: attendanceResponse, isLoading, error, refetch } = useGetTodayBiometricAttendanceQuery();
    const { data: historyResponse, isLoading: historyLoading } = useGetAllBiometricAttendanceQuery({
        ...dateRange,
        employeeId: selectedEmployee?.id || 'all'
    }, { skip: tabValue !== 1 });
    const { data: systemStatusResponse } = useGetBiometricSystemStatusQuery();
    const [runCleanup, { isLoading: isCleaning }] = useRunBiometricCleanupMutation();

    React.useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedEmployee, dateRange]);

    const employees = employeesResponse?.employees || [];
    const attendanceData = attendanceResponse?.data || [];
    const historyData = historyResponse?.data || [];
    const systemStatus = systemStatusResponse?.data || {};

    // Derived Stats with Dynamic Trends
    const lastWeekData = monthlyData[monthlyData.length - 1];
    const avgDailyPresent = (lastWeekData.onTime + lastWeekData.late) / 6;
    const avgDailyOnTimeRate = Math.round((lastWeekData.onTime / (lastWeekData.onTime + lastWeekData.late)) * 100);

    const calculateTrend = (current, target) => {
        if (!target) return "+0.0%";
        const diff = ((current - target) / target) * 100;
        return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };

    const stats = {
        present: attendanceData.length,
        presentTrend: calculateTrend(attendanceData.length, avgDailyPresent),
        active: attendanceData.filter(a => a.status === 'Active').length,
        activeTrend: calculateTrend(attendanceData.filter(a => a.status === 'Active').length, avgDailyPresent * 0.4),
        completed: attendanceData.filter(a => a.status === 'Completed').length,
        overtime: attendanceData.filter(a => a.overtime_minutes > 0).length,
        overtimeTrend: calculateTrend(attendanceData.filter(a => a.overtime_minutes > 0).length, 5), // Target 5 per day
        late: attendanceData.filter(a => a.late_login).length,
        onTime: attendanceData.filter(a => a.late_login === false).length,
        onTimeRate: attendanceData.length > 0
            ? Math.round((attendanceData.filter(a => a.late_login === false).length / attendanceData.length) * 100)
            : 0,
        onTimeTrend: calculateTrend(
            attendanceData.length > 0 ? (attendanceData.filter(a => a.late_login === false).length / attendanceData.length) * 100 : 0,
            avgDailyOnTimeRate
        ),
        avgWorked: attendanceData.length > 0
            ? (attendanceData.reduce((acc, curr) => acc + (curr.total_worked_minutes || 0), 0) / attendanceData.length / 60).toFixed(1)
            : 0
    };

    const handleCleanup = async () => {
        try {
            const result = await runCleanup().unwrap();
            showSnackbar(result.message || 'System cleanup successful', 'success');
            refetch();
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to trigger cleanup', 'error');
        }
    };

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

    const filteredLogs = attendanceData.filter(row =>
        (row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.employee_code && row.employee_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const filteredHistory = historyData.filter(row =>
        (row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.employee_code && row.employee_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Columns
    const columns = [
        {
            field: 'date',
            headerName: 'DATE',
            width: 110,
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
                    <Typography variant="body2" fontWeight={600}>
                        {params.value || '--'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'name',
            headerName: 'EMPLOYEE',
            flex: 1.5,
            minWidth: 220,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', pl: 0.5 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'primary.main' }}>
                        {params.value}
                    </Typography>
                    <Typography
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            ml: 0.5
                        }}
                    >
                        / {params.row.employee_code}
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
                                <NightsStay sx={{ fontSize: '1rem', color: theme.palette.info.main }} />
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
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
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
            width: 110,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {params.row.breaks_count || 0} breaks({params.value || 0}min)
                    </Typography>
                </Box>
            )
        },
        {
            field: 'late_login',
            headerName: 'LATE',
            width: 100,
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
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: 1 }}
                    />
                );
            }
        },
        {
            field: 'total_worked_minutes',
            headerName: 'WORKED',
            width: 110,
            align: 'center',
            headerAlign: 'center',
            valueGetter: (value, row) => {
                if (!row || !row.total_worked_minutes) return '--';
                const h = Math.floor(row.total_worked_minutes / 60);
                const m = row.total_worked_minutes % 60;
                return `${h}h ${m}m`;
            }
        },
        {
            field: 'overtime_minutes',
            headerName: 'OVERTIME',
            width: 110,
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
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const label = params.value === 'Completed' ? 'Completed' :
                    params.value === 'Active' ? 'Active' :
                        params.value === 'In-Progress' ? 'Active' : params.value;

                return (
                    <Stack alignItems="center" spacing={0.5} sx={{ height: '100%', justifyContent: 'center' }}>
                        <Chip
                            label={label}
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
                                icon={<Warning sx={{ fontSize: '0.75rem !important' }} />}
                                label="AUTO-CLOSED"
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{
                                    fontSize: '0.6rem',
                                    height: 20,
                                    borderStyle: 'dashed',
                                    fontWeight: 600,
                                    mt: 0.5
                                }}
                            />
                        )}
                    </Stack>
                );
            }
        }
    ];

    if (!can('biometric', 'read')) return <Box sx={{ p: 4 }}><Alert severity="error">Unauthorized: You do not have permissions to view Biometric data.</Alert></Box>;
    if (isLoading) return <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
        <CircularProgress size={40} />
        <Typography color="text.secondary" fontWeight={500}>Syncing with devices...</Typography>
    </Box>;
    if (error) return <Box sx={{ p: 4 }}><Alert severity="error">System Error: Failed to fetch biometric stream. {error.message}</Alert></Box>;

    // Role-based UI logic
    const isManager = isHR || isAdmin || can('biometric', 'manage');

    if (!isManager) {
        return <EmployeeBiometricView
            attendanceData={attendanceData}
            user={user}
            isLoading={isLoading}
        />;
    }

    return (
        <Box sx={{ pb: 5 }}>
            <PageHeader
                title="Biometric Intelligence"
                subtitle="High-precision attendance tracking & device health monitoring."
                action={
                    <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }} alignItems="center">
                        {(tabValue === 0 || tabValue === 1) && (
                            <TextField
                                placeholder="Search employees..."
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    sx: { bgcolor: 'background.paper', borderRadius: 2 }
                                }}
                                sx={{ width: { xs: '100%', sm: 260 } }}
                            />
                        )}

                        {tabValue === 1 && (
                            <Stack direction="row" spacing={1.5}>
                                <Autocomplete
                                    size="small"
                                    options={employees}
                                    getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
                                    value={selectedEmployee}
                                    onChange={(event, newValue) => setSelectedEmployee(newValue)}
                                    renderInput={(params) => (
                                        <TextField {...params} placeholder="All Employees" sx={{ width: 200 }} />
                                    )}
                                    sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                                />
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
                        )}

                        {/* Premium Tab Switcher */}
                        <Box sx={{
                            display: 'flex',
                            bgcolor: 'background.paper',
                            p: 0.5,
                            borderRadius: '12px',
                            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                            <Button
                                size="small"
                                variant={tabValue === 0 ? "contained" : "text"}
                                onClick={() => setTabValue(0)}
                                startIcon={<DashboardIcon sx={{ fontSize: '1.1rem !important' }} />}
                                sx={{
                                    borderRadius: '10px',
                                    px: 2.5,
                                    py: 1,
                                    fontSize: '0.75rem',
                                    fontWeight: 900,
                                    letterSpacing: '0.5px',
                                    boxShadow: tabValue === 0 ? theme.shadows[4] : 'none',
                                    bgcolor: tabValue === 0 ? 'primary.main' : 'transparent',
                                    color: tabValue === 0 ? 'white' : 'text.secondary',
                                    '&:hover': {
                                        bgcolor: tabValue === 0 ? 'primary.dark' : alpha(theme.palette.primary.main, 0.05)
                                    }
                                }}
                            >
                                LIVE DASHBOARD
                            </Button>
                            <Button
                                size="small"
                                variant={tabValue === 1 ? "contained" : "text"}
                                onClick={() => setTabValue(1)}
                                startIcon={<History sx={{ fontSize: '1.1rem !important' }} />}
                                sx={{
                                    borderRadius: '10px',
                                    px: 2.5,
                                    py: 1,
                                    fontSize: '0.75rem',
                                    fontWeight: 900,
                                    letterSpacing: '0.5px',
                                    boxShadow: tabValue === 1 ? theme.shadows[4] : 'none',
                                    bgcolor: tabValue === 1 ? 'primary.main' : 'transparent',
                                    color: tabValue === 1 ? 'white' : 'text.secondary',
                                    '&:hover': {
                                        bgcolor: tabValue === 1 ? 'primary.dark' : alpha(theme.palette.primary.main, 0.05)
                                    }
                                }}
                            >
                                HISTORY
                            </Button>
                        </Box>
                    </Stack>
                }
            />



            {/* --- LIVE DASHBOARD TAB (Analytics + Live Stream) --- */}
            {tabValue === 0 && (
                <Box sx={{ width: '100%' }}>
                    {/* Integrated Analytics Container */}
                    <Box sx={{
                        mb: 6
                    }}>
                        <Box sx={{
                            display: 'flex',
                            gap: 3,
                            width: '100%',
                            flexDirection: { xs: 'column', md: 'row' }
                        }}>
                            {/* COLUMN 1: Vertical Stats Stack */}
                            <Box sx={{ flex: 1.2, minWidth: 0 }}>
                                <Stack spacing={2} sx={{ height: '100%', minHeight: 480 }}>
                                    <StatCard
                                        title="Punched Today"
                                        value={stats.present}
                                        color={theme.palette.primary.main}
                                        icon={Fingerprint}
                                        subtitle="Total In-Flow"
                                        trend={stats.presentTrend}
                                    />
                                    <StatCard
                                        title="Live Sessions"
                                        value={stats.active}
                                        color={theme.palette.primary.main}
                                        icon={AccessTime}
                                        subtitle="On-Premise"
                                        trend={stats.activeTrend}
                                    />
                                    <StatCard
                                        title="Punctuality"
                                        value={`${stats.onTimeRate}%`}
                                        color={theme.palette.primary.main}
                                        icon={Timer}
                                        subtitle="On-Time Today"
                                        trend={stats.onTimeTrend}
                                    />
                                    <StatCard
                                        title="Overtime"
                                        value={stats.overtime}
                                        color={theme.palette.primary.main}
                                        icon={CheckCircle}
                                        subtitle="Sessions with OT"
                                        trend={stats.overtimeTrend}
                                    />
                                </Stack>
                            </Box>

                            {/* COLUMN 2: Weekly Flow Analysis */}
                            <Box sx={{ flex: 2, minWidth: 0 }}>
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    borderRadius: '24px',
                                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    height: '100%',
                                    minHeight: 480,
                                    bgcolor: 'background.paper',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="text.secondary">WEEKLY FLOW ANALYSIS</Typography>
                                        <TrendingUp fontSize="small" color="primary" />
                                    </Box>

                                    {/* Insight Row */}
                                    <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, display: 'block', textTransform: 'uppercase', fontSize: '0.6rem' }}>Peak Activity</Typography>
                                            <Typography variant="body2" fontWeight={800}>09:30 AM</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, display: 'block', textTransform: 'uppercase', fontSize: '0.6rem' }}>Avg. Daily Flow</Typography>
                                            <Typography variant="body2" fontWeight={800}>{Math.round(stats.present / 7)} / hr</Typography>
                                        </Box>
                                    </Stack>

                                    <Box sx={{ flex: 1, position: 'relative' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.4)} />
                                                <XAxis dataKey="name" hide />
                                                <YAxis hide />
                                                <ChartTooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                                                    cursor={{ stroke: theme.palette.primary.main, strokeWidth: 2 }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="onTime"
                                                    stroke={theme.palette.primary.main}
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorFlow)"
                                                    animationDuration={1500}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Box>

                                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
                                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Info sx={{ fontSize: '0.9rem' }} /> Hint: Flow peaks during morning shift change.
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Box>

                            {/* COLUMN 3: Session Status */}
                            <Box sx={{ flex: 1.5, minWidth: 0 }}>
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    borderRadius: '24px',
                                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    height: '100%',
                                    minHeight: 480,
                                    bgcolor: 'background.paper',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="text.secondary">SESSION STATUS</Typography>
                                        <DonutLarge fontSize="small" color="primary" />
                                    </Box>
                                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                        {/* Donut Center Label */}
                                        <Box sx={{ position: 'absolute', textAlign: 'center', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', mt: -2 }}>
                                            <Typography variant="h2" fontWeight={1000} color="text.primary" sx={{ letterSpacing: '-2px', lineHeight: 1 }}>
                                                {stats.onTime + stats.late}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '2px', display: 'block', mt: -0.5 }}>
                                                Total
                                            </Typography>
                                        </Box>

                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'On-Time', value: stats.onTime },
                                                        { name: 'Late', value: stats.late },
                                                    ]}
                                                    innerRadius="65%"
                                                    outerRadius="85%"
                                                    paddingAngle={10}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    <Cell fill={theme.palette.primary.light} />
                                                    <Cell fill={theme.palette.primary.main} />
                                                </Pie>
                                                <ChartTooltip contentStyle={{ borderRadius: '12px' }} />
                                                <Legend
                                                    iconType="circle"
                                                    verticalAlign="bottom"
                                                    align="center"
                                                    wrapperStyle={{ paddingTop: '20px' }}
                                                    formatter={(value) => (
                                                        <span style={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                                                            {value}
                                                        </span>
                                                    )}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>

                                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${theme.palette.divider}`, textAlign: 'center' }}>
                                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800 }}>
                                            {stats.onTimeRate}% Efficiency Rate — {stats.onTimeRate > 90 ? 'Excellent performance!' : 'Room for improvement.'}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mt: -2, mb: 4 }}>
                        <Typography
                            variant="h4"
                            fontWeight={800}
                            color="text.primary"
                            sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}
                        >
                            Live Attendance Stream
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mt: 0.5, fontSize: { xs: '0.875rem', md: '1rem' } }}
                        >
                            Real-time biometric data influx from all linked devices.
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(4, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        },
                        gap: 3
                    }}>
                        {paginatedLogs.map((row) => (
                            <AttendanceCard
                                key={row.id || row._id || row.employee_code}
                                row={row}
                                formatTo12Hr={formatTo12Hr}
                            />
                        ))}
                    </Box>

                    {filteredLogs.length === 0 && (
                        <Paper sx={{
                            mt: 3,
                            p: 8,
                            textAlign: 'center',
                            borderRadius: '24px',
                            border: '1px dashed',
                            borderColor: 'divider',
                            bgcolor: alpha(theme.palette.background.paper, 0.5)
                        }}>
                            <Fingerprint sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6" fontWeight={700} color="text.secondary">No Live Sessions</Typography>
                            <Typography variant="body2" color="text.disabled">No biometric attendance logs match your current search criteria.</Typography>
                        </Paper>
                    )}

                    {filteredLogs.length > PAGE_SIZE && (
                        <Box sx={{ mt: 5, pb: 2, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                count={Math.ceil(filteredLogs.length / PAGE_SIZE)}
                                page={page}
                                onChange={(e, v) => {
                                    setPage(v);
                                    window.scrollTo({ top: 500, behavior: 'smooth' });
                                }}
                                color="primary"
                                size="large"
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        fontWeight: 800,
                                        borderRadius: '12px',
                                        height: '45px',
                                        minWidth: '45px',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&.Mui-selected': {
                                            boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                                        }
                                    }
                                }}
                            />
                        </Box>
                    )}
                </Box>
            )}

            {/* --- HISTORY TAB --- */}
            {tabValue === 1 && (
                isMobile ? (
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        {historyData.map((record) => (
                            <Card key={record.id} sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[1] }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                                            {record.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            ID: {record.employee_code}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" fontWeight={700} sx={{ display: 'block' }}>
                                            {format(new Date(record.date), 'dd/MM/yy')}
                                        </Typography>
                                        <Chip
                                            label={record.status?.toUpperCase()}
                                            color={record.status === 'Completed' ? 'success' : 'warning'}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontWeight: 800, fontSize: '0.6rem', height: 20, mt: 0.5 }}
                                        />
                                    </Box>
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
                        {historyData.length === 0 && (
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
                                columns={columns}
                                loading={historyLoading}
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 15 } }
                                }}
                                pageSizeOptions={[15, 25, 50]}
                                disableRowSelectionOnClick
                                density="compact"
                                rowHeight={52}
                                columnHeaderHeight={48}
                            />
                        </Box>
                    </Card>
                )
            )}

            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={hideSnackbar}
            />
        </Box >
    );
};

export default BiometricDashboard;
