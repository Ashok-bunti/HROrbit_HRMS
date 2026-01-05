import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    Paper,
    Alert,
    CircularProgress,
    useMediaQuery,
    Stack,
    alpha,
    InputAdornment,
    TextField
} from '@mui/material';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import { DataGrid } from '@mui/x-data-grid';
import { AccessTime, Login, Logout, Search } from '@mui/icons-material';
import { format } from 'date-fns';
import {
    useGetAllAttendanceQuery,
    useClockInMutation,
    useClockOutMutation,
    useGetAttendanceStatsQuery
} from '../store/attendanceApi';
import { useAuth } from '../../../context/AuthContext';

import { usePermissions } from '../../../hooks/usePermissions';
import { useTheme } from '@mui/material/styles';

const Attendance = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { can, isAdmin: isUserAdmin, isHR } = usePermissions();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const { data: attendanceData, isLoading, error } = useGetAllAttendanceQuery({});
    const { data: statsData } = useGetAttendanceStatsQuery({});

    const [clockIn, { isLoading: isClockingIn }] = useClockInMutation();
    const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();


    const filteredAttendance = (attendanceData?.attendance || []).filter(att =>
        (att.employee_name && att.employee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (att.status && att.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
    const [todayAttendance, setTodayAttendance] = useState(null);

    // Check if clocked in today
    useEffect(() => {
        if (!attendanceData?.attendance) return;

        const today = new Date();

        const record = attendanceData.attendance.find(att => {
            if (!att.check_in_time) return false;

            const checkIn = new Date(att.check_in_time);

            return (
                checkIn.getFullYear() === today.getFullYear() &&
                checkIn.getMonth() === today.getMonth() &&
                checkIn.getDate() === today.getDate()
            );
        });

        setTodayAttendance(record || null);
    }, [attendanceData]);

    const isClockedIn = Boolean(todayAttendance?.check_in_time);
    const isClockedOut = Boolean(todayAttendance?.check_out_time);

    const handleClockIn = async () => {
        // 🚫 Same-day re-login prevention
        if (todayAttendance?.check_in_time && todayAttendance?.check_out_time) {
            showSnackbar(
                "You have completed today's attendance. Please try again tomorrow.",
                'warning'
            );
            return;
        }

        try {
            const res = await clockIn().unwrap();
            setTodayAttendance(res.attendance);
            showSnackbar('Clocked in successfully!', 'success');
        } catch (err) {
            if (err?.data?.attendance) {
                setTodayAttendance(err.data.attendance);
            }
            showSnackbar(err.data?.error || 'Failed to clock in', 'error');
        }
    };

    const handleClockOut = async () => {
        try {
            const res = await clockOut().unwrap();

            // 🔥 IMMEDIATE UI UPDATE
            setTodayAttendance(res.attendance);

            showSnackbar('Clocked out successfully!', 'success');
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to clock out', 'error');
        }
    };
    const isAdmin = isUserAdmin || isHR;

    // ...

    const columns = [
        {
            field: 'employee_name',
            headerName: 'EMPLOYEE',
            flex: 1.5,
            minWidth: 200,
            align: 'left',
            headerAlign: 'left',
            hide: !isAdmin,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                        {params.value || '- -'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'check_in_time',
            headerName: 'DATE',
            flex: 1,
            minWidth: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const dateStr = params.value ? format(new Date(params.value), 'dd MMM, yyyy') : '- -';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {dateStr}
                    </Box>
                );
            }
        },
        {
            field: 'check_in_time_formatted',
            headerName: 'CHECK IN',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const timeStr = params.row.check_in_time ? format(new Date(params.row.check_in_time), 'hh:mm a') : '- -';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {timeStr}
                    </Box>
                );
            }
        },
        {
            field: 'check_out_time',
            headerName: 'CHECK OUT',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const timeStr = params.value ? format(new Date(params.value), 'hh:mm a') : '- -';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {timeStr}
                    </Box>
                );
            }
        },
        {
            field: 'work_hours',
            headerName: 'WORK HOURS',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {params.value ? `${params.value} hrs` : '- -'}
                </Box>
            )
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                let color = 'default';
                if (params.value === 'Present') color = 'success';
                if (params.value === 'Absent') color = 'error';
                if (params.value === 'Late') color = 'warning';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Chip
                            label={params.value || '- -'}
                            color={color}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, minWidth: 90 }}
                        />
                    </Box>
                );
            }
        }
    ];

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">Error loading attendance data</Alert>;

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Attendance"
                subtitle="Track and manage daily attendance records."
                action={
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
                        <TextField
                            placeholder="Search attendance..."
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
                            sx={{ width: { xs: '100%', sm: 300 } }}
                        />
                        {can('attendance', 'create') && !isAdmin && (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {(!isClockedIn || (isClockedIn && isClockedOut)) && (
                                    <Button
                                        variant="contained"
                                        startIcon={<Login />}
                                        onClick={handleClockIn}
                                        disabled={isClockingIn}
                                        sx={{ borderRadius: 2, px: 3, whiteSpace: 'nowrap' }}
                                    >
                                        Clock In
                                    </Button>
                                )}

                                {isClockedIn && !isClockedOut && (
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        startIcon={<Logout />}
                                        onClick={handleClockOut}
                                        disabled={isClockingOut}
                                        sx={{ borderRadius: 2, px: 3, whiteSpace: 'nowrap' }}
                                    >
                                        Clock Out
                                    </Button>
                                )}
                            </Box>
                        )}
                    </Box>
                }
            />



            {isAdmin && statsData && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2.5, borderRadius: 2, textAlign: 'center', bgcolor: 'success.lighter', boxShadow: 'none' }}>
                            <Typography variant="h4" fontWeight={800} color="success.dark">
                                {statsData.stats.present_today || 0}
                            </Typography>
                            <Typography variant="caption" fontWeight={700} color="success.dark" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                Present Today
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2.5, borderRadius: 2, textAlign: 'center', bgcolor: 'error.lighter', boxShadow: 'none' }}>
                            <Typography variant="h4" fontWeight={800} color="error.dark">
                                {statsData.stats.absent_today || 0}
                            </Typography>
                            <Typography variant="caption" fontWeight={700} color="error.dark" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                Absent Today
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2.5, borderRadius: 2, textAlign: 'center', bgcolor: 'warning.lighter', boxShadow: 'none' }}>
                            <Typography variant="h4" fontWeight={800} color="warning.dark">
                                {statsData.stats.on_leave_today || 0}
                            </Typography>
                            <Typography variant="caption" fontWeight={700} color="warning.dark" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                On Leave
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2.5, borderRadius: 2, textAlign: 'center', bgcolor: 'primary.lighter', boxShadow: 'none' }}>
                            <Typography variant="h4" fontWeight={800} color="primary.dark">
                                {Number(statsData.stats.avg_work_hours_today || 0).toFixed(1)}h
                            </Typography>
                            <Typography variant="caption" fontWeight={700} color="primary.dark" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                Avg Work Hours
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {isMobile ? (
                // MOBILE: Card List
                <Stack spacing={2}>
                    {filteredAttendance.map((att) => {
                        let statusColor = 'default';
                        if (att.status === 'Present') statusColor = 'success';
                        else if (att.status === 'Absent') statusColor = 'error';
                        else if (att.status === 'Late') statusColor = 'warning';

                        const dateStr = att.check_in_time ? format(new Date(att.check_in_time), 'dd MMM, yyyy') : '- -';
                        const checkInStr = att.check_in_time ? format(new Date(att.check_in_time), 'hh:mm a') : '- -';
                        const checkOutStr = att.check_out_time ? format(new Date(att.check_out_time), 'hh:mm a') : '- -';

                        return (
                            <Card key={att.id} sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[1] }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Box>
                                        {(isAdmin || att.employee_name) && (
                                            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                                {att.employee_name || 'My Attendance'}
                                            </Typography>
                                        )}
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                            {dateStr}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={att.status || '- -'}
                                        color={statusColor}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 600, height: 24 }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'action.hover', p: 1.5, borderRadius: 1 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Check In</Typography>
                                        <Typography variant="body2" fontWeight={600} color="success.main">{checkInStr}</Typography>
                                    </Box>
                                    <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 2 }}></Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Check Out</Typography>
                                        <Typography variant="body2" fontWeight={600} color={att.check_out_time ? 'error.main' : 'text.disabled'}>{checkOutStr}</Typography>
                                    </Box>
                                    <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 2 }}></Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Hours</Typography>
                                        <Typography variant="body2" fontWeight={700}>{att.work_hours ? `${att.work_hours}h` : '-'}</Typography>
                                    </Box>
                                </Box>
                            </Card>
                        );
                    })}
                    {filteredAttendance.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            <Typography>No attendance records found.</Typography>
                        </Box>
                    )}
                </Stack>
            ) : (
                // DESKTOP: DataGrid
                <Card sx={{ overflow: 'hidden', boxShadow: (theme) => theme.shadows[2], borderRadius: 2 }}>
                    <Box sx={{
                        height: 650,
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
                            rows={filteredAttendance}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 10 },
                                },
                            }}
                            pageSizeOptions={[10, 25, 50]}
                            disableRowSelectionOnClick
                            density="compact"
                            rowHeight={52}
                            columnHeaderHeight={48}
                        />
                    </Box>
                </Card>
            )}

            <CustomSnackbar
                open={snackbar.open}
                onClose={hideSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Box>
    );
};

export default Attendance;