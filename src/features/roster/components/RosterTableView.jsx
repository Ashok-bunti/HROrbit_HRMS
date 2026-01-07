import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Button,
    alpha,
    useTheme,
    CircularProgress,
    Tooltip,
    TablePagination,
    Autocomplete,
    TextField,
    Divider,
    useMediaQuery,
    Stack,
    Card,
    CardContent,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    Slide
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Add as AddIcon,
    CloudUpload as CloudUploadIcon,
    WbSunny as MorningIcon,
    WbTwilight as EveningIcon,
    NightsStay as NightIcon,
    Block as OffIcon,
    MoreVert as MoreVertIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import {
    format,
    addDays,
    startOfWeek,
    eachDayOfInterval,
    isToday,
    parseISO
} from 'date-fns';
import rosterService from '../store/Rosterapi';
import EditScheduleModal from './EditScheduleModal';

const RosterTableView = ({ employee, allEmployees, canManage, searchTerm, onEmployeeChange, onSearchChange, onAddRoster, onUpload, onRepeat }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Calculate dates for the current week (Mon to Sun)
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const isDarkMode = theme.palette.mode === 'dark';

    const shiftColors = useMemo(() => ({
        morning: {
            bg: alpha(theme.palette.primary.main, 0.08),
            border: alpha(theme.palette.primary.main, 0.3),
            text: theme.palette.primary.main,
            icon: MorningIcon
        },
        afternoon: {
            bg: alpha(theme.palette.primary.main, 0.18),
            border: alpha(theme.palette.primary.main, 0.5),
            text: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
            icon: EveningIcon
        },
        night: {
            bg: alpha(theme.palette.primary.main, 0.28), // Darker tint for night
            border: theme.palette.primary.main,
            text: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
            icon: NightIcon
        },
        off: {
            bg: alpha(theme.palette.text.disabled, 0.06),
            border: alpha(theme.palette.text.disabled, 0.2),
            text: theme.palette.text.secondary,
            icon: OffIcon
        }
    }), [theme]);

    const getShiftType = (startTime) => {
        if (!startTime) return 'off';
        const [time, modifier] = startTime.split(/(?=[AP]M)/);
        let [hours] = time.split(':');
        let h = parseInt(hours, 10);
        if (h === 12 && modifier === 'AM') h = 0;
        if (modifier === 'PM' && h !== 12) h += 12;

        if (h >= 5 && h < 12) return 'morning';
        if (h >= 12 && h < 17) return 'afternoon';
        return 'night';
    };

    const fetchSchedules = async () => {
        if (!employee) return;
        setLoading(true);
        try {
            const params = {
                start_date: format(weekStart, 'yyyy-MM-dd'),
                end_date: format(weekEnd, 'yyyy-MM-dd')
            };

            const data = employee.id === 'all'
                ? await rosterService.getAllRosters(params)
                : await rosterService.getRosterByEmployeeId(employee.id, params);

            if (data.success && data.data) {
                // Handle roster-based response structure where schedules are nested
                let allSchedules = [];

                if (Array.isArray(data.data)) {
                    // data.data is an array of rosters, each with nested schedules
                    data.data.forEach(roster => {
                        if (roster.schedules && Array.isArray(roster.schedules)) {
                            // Add employee info to each schedule for proper grouping
                            const schedulesWithEmployeeInfo = roster.schedules.map(schedule => ({
                                ...schedule,
                                employee_id: roster.employee_id,
                                employee_name: roster.name || `${roster.employees?.first_name} ${roster.employees?.last_name}`,
                                employee_code: roster.employees?.employee_code
                            }));
                            allSchedules = allSchedules.concat(schedulesWithEmployeeInfo);
                        }
                    });
                } else if (data.data.schedules) {
                    // Single roster response - also need to add employee info
                    const roster = data.data;
                    allSchedules = roster.schedules.map(schedule => ({
                        ...schedule,
                        employee_id: roster.employee_id,
                        employee_name: roster.name || `${roster.employees?.first_name} ${roster.employees?.last_name}`,
                        employee_code: roster.employees?.employee_code
                    }));
                }

                setSchedules(allSchedules);
            } else {
                setSchedules([]);
            }
        } catch (error) {
            console.error("Failed to fetch schedules", error);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [employee, currentDate]);

    // Group and filter data
    const allGroupedData = useMemo(() => {
        const groups = {};

        // If a specific employee is selected, ensure they are in the groups list even without shifts
        if (employee && employee.id !== 'all') {
            const fullName = `${employee.first_name} ${employee.last_name}`;
            groups[fullName] = {
                name: fullName,
                role: employee.users?.role || 'employee',
                code: employee.employee_code || '',
                shifts: {}
            };
        }

        schedules.forEach(s => {
            const name = s.employee_name || 'Unknown';
            if (!groups[name]) {
                // Try to find employee in the allEmployees list to get their correct role/designation
                const empInfo = allEmployees?.find(e => e.id === s.employee_id || e.employee_code === s.employee_code);
                const role = empInfo?.users?.role || 'employee';
                const code = empInfo?.employee_code || s.employee_code || '';
                groups[name] = { name, role, code, shifts: {} };
            }
            const dateStr = format(parseISO(s.date), 'yyyy-MM-dd');
            groups[name].shifts[dateStr] = s;
        });

        const result = Object.values(groups);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return result.filter(g => g.name.toLowerCase().includes(term));
        }
        return result;
    }, [schedules, searchTerm, allEmployees, employee]);

    // Apply pagination
    const paginatedData = useMemo(() => {
        return allGroupedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [allGroupedData, page, rowsPerPage]);

    const handlePrevWeek = () => {
        setCurrentDate(addDays(currentDate, -7));
        setPage(0);
    };
    const handleNextWeek = () => {
        setCurrentDate(addDays(currentDate, 7));
        setPage(0);
    };
    const handleToday = () => {
        setCurrentDate(new Date());
        setPage(0);
    };

    const handleEditClick = (shift) => {
        if (canManage) {
            setSelectedSchedule(shift);
            setOpenEditModal(true);
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            <Paper elevation={0} sx={{ p: 2, mb: 1, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>

                    {/* Left: Navigation */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-start' }, flexWrap: 'wrap' }}>
                        <Button size="small" variant="outlined" onClick={handleToday} sx={{ borderRadius: 1.5 }}>Today</Button>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton size="small" onClick={handlePrevWeek}><ChevronLeftIcon fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={handleNextWeek}><ChevronRightIcon fontSize="small" /></IconButton>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto', display: { xs: 'none', sm: 'block' } }} />
                        {!isMobile && (
                            <Tooltip title={isFullScreen ? "Exit Fullscreen" : "Fullscreen View"}>
                                <IconButton
                                    size="small"
                                    onClick={() => setIsFullScreen(!isFullScreen)}
                                    sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        color: 'primary.main',
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                    }}
                                >
                                    {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                                </IconButton>
                            </Tooltip>
                        )}
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto', display: { xs: 'none', sm: 'block' } }} />
                        <Typography variant="body1" sx={{ ml: { xs: 0, sm: 1 }, fontWeight: 700, whiteSpace: 'nowrap', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                            {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                        </Typography>
                    </Box>

                    {/* Center: Shift Legend (Responsive Scroll) */}
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        width: { xs: '100%', md: 'auto' },
                        overflowX: 'auto',
                        py: { xs: 1, md: 0 },
                        '&::-webkit-scrollbar': { height: 4 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 }
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, px: 1, minWidth: 'max-content' }}>
                            {['morning', 'afternoon', 'night', 'off'].map((key, index, arr) => {
                                const value = shiftColors[key];
                                const label = key === 'off' ? 'Week Off' : key;
                                return (
                                    <React.Fragment key={key}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1 }}>
                                            <Box sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: '8px',
                                                bgcolor: value.bg,
                                                border: `1.5px solid ${value.border}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: value.text
                                            }}>
                                                <value.icon sx={{ fontSize: '1.4rem' }} />
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'capitalize' }}>
                                                {label}
                                            </Typography>
                                        </Box>
                                        {index < arr.length - 1 && <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto' }} />}
                                    </React.Fragment>
                                );
                            })}
                        </Box>
                    </Box>

                    {/* Right: Filters */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
                        {canManage && (
                            <>
                                <Autocomplete
                                    options={allEmployees || []}
                                    getOptionLabel={(option) => option.id === 'all' ? 'All Employees' : `${option.first_name} ${option.last_name}`}
                                    value={employee}
                                    onChange={(e, newValue) => onEmployeeChange(newValue)}
                                    renderInput={(params) => <TextField {...params} label="Filter" size="small" />}
                                    sx={{ width: { xs: '100%', sm: 220 } }}
                                />
                                {employee?.id === 'all' && (
                                    <TextField
                                        size="small"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        sx={{ width: { xs: '100%', sm: 160 } }}
                                    />
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Paper>

            {isMobile ? (
                // Mobile View: Cards Stack
                <Stack spacing={2} sx={{ mt: 2 }}>
                    {loading && allGroupedData.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : allGroupedData.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">No rosters found period.</Typography>
                        </Box>
                    ) : (
                        paginatedData.map((group) => (
                            <Card key={group.name} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', bgcolor: 'background.paper' }}>
                                <Box sx={{ p: 2, borderBottom: '1px dotted', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{
                                            bgcolor: theme.palette.primary.main,
                                            color: '#fff',
                                            width: 44,
                                            height: 44,
                                            fontSize: '1rem',
                                            fontWeight: 800,
                                            boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.2)}`
                                        }}>
                                            {group.name.split(' ').map(n => n[0]).join('')}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2, mb: 0.5 }}>
                                                {group.name}
                                            </Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Box sx={{
                                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                    px: 1,
                                                    py: 0.2,
                                                    borderRadius: 1,
                                                    border: '1px solid',
                                                    borderColor: alpha(theme.palette.primary.main, 0.1)
                                                }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.65rem' }}>
                                                        {group.code}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem' }}>
                                                    • {group.role}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                        <IconButton size="small" sx={{ opacity: 0.5 }}><MoreVertIcon fontSize="small" /></IconButton>
                                    </Box>
                                </Box>
                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Stack spacing={1}>
                                        {weekDays.map(day => {
                                            const dateStr = format(day, 'yyyy-MM-dd');
                                            const shift = group.shifts[dateStr];
                                            const type = shift ? (shift.is_week_off ? 'off' : getShiftType(shift.shift_start)) : null;
                                            const colors = type ? shiftColors[type] : null;
                                            const Icon = colors?.icon;

                                            return (
                                                <Box
                                                    key={dateStr}
                                                    onClick={() => shift && handleEditClick(shift)}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        p: 1.2,
                                                        px: 1.5,
                                                        borderRadius: 1.5,
                                                        bgcolor: 'background.paper',
                                                        border: '1px solid',
                                                        borderColor: colors ? alpha(colors.border, 0.3) : 'divider',
                                                        cursor: shift && canManage ? 'pointer' : 'default',
                                                        transition: 'all 0.2s',
                                                        '&:hover': shift && canManage ? { transform: 'translateY(-1px)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } : {}
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                                        <Box sx={{ width: 45, flexShrink: 0 }}>
                                                            <Typography sx={{ fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', color: isToday(day) ? 'primary.main' : 'text.secondary' }}>
                                                                {format(day, 'EEE')}
                                                            </Typography>
                                                            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: isToday(day) ? 'primary.main' : 'text.primary', lineHeight: 1 }}>
                                                                {format(day, 'dd')}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                                            <Box sx={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: 1,
                                                                bgcolor: colors ? alpha(colors.bg, 0.1) : 'transparent',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: colors ? colors.text : 'text.disabled',
                                                                border: colors ? `1px solid ${alpha(colors.border, 0.2)}` : 'none'
                                                            }}>
                                                                {Icon ? <Icon sx={{ fontSize: '1.2rem' }} /> : <OffIcon sx={{ fontSize: '1.1rem', opacity: 0.3 }} />}
                                                            </Box>
                                                            <Box>
                                                                {shift ? (
                                                                    shift.is_week_off ? (
                                                                        <Typography variant="caption" sx={{ fontWeight: 800, color: colors.text }}>WEEK OFF</Typography>
                                                                    ) : (
                                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: colors.text, fontSize: '0.8rem' }}>
                                                                            {shift.shift_start} - {shift.shift_end}
                                                                        </Typography>
                                                                    )
                                                                ) : (
                                                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>NO ROSTER</Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Stack>
            ) : (
                <Card sx={{
                    borderRadius: 2,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden'
                }}>
                    <TableContainer
                        sx={{
                            height: 565,
                            overflow: 'auto',
                            bgcolor: 'background.paper',
                            '&::-webkit-scrollbar': { width: 8, height: 8 },
                            '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: (theme) => theme.palette.divider,
                                borderRadius: 4,
                                '&:hover': { backgroundColor: (theme) => theme.palette.text.disabled }
                            }
                        }}
                    >
                        <Table stickyHeader size="small" sx={{ '& td, & th': { borderBottom: '1px solid', borderColor: 'divider' } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            fontWeight: 700,
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                                            color: 'text.secondary',
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            zIndex: 10,
                                            position: 'sticky',
                                            left: 0,
                                            height: 48
                                        }}
                                    >
                                        EMPLOYEE NAME
                                    </TableCell>
                                    {weekDays.map(day => (
                                        <TableCell
                                            key={day.toISOString()}
                                            align="center"
                                            sx={{
                                                fontWeight: 500,
                                                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                                                color: isToday(day) ? theme.palette.primary.main : 'text.secondary',
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                minWidth: { xs: 100, sm: 120, lg: 160 },
                                                height: { xs: 40, sm: 48 }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
                                                    {format(day, 'EEE')}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 800, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                                    {format(day, 'dd MMM')}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading && allGroupedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                            <CircularProgress size={30} />
                                        </TableCell>
                                    </TableRow>
                                ) : allGroupedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                            <Typography variant="body2" color="text.secondary">No rosters found period.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((group) => (
                                        <TableRow key={group.name} sx={{ height: 52 }}>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 600,
                                                    position: 'sticky',
                                                    left: 0,
                                                    bgcolor: 'background.paper',
                                                    zIndex: 5,
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.primary.main, fontSize: { xs: '0.8rem', sm: '0.9rem' }, lineHeight: 1.1 }}>
                                                    {group.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.55rem', sm: '0.65rem' }, fontWeight: 600, opacity: 0.7 }}>
                                                    ID: {group.code}
                                                </Typography>
                                            </TableCell>
                                            {weekDays.map(day => {
                                                const dateStr = format(day, 'yyyy-MM-dd');
                                                const shift = group.shifts[dateStr];
                                                const type = shift ? (shift.is_week_off ? 'off' : getShiftType(shift.shift_start)) : null;
                                                const colors = type ? shiftColors[type] : null;
                                                const Icon = colors?.icon;

                                                return (
                                                    <TableCell key={dateStr} align="center" sx={{ p: '2px' }}>
                                                        {shift ? (
                                                            <Tooltip title={`${shift.shift_start} - ${shift.shift_end}`}>
                                                                <Box
                                                                    onClick={() => handleEditClick(shift)}
                                                                    sx={{
                                                                        height: 50,
                                                                        width: '98%',
                                                                        mx: 'auto',
                                                                        cursor: canManage ? 'pointer' : 'default',
                                                                        bgcolor: colors.bg,
                                                                        color: colors.text,
                                                                        border: `1.5px dotted ${colors.border}`,
                                                                        borderRadius: '6px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        p: 0,
                                                                        transition: 'all 0.2s',
                                                                        overflow: 'hidden'
                                                                    }}
                                                                >
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        px: 1
                                                                    }}>
                                                                        {Icon && <Icon sx={{ fontSize: '1.3rem', color: colors.border }} />}
                                                                    </Box>

                                                                    <Box sx={{ height: '55%', width: '1px', bgcolor: colors.border, opacity: 0.3 }} />

                                                                    <Box sx={{
                                                                        flex: 1,
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                        px: 1
                                                                    }}>
                                                                        {shift.is_week_off ? (
                                                                            <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.6rem', sm: '0.8rem' }, letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'center' }}>WEEK OFF</Typography>
                                                                        ) : (
                                                                            <>
                                                                                <Typography sx={{
                                                                                    fontWeight: 500,
                                                                                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                                                    whiteSpace: 'nowrap',
                                                                                    letterSpacing: '-0.2px',
                                                                                    lineHeight: 1
                                                                                }}>
                                                                                    {`${shift.shift_start.replace(' ', '')}-${shift.shift_end.replace(' ', '')}`}
                                                                                </Typography>
                                                                                <Typography sx={{
                                                                                    fontWeight: 600,
                                                                                    fontSize: { xs: '0.55rem', sm: '0.7rem' },
                                                                                    opacity: 0.8,
                                                                                    textTransform: 'lowercase',
                                                                                    lineHeight: 1,
                                                                                    mt: 0.2
                                                                                }}>
                                                                                    {group.role}
                                                                                </Typography>
                                                                            </>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            </Tooltip>
                                                        ) : (
                                                            <Typography variant="caption" sx={{ opacity: 0.1 }}>.</Typography>
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Divider />

                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={allGroupedData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                            '& .MuiTablePagination-toolbar': {
                                minHeight: { xs: 40, sm: 48 },
                                px: { xs: 0.5, sm: 2 }
                            },
                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                fontWeight: 700,
                                color: 'text.secondary'
                            },
                            '& .MuiTablePagination-actions': {
                                ml: { xs: 0.5, sm: 2 }
                            }
                        }}
                    />
                </Card>
            )}

            <Dialog
                fullScreen
                open={isFullScreen}
                onClose={() => setIsFullScreen(false)}
                TransitionComponent={Slide}
                TransitionProps={{ direction: 'up' }}
            >
                <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
                    <Box sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper'
                    }}>
                        <Typography variant="h6" fontWeight={800} color="primary.main">
                            Fullscreen Roster View
                        </Typography>
                        <IconButton onClick={() => setIsFullScreen(false)} color="primary">
                            <FullscreenExitIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
                        <Card sx={{
                            borderRadius: 2,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden'
                        }}>
                            <TableContainer
                                sx={{
                                    height: 'calc(100vh - 180px)', // Adjust based on header and pagination
                                    overflow: 'auto',
                                    bgcolor: 'background.paper',
                                    '&::-webkit-scrollbar': { width: 8, height: 8 },
                                    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: (theme) => theme.palette.divider,
                                        borderRadius: 4,
                                        '&:hover': { backgroundColor: (theme) => theme.palette.text.disabled }
                                    }
                                }}
                            >
                                <Table stickyHeader size="small" sx={{ '& td, & th': { borderBottom: '1px solid', borderColor: 'divider' } }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    fontWeight: 700,
                                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                                                    color: 'text.secondary',
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                    zIndex: 10,
                                                    position: 'sticky',
                                                    left: 0,
                                                    height: 48
                                                }}
                                            >
                                                EMPLOYEE NAME
                                            </TableCell>
                                            {weekDays.map(day => (
                                                <TableCell
                                                    key={day.toISOString()}
                                                    align="center"
                                                    sx={{
                                                        fontWeight: 500,
                                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                                                        color: isToday(day) ? theme.palette.primary.main : 'text.secondary',
                                                        fontSize: '0.75rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px',
                                                        minWidth: 160,
                                                        height: 48
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                                            {format(day, 'EEE')}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                            {format(day, 'dd MMM')}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedData.map((group) => (
                                            <TableRow key={group.name} sx={{ height: 52 }}>
                                                <TableCell
                                                    sx={{
                                                        fontWeight: 600,
                                                        position: 'sticky',
                                                        left: 0,
                                                        bgcolor: 'background.paper',
                                                        zIndex: 5,
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.primary.main, fontSize: '0.9rem', lineHeight: 1.1 }}>
                                                        {group.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 600, opacity: 0.7 }}>
                                                        ID: {group.code}
                                                    </Typography>
                                                </TableCell>
                                                {weekDays.map(day => {
                                                    const dateStr = format(day, 'yyyy-MM-dd');
                                                    const shift = group.shifts[dateStr];
                                                    const type = shift ? (shift.is_week_off ? 'off' : getShiftType(shift.shift_start)) : null;
                                                    const colors = type ? shiftColors[type] : null;
                                                    const Icon = colors?.icon;

                                                    return (
                                                        <TableCell key={dateStr} align="center" sx={{ p: '2px' }}>
                                                            {shift ? (
                                                                <Tooltip title={`${shift.shift_start} - ${shift.shift_end}`}>
                                                                    <Box
                                                                        onClick={() => handleEditClick(shift)}
                                                                        sx={{
                                                                            height: 50,
                                                                            width: '98%',
                                                                            mx: 'auto',
                                                                            cursor: canManage ? 'pointer' : 'default',
                                                                            bgcolor: colors.bg,
                                                                            color: colors.text,
                                                                            border: `1.5px dotted ${colors.border}`,
                                                                            borderRadius: '6px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            p: 0,
                                                                            transition: 'all 0.2s',
                                                                            overflow: 'hidden'
                                                                        }}
                                                                    >
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            px: 1
                                                                        }}>
                                                                            {Icon && <Icon sx={{ fontSize: '1.3rem', color: colors.border }} />}
                                                                        </Box>
                                                                        <Box sx={{ height: '55%', width: '1px', bgcolor: colors.border, opacity: 0.3 }} />
                                                                        <Box sx={{
                                                                            flex: 1,
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            justifyContent: 'center',
                                                                            alignItems: 'center',
                                                                            px: 1
                                                                        }}>
                                                                            {shift.is_week_off ? (
                                                                                <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'center' }}>WEEK OFF</Typography>
                                                                            ) : (
                                                                                <>
                                                                                    <Typography sx={{
                                                                                        fontWeight: 800,
                                                                                        fontSize: '0.75rem',
                                                                                        whiteSpace: 'nowrap',
                                                                                        letterSpacing: '-0.2px',
                                                                                        lineHeight: 1
                                                                                    }}>
                                                                                        {`${shift.shift_start.replace(' ', '')}-${shift.shift_end.replace(' ', '')}`}
                                                                                    </Typography>
                                                                                    <Typography sx={{
                                                                                        fontWeight: 600,
                                                                                        fontSize: '0.7rem',
                                                                                        opacity: 0.8,
                                                                                        textTransform: 'lowercase',
                                                                                        lineHeight: 1,
                                                                                        mt: 0.2
                                                                                    }}>
                                                                                        {group.role}
                                                                                    </Typography>
                                                                                </>
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                </Tooltip>
                                                            ) : (
                                                                <Typography variant="caption" sx={{ opacity: 0.1 }}>.</Typography>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Divider />
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50]}
                                component="div"
                                count={allGroupedData.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                                    '& .MuiTablePagination-toolbar': { minHeight: 48, px: 2 }
                                }}
                            />
                        </Card>
                    </Box>
                </Box>
            </Dialog>

            <EditScheduleModal
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                schedule={{
                    ...selectedSchedule,
                    isRoster: true
                }}
                onSuccess={fetchSchedules}
            />
        </Box>
    );
};

export default RosterTableView;
