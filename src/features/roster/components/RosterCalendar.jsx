import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    alpha,
    useTheme,
    Tooltip,
    IconButton,
    Divider,
    useMediaQuery,
    Dialog,
    Slide
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    LocalHospital as LeaveIcon,
    EventBusy as HolidayIcon,
    WbSunny as MorningIcon,
    WbTwilight as EveningIcon,
    NightsStay as NightIcon,
    Block as OffIcon,
    WorkOutline as ShiftIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import rosterService from '../store/Rosterapi';
import EditScheduleModal from './EditScheduleModal';
import { useGetHolidaysQuery } from '../../calendar/store/calendarApi';
import { useGetAllAttendanceQuery } from '../../attendance/store/attendanceApi';
import { useGetAllLeavesQuery } from '../../leaves/store/leaveApi';
import { format, differenceInHours, parse } from 'date-fns';

const RosterCalendar = ({ employee, canManage, searchTerm }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const calendarRef = useRef(null);
    const fullScreenCalendarRef = useRef(null);

    const getShiftType = (startTime) => {
        if (!startTime) return null;
        const [time, modifier] = startTime.split(/(?=[AP]M)/);
        let [hours] = time.split(':');
        let h = parseInt(hours, 10);
        if (h === 12 && modifier === 'AM') h = 0;
        if (modifier === 'PM' && h !== 12) h += 12;

        if (h >= 5 && h < 12) return 'morning';
        if (h >= 12 && h < 17) return 'afternoon';
        return 'night';
    };

    const isDarkMode = theme.palette.mode === 'dark';

    const shiftColors = {
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
        driver: {
            bg: alpha(theme.palette.success.main, 0.15),
            border: alpha(theme.palette.success.main, 0.5),
            text: theme.palette.success.main,
            icon: MorningIcon
        },
        off: {
            bg: alpha(theme.palette.text.disabled, 0.06),
            border: alpha(theme.palette.text.disabled, 0.2),
            text: theme.palette.text.secondary,
            icon: OffIcon
        }
    };

    const fetchRoster = async (start, end, targetEmployeeId) => {
        if (!targetEmployeeId) {
            setEvents([]);
            return;
        }

        setLoading(true);
        try {
            const data = await rosterService.getRosterByEmployeeId(targetEmployeeId, {
                start_date: start,
                end_date: end
            });

            if (data.success && data.data && data.data.schedules) {
                const formattedEvents = data.data.schedules.map(schedule => {
                    const isWeekOff = schedule.is_week_off;
                    let startDt, endDt;

                    if (!isWeekOff && schedule.shift_start && schedule.shift_end && schedule.date) {
                        const dateStr = schedule.date.split('T')[0];

                        const parseTime = (timeStr, date) => {
                            const [time, modifier] = timeStr.split(/(?=[AP]M)/);
                            let [hours, minutes] = time.split(':');
                            let h = parseInt(hours, 10);
                            if (h === 12 && modifier === 'AM') h = 0;
                            if (modifier === 'PM' && h !== 12) h += 12;
                            return `${date}T${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
                        };

                        startDt = parseTime(schedule.shift_start, dateStr);
                        endDt = parseTime(schedule.shift_end, dateStr);
                    }

                    const isAllView = employee?.id === 'all';
                    const title = isWeekOff ? 'OFF' : `${schedule.shift_start.replace(' ', '')}-${schedule.shift_end.replace(' ', '')}`;

                    let shiftType = isWeekOff ? 'off' : getShiftType(schedule.shift_start);
                    // Match specialized color if it's a specific role mentioned in the UI
                    const lowerName = schedule.employee_name?.toLowerCase() || '';
                    if (lowerName.includes('driver')) shiftType = 'driver';
                    if (lowerName.includes('dispatcher')) shiftType = 'night';
                    if (lowerName.includes('admin')) shiftType = 'afternoon';

                    const colors = shiftColors[shiftType] || shiftColors.morning;

                    return {
                        id: schedule.id,
                        title,
                        start: isWeekOff ? (schedule.date.split('T')[0]) : startDt,
                        end: isWeekOff ? (schedule.date.split('T')[0]) : endDt,
                        allDay: isWeekOff,
                        backgroundColor: isAllView ? alpha(colors.border, 0.05) : colors.bg,
                        borderColor: colors.border,
                        textColor: colors.text,
                        className: isWeekOff ? 'shift-off' : '',
                        extendedProps: {
                            ...schedule,
                            shiftType,
                            isRoster: true
                        }
                    };
                });
                setEvents(formattedEvents);
                setError(null);
            } else {
                setEvents([]);
                setError(null);
            }
        } catch (err) {
            if (err.response?.status === 404 || err.response?.data?.success === false) {
                setEvents([]);
                setError(null);
            } else {
                console.error("Error fetching roster", err);
                setError("Failed to load roster.");
            }
        } finally {
            setLoading(false);
        }
    };



    const [dateRange, setDateRange] = useState({ start: null, end: null });

    const { data: holidaysData } = useGetHolidaysQuery({}, { skip: !dateRange.start });
    const { data: attendanceData } = useGetAllAttendanceQuery({
        employee_id: employee?.id,
        start_date: dateRange.start,
        end_date: dateRange.end
    }, { skip: !employee || !dateRange.start });
    const { data: leavesData } = useGetAllLeavesQuery({
        employee_id: employee?.id,
        status: 'APPROVED'
    }, { skip: !employee });

    const [allEvents, setAllEvents] = useState([]);

    const calculateWeeklyHours = (date) => {
        // Find all events in the MON-SUN week ending on this Sunday 'date'
        const endOfWeek = new Date(date);
        endOfWeek.setHours(23, 59, 59, 999);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - 6);
        startOfWeek.setHours(0, 0, 0, 0);

        let total = 0;
        events.forEach(event => {
            const evDate = new Date(event.start);
            if (evDate >= startOfWeek && evDate <= endOfWeek && !event.allDay) {
                const sched = event.extendedProps;
                if (sched.shift_start && sched.shift_end) {
                    try {
                        const s = parse(sched.shift_start, 'hh:mmaa', new Date());
                        const e = parse(sched.shift_end, 'hh:mmaa', new Date());
                        let diff = differenceInHours(e, s);
                        if (diff < 0) diff += 24; // Handle overnight
                        total += diff;
                    } catch (e) { }
                }
            }
        });
        return total;
    };

    useEffect(() => {
        let rosterEvents = events;

        // Apply local search filtering for "All" view
        if (employee?.id === 'all' && searchTerm) {
            const term = searchTerm.toLowerCase();
            rosterEvents = events.filter(e => {
                const name = e.extendedProps.employee_name?.toLowerCase() || '';
                const notes = e.extendedProps.notes?.toLowerCase() || '';
                return name.includes(term) || notes.includes(term);
            });
        }

        // Holiday and Leave events are no longer merged for Calendar display
        // as per user request, but serve as data source for Stats Dashboard.

        setAllEvents([...rosterEvents]);
    }, [events, holidaysData, leavesData, searchTerm]);

    const handleDatesSet = (dateInfo) => {
        setDateRange({ start: dateInfo.startStr.split('T')[0], end: dateInfo.endStr.split('T')[0] });
        if (employee) {
            fetchRoster(dateInfo.startStr.split('T')[0], dateInfo.endStr.split('T')[0], employee.id);
        } else {
            setEvents([]);
        }
    };

    useEffect(() => {
        if (calendarRef.current && employee) {
            const api = calendarRef.current.getApi();
            const view = api.view;
            fetchRoster(view.activeStart.toISOString().split('T')[0], view.activeEnd.toISOString().split('T')[0], employee.id);
        } else if (!employee) {
            setEvents([]);
        }
    }, [employee]);

    const renderEventContent = (eventInfo) => {
        const { event } = eventInfo;
        const props = event.extendedProps;
        const colors = shiftColors[props.shiftType] || shiftColors.morning;

        if (props.isHoliday) {
            return (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    p: '4px 8px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    bgcolor: alpha('#ef4444', 0.1),
                    border: `1px solid ${alpha('#ef4444', 0.3)}`
                }}>
                    <span style={{ fontSize: '0.85rem' }}>🎉</span>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#b91c1c', whiteSpace: 'nowrap' }}>
                        {event.title}
                    </Typography>
                </Box>
            );
        }

        if (props.isLeave) {
            return (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    p: '4px 8px',
                    borderRadius: '6px',
                    bgcolor: alpha('#ec4899', 0.1),
                    border: `1px solid ${alpha('#ec4899', 0.3)}`
                }}>
                    <span style={{ fontSize: '0.85rem' }}>🏥</span>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9d174d' }}>
                        {event.title}
                    </Typography>
                </Box>
            );
        }

        // Roster shift event
        const Icon = colors.icon;

        return (
            <Box sx={{
                width: '90%',
                mx: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0,
                borderRadius: '6px',
                border: `1.5px dotted ${colors.border}`,
                bgcolor: colors.bg,
                minHeight: { xs: '36px', sm: '50px' },
                overflow: 'hidden',
                boxShadow: `0 1px 2px ${alpha(colors.border, 0.2)}`,
                transition: 'none'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 1,
                    minWidth: '32px'
                }}>
                    {Icon && <Icon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, color: colors.border }} />}
                </Box>

                <Box sx={{ height: '30px', width: '1px', bgcolor: colors.border, opacity: 0.3 }} />

                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: 1, // Normalized to match Icon container
                    overflow: 'hidden'
                }}>
                    {props.title === 'OFF' ? (
                        <Typography sx={{
                            fontWeight: 800,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            color: colors.text
                        }}>
                            WEEK OFF
                        </Typography>
                    ) : (
                        <>
                            <Typography sx={{
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                fontWeight: 800,
                                color: colors.text,
                                whiteSpace: 'nowrap',
                                letterSpacing: '-0.3px',
                                lineHeight: 1.2
                            }}>
                                {event.title}
                            </Typography>
                            {(!employee || employee.id === 'all') ? (
                                <Typography sx={{
                                    fontSize: '0.6rem',
                                    fontWeight: 600,
                                    color: colors.text,
                                    opacity: 0.7,
                                    textTransform: 'capitalize',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {props.employee_name || 'employee'}
                                </Typography>
                            ) : (
                                <Typography sx={{
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    color: colors.text,
                                    opacity: 0.8,
                                    textTransform: 'lowercase',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    mt: 0.2
                                }}>
                                    {employee.users?.role || 'employee'}
                                </Typography>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        );
    };

    const renderDayCell = (dayInfo) => {
        const isEndOfWeek = dayInfo.date.getDay() === 0; // Sunday
        const isToday = dayInfo.isToday;

        return (
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: '4px 8px' }}>
                    <Typography sx={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: isToday ? '#fff' : theme.palette.text.primary,
                        bgcolor: isToday ? theme.palette.primary.main : 'transparent',
                        borderRadius: '10px', // More modern rounded square look
                        width: { xs: 24, sm: 28 },
                        height: { xs: 24, sm: 28 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isToday ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                        transition: 'all 0.2s'
                    }}>
                        {dayInfo.dayNumberText}
                    </Typography>
                </Box>
            </Box>
        );
    };

    const today = new Date();

    // Process Roster Data
    const rosterOnlyEvents = allEvents.filter(e => e.extendedProps?.isRoster);
    const upcomingShifts = rosterOnlyEvents.filter(e => e.extendedProps?.shiftType !== 'off' && new Date(e.start) >= today).length;
    const nextOff = rosterOnlyEvents
        .filter(e => e.extendedProps?.shiftType === 'off' && new Date(e.start) >= today)
        .sort((a, b) => new Date(a.start) - new Date(b.start))[0];

    // Process Holidays directly from API data
    const allHolidays = holidaysData?.events || [];
    const futureHolidays = allHolidays
        .filter(h => new Date(h.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const nextHoliday = futureHolidays[0];

    // Process Leaves directly from API data
    const approvedLeaves = leavesData?.data || [];
    const leavesCount = approvedLeaves.length;

    const stats = {
        shifts: {
            count: rosterOnlyEvents.filter(e => e.extendedProps?.shiftType !== 'off').length,
            detail: `${upcomingShifts} Upcoming`,
            subDetail: null
        },
        offs: {
            count: rosterOnlyEvents.filter(e => e.extendedProps?.shiftType === 'off').length,
            detail: nextOff ? 'Next Week Off' : 'None',
            subDetail: nextOff ? new Date(nextOff.start).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : null
        },
        holidays: {
            count: allHolidays.length,
            detail: nextHoliday ? `Next: ${nextHoliday.title}` : 'None',
            subDetail: nextHoliday ? new Date(nextHoliday.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : null
        },
        leaves: {
            count: leavesCount,
            detail: `${leavesCount} Approved`,
            subDetail: null
        }
    };

    return (
        <Box sx={{
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            position: 'relative',
            // Classic Business Theme Overrides
            '& .fc': {
                '--fc-border-color': 'transparent', // Remove grid borders for card feel
                '--fc-button-text-color': theme.palette.text.primary,
                '--fc-button-bg-color': theme.palette.background.paper,
                '--fc-button-border-color': theme.palette.divider,
                '--fc-button-hover-bg-color': theme.palette.action.hover,
                '--fc-button-active-bg-color': alpha(theme.palette.primary.main, 0.1),
                '--fc-button-active-border-color': theme.palette.primary.main,
                fontFamily: theme.typography.fontFamily,
            },
            '& .fc .fc-header-toolbar': {
                mr: { xs: 0, sm: 6 },
                mb: '20px !important',
                minHeight: '50px',
                display: 'flex',
                alignItems: 'center'
            },
            '& .fc .fc-toolbar-title': {
                fontSize: { xs: '1.1rem', sm: '1.5rem' },
                fontWeight: 700,
                color: theme.palette.text.primary,
                letterSpacing: '-0.5px'
            },
            '& .fc .fc-button': {
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.85rem' },
                padding: { xs: '4px 10px', sm: '8px 20px' },
                boxShadow: 'none !important',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:active': { transform: 'scale(0.98)' }
            },
            '& .fc .fc-scrollgrid': {
                border: 'none !important'
            },
            '& .fc .fc-daygrid-day': {
                padding: '4px !important',
            },
            '& .fc .fc-daygrid-day-frame': {
                backgroundColor: theme.palette.background.paper,
                borderRadius: '12px',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0,0,0,0.5)'
                    : '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease-in-out',
                overflow: 'visible', // Allow content to show if it overflows
                minHeight: { xs: '80px', sm: '100px', md: '120px' },

            },
            '& .fc .fc-scroller': {
                overflow: 'visible !important',
                height: 'auto !important'
            },
            '& .fc .fc-daygrid-day.fc-day-today': {
                backgroundColor: `${theme.palette.background.paper} !important`
            },
            '& .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-frame': {
                backgroundColor: `${alpha(theme.palette.primary.main, 0.04)} !important`, // Subtle tint for the card
                borderColor: theme.palette.primary.main,
                borderRadius: '12px !important', // Explicitly enforce the radius
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                borderWidth: '2px'
            },
            '& .fc .fc-event': {
                borderRadius: '6px',
                padding: '0 !important',
                backgroundColor: 'transparent !important',
                border: 'none !important',
                boxShadow: 'none !important',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: canManage ? 'pointer' : 'default',
                margin: '2px 6px',
                '&:hover': {
                    filter: 'none',
                },
                '&.shift-off': {
                    borderLeft: 'none',
                    borderWidth: 0
                }
            },
            '& .fc .fc-col-header-cell': {
                padding: '12px 0',
                backgroundColor: 'transparent',
                color: theme.palette.text.secondary,
                fontSize: '0.85rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1px'
            },
            '& .fc .fc-col-header-cell.fc-day-today': {
                color: `${theme.palette.primary.main} !important`,
                backgroundColor: `${alpha(theme.palette.primary.main, 0.05)} !important`,
            },
            '& .fc .fc-timegrid-col.fc-day-today': {
                backgroundColor: `${alpha(theme.palette.primary.main, 0.05)} !important`,
                borderLeft: `2px solid ${theme.palette.primary.main} !important`,
                borderRight: `2px solid ${theme.palette.primary.main} !important`,
            }
        }}>
            {/* Monthly Overview Dashboard */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: { xs: 1, sm: 2 }, flex: 1 }}>
                    {[
                        { label: 'Total Shifts', data: stats.shifts, icon: ShiftIcon, color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) },
                        { label: 'Week Offs', data: stats.offs, icon: OffIcon, color: theme.palette.text.secondary, bg: theme.palette.action.hover },
                        { label: 'Holidays', data: stats.holidays, icon: HolidayIcon, color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1) },
                        { label: 'Leaves', data: stats.leaves, icon: LeaveIcon, color: '#ec4899', bg: alpha('#ec4899', 0.1) },
                    ].map((stat, index) => (
                        <Box key={index} sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            border: '1.5px dashed',
                            borderColor: alpha(stat.color, 0.4),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1.5,
                            bgcolor: theme.palette.background.paper,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                    width: { xs: 34, sm: 40 },
                                    height: { xs: 34, sm: 40 },
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: stat.bg,
                                    color: stat.color
                                }}>
                                    <stat.icon sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' } }} />
                                </Box>

                                <Box sx={{ height: 30, width: '1.5px', bgcolor: alpha(stat.color, 0.15) }} />

                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1, mb: 0.5, color: theme.palette.text.primary, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
                                        {stat.data.count}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                <Box sx={{
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: '6px',
                                    bgcolor: alpha(stat.color, 0.08),
                                    border: `1px solid ${alpha(stat.color, 0.1)}`
                                }}>
                                    <Typography sx={{
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        color: stat.color,
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {stat.data.detail}
                                    </Typography>
                                </Box>
                                {stat.data.subDetail && (
                                    <Typography sx={{
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        color: 'text.secondary',
                                        mr: 0.5
                                    }}>
                                        {stat.data.subDetail}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {loading && (
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 10,
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backdropFilter: 'blur(2px)'
                }}>
                    <CircularProgress color="primary" />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ position: 'relative' }}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: isMobile ? 'prev,next' : 'prev,today,next',
                        center: 'title',
                        right: isMobile ? 'dayGridMonth,timeGridDay' : 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={allEvents}
                    eventClick={(info) => {
                        if (canManage && info.event.extendedProps.isRoster) {
                            setSelectedSchedule(info.event.extendedProps);
                            setOpenEditModal(true);
                        }
                    }}
                    datesSet={handleDatesSet}
                    height="auto"
                    nowIndicator={true}
                    dayMaxEvents={employee?.id === 'all' ? 5 : false}
                    eventContent={renderEventContent}
                    dayCellContent={renderDayCell}
                    slotEventOverlap={false}
                />

                {!isMobile && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        right: 8,
                        height: '50px', // Matches toolbar minHeight
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Tooltip title="Fullscreen View">
                            <IconButton
                                size="small"
                                onClick={() => setIsFullScreen(true)}
                                sx={{
                                    bgcolor: theme.palette.background.paper, // Match calendar button bg
                                    color: theme.palette.text.secondary, // Subtle icon color
                                    border: `1px solid ${theme.palette.divider}`, // Match calendar border
                                    borderRadius: '8px',
                                    p: '7px',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        borderColor: theme.palette.primary.main,
                                        color: theme.palette.primary.main
                                    }
                                }}
                            >
                                <FullscreenIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </Box>

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
                            Fullscreen Roster Calendar
                        </Typography>
                        <IconButton onClick={() => setIsFullScreen(false)} color="primary">
                            <FullscreenExitIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{
                        flex: 1,
                        p: 2,
                        overflow: 'auto',
                        // Re-apply calendar styles for the dialog scope
                        '& .fc': {
                            '--fc-border-color': 'transparent',
                            '--fc-button-text-color': theme.palette.text.primary,
                            '--fc-button-bg-color': theme.palette.background.paper,
                            '--fc-button-border-color': theme.palette.divider,
                            '--fc-button-hover-bg-color': theme.palette.action.hover,
                            '--fc-button-active-bg-color': alpha(theme.palette.primary.main, 0.1),
                            '--fc-button-active-border-color': theme.palette.primary.main,
                            fontFamily: theme.typography.fontFamily,
                            height: 'calc(100vh - 120px) !important'
                        },
                        '& .fc .fc-toolbar-title': { fontSize: '1.5rem', fontWeight: 700 },
                        '& .fc .fc-daygrid-day-frame': {
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: '12px',
                            border: `1px solid ${theme.palette.divider}`,
                            minHeight: '150px'
                        },
                        '& .fc .fc-col-header-cell.fc-day-today': {
                            color: `${theme.palette.primary.main} !important`,
                            backgroundColor: `${alpha(theme.palette.primary.main, 0.05)} !important`,
                        },
                        '& .fc .fc-timegrid-col.fc-day-today': {
                            backgroundColor: `${alpha(theme.palette.primary.main, 0.05)} !important`,
                            borderLeft: `2px solid ${theme.palette.primary.main} !important`,
                            borderRight: `2px solid ${theme.palette.primary.main} !important`,
                        }
                    }}>
                        <FullCalendar
                            ref={fullScreenCalendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,today,next',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            events={allEvents}
                            eventClick={(info) => {
                                if (canManage && info.event.extendedProps.isRoster) {
                                    setSelectedSchedule(info.event.extendedProps);
                                    setOpenEditModal(true);
                                }
                            }}
                            height="100%"
                            nowIndicator={true}
                            dayMaxEvents={employee?.id === 'all' ? 8 : false}
                            eventContent={renderEventContent}
                            dayCellContent={renderDayCell}
                        />
                    </Box>
                </Box>
            </Dialog>

            <EditScheduleModal
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                schedule={selectedSchedule}
                onSuccess={() => {
                    if (calendarRef.current && employee) {
                        const view = calendarRef.current.getApi().view;
                        fetchRoster(view.activeStart.toISOString().split('T')[0], view.activeEnd.toISOString().split('T')[0], employee.id);
                    }
                }}
            />
        </Box >
    );
};

export default RosterCalendar;
