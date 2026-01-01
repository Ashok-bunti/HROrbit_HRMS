import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip,
    useTheme,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Avatar,
    Tooltip,
    alpha,
    Fade,
    Zoom
} from '@mui/material';
import {
    Add as AddIcon,
    ChevronLeft,
    ChevronRight,
    Today as TodayIcon,
    EventAvailable as HolidayIcon,
    PersonOff as LeaveIcon,
    Groups as MeetingIcon,
    MoreVert as MoreIcon,
    FilterList as FilterIcon,
    InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useGetAllLeavesQuery } from '../../leaves/store/leaveApi';
import PageHeader from '../../../components/common/PageHeader';
import '../styles/calendar.css';

const CompanyCalendar = () => {
    const theme = useTheme();
    const calendarRef = useRef(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        type: 'meeting',
        start_time: '09:00',
        end_time: '10:00'
    });

    const [filters, setFilters] = useState({
        holidays: true,
        leaves: true,
        events: true
    });

    const { data: leavesData } = useGetAllLeavesQuery();

    const holidays = [
        { id: 'h1', title: 'New Year Day', start: '2026-01-01', className: 'event-holiday', extendedProps: { type: 'holiday' } },
        { id: 'h2', title: 'Republic Day', start: '2026-01-26', className: 'event-holiday', extendedProps: { type: 'holiday' } },
        { id: 'h3', title: 'Pongal', start: '2026-01-14', className: 'event-holiday', extendedProps: { type: 'holiday' } },
        { id: 'h4', title: 'Pongal Holiday', start: '2026-01-15', className: 'event-holiday', extendedProps: { type: 'holiday' } },
    ];

    const [events, setEvents] = useState([]);

    useEffect(() => {
        const calendarEvents = [];
        if (filters.holidays) calendarEvents.push(...holidays);
        if (filters.leaves && leavesData?.leaves) {
            const leaveEvents = leavesData.leaves
                .filter(l => l.status === 'Approved')
                .map(l => ({
                    id: `leave-${l.id}`,
                    title: `${l.employee_name}`,
                    start: l.start_date,
                    end: l.end_date,
                    className: 'event-leave',
                    allDay: true,
                    extendedProps: { type: 'leave', leaveType: l.leave_type }
                }));
            calendarEvents.push(...leaveEvents);
        }
        setEvents(calendarEvents);
    }, [filters, leavesData]);

    const handleDateSelect = (selectInfo) => {
        setSelectedDate(selectInfo.startStr);
        setOpenDialog(true);
    };

    const handleCreateEvent = () => {
        const typeClass = eventData.type === 'meeting' ? 'event-meeting' :
            eventData.type === 'holiday' ? 'event-holiday' : 'event-general';
        const newEvent = {
            id: Date.now().toString(),
            title: eventData.title,
            start: selectedDate,
            className: typeClass,
            extendedProps: { ...eventData }
        };
        setEvents(prev => [...prev, newEvent]);
        setOpenDialog(false);
        setEventData({ title: '', description: '', type: 'meeting', start_time: '09:00', end_time: '10:00' });
    };

    const renderEventContent = (eventInfo) => {
        const { type } = eventInfo.event.extendedProps;
        return (
            <div className={`calendar-event ${eventInfo.event.classNames[0]}`}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {eventInfo.event.title}
                </span>
            </div>
        );
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{
                p: { xs: 1, md: 3 },
                minHeight: '100vh',
                bgcolor: 'background.default',
                '--calendar-bg': theme.palette.background.paper,
                '--calendar-header-bg': theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.5) : '#f8fafc',
                '--calendar-border': theme.palette.divider,
                '--calendar-text-main': theme.palette.text.primary,
                '--calendar-text-muted': theme.palette.text.secondary,
                '--calendar-day-hover': theme.palette.action.hover,
                '--calendar-button-group-bg': theme.palette.action.selected,
                '--calendar-button-active-bg': theme.palette.background.paper,
                '--calendar-sidebar-bg': theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.5) : '#f8fafc',
            }}>
                <PageHeader
                    title="Company Calendar"
                    subtitle="Sync up with your team's schedule"
                    action={
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedDate(new Date().toISOString().split('T')[0]);
                                setOpenDialog(true);
                            }}
                            sx={{
                                borderRadius: '12px',
                                px: 3,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px ' + alpha(theme.palette.primary.main, 0.3),
                                '&:hover': {
                                    boxShadow: '0 6px 16px ' + alpha(theme.palette.primary.main, 0.4),
                                }
                            }}
                        >
                            New Event
                        </Button>
                    }
                />

                <Box sx={{ display: 'flex', mt: 3, gap: 3, height: 'calc(100vh - 180px)' }}>
                    {/* Left Sidebar - Premium Layout */}
                    <Box sx={{ width: 300, display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', gap: 3 }}>
                        <Paper sx={{ p: 2, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', bgcolor: 'var(--calendar-bg)' }}>
                            <DatePicker
                                value={currentDate}
                                onChange={(newValue) => {
                                    setCurrentDate(newValue);
                                    calendarRef.current?.getApi().gotoDate(newValue);
                                }}
                                slots={{ toolbar: () => null }}
                                sx={{
                                    '& .MuiOutlinedInput-root': { display: 'none' },
                                    '& .MuiDateCalendar-root': { width: '100%' }
                                }}
                            />
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', flex: 1, bgcolor: 'var(--calendar-bg)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Filters
                                </Typography>
                                <FilterIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            </Box>

                            <List sx={{ '& .MuiListItem-root': { px: 0, py: 0.5 } }}>
                                {[
                                    { id: 'holidays', label: 'Company Holidays', color: '#ef4444', icon: <HolidayIcon /> },
                                    { id: 'leaves', label: 'Employee Leaves', color: '#8b5cf6', icon: <LeaveIcon /> },
                                    { id: 'events', label: 'Meetings & Events', color: '#10b981', icon: <MeetingIcon /> }
                                ].map((filter) => (
                                    <ListItem key={filter.id}>
                                        <Checkbox
                                            size="small"
                                            checked={filters[filter.id]}
                                            onChange={() => setFilters(prev => ({ ...prev, [filter.id]: !prev[filter.id] }))}
                                            sx={{
                                                color: filter.color,
                                                '&.Mui-checked': { color: filter.color },
                                                p: 0.5,
                                                mr: 1
                                            }}
                                        />
                                        <ListItemText
                                            primary={filter.label}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                sx: { fontWeight: 600, color: 'text.primary' }
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '16px', border: '1px dashed', borderColor: 'divider' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <InfoIcon sx={{ fontSize: 14 }} />
                                    Tip: Click on any date to create a new event.
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>

                    {/* Main Content Area */}
                    <Box sx={{ flex: 1, height: '100%' }}>
                        <Paper className="calendar-container" sx={{ height: '100%', borderRadius: '32px', border: '1px solid', borderColor: 'divider', p: 1, bgcolor: 'var(--calendar-bg)' }}>
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                eventContent={renderEventContent}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                events={events}
                                editable={true}
                                selectable={true}
                                selectMirror={true}
                                dayMaxEvents={3}
                                weekends={true}
                                select={handleDateSelect}
                                height="100%"
                                themeSystem="standard"
                            />
                        </Paper>
                    </Box>
                </Box>

                {/* Modern Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    TransitionComponent={Zoom}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: '24px', p: 1 }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', pb: 0 }}>
                        Create New Event
                        <Typography variant="body2" color="text.secondary">
                            Schedule a new activity for {selectedDate}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
                            <TextField
                                fullWidth
                                placeholder="Event Title (e.g., Weekly Sync)"
                                variant="outlined"
                                value={eventData.title}
                                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Event Category"
                                    value={eventData.type}
                                    onChange={(e) => setEventData({ ...eventData, type: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                >
                                    <MenuItem value="meeting">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ w: 8, h: 8, borderRadius: '50%', bgcolor: '#10b981' }} /> Meeting
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="holiday">Holiday</MenuItem>
                                    <MenuItem value="event">General Event</MenuItem>
                                </TextField>

                                <Tooltip title="Set specific time for meetings">
                                    <TextField
                                        type="time"
                                        label="Time"
                                        value={eventData.start_time}
                                        onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, width: 200 }}
                                    />
                                </Tooltip>
                            </Box>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Add notes or description..."
                                value={eventData.description}
                                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button
                            onClick={() => setOpenDialog(false)}
                            sx={{ color: 'text.secondary', fontWeight: 600 }}
                        >
                            Discard
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateEvent}
                            disabled={!eventData.title}
                            sx={{
                                borderRadius: '12px',
                                px: 4,
                                fontWeight: 700,
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            Save Event
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
};

export default CompanyCalendar;
