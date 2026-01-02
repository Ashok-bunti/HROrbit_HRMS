import React, { useState } from 'react';
import {
    Box,
    Grid,
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
    alpha,
    Select,
    FormControl,
    InputLabel,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ChevronLeft,
    ChevronRight,
    EventAvailable as EventIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import { usePermissions } from '../../../hooks/usePermissions';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { useGetEmployeeByUserIdQuery } from '../../employees/store/employeeApi';

const HolidayCalendar = () => {
    const theme = useTheme();
    const { userRole } = usePermissions();
    const isAdmin = userRole === 'admin' || userRole === 'hr';
    const user = useSelector(selectCurrentUser);

    const { data: employeeData } = useGetEmployeeByUserIdQuery(user?.id, {
        skip: !user?.id
    });

    const employeeInfo = employeeData?.employee || {};

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // Generate dynamic years (e.g., 5 years back and 5 years forward)
    const availableYears = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [holidayToDelete, setHolidayToDelete] = useState(null);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [holidayForm, setHolidayForm] = useState({
        name: '',
        date: '',
        type: 'Mandatory', // Mandatory or Optional
    });

    const [applyDialog, setApplyDialog] = useState(false);
    const [applyingHoliday, setApplyingHoliday] = useState(null);
    const [applyForm, setApplyForm] = useState({
        reason: '',
    });

    const [holidays, setHolidays] = useState([
        { id: 1, name: "New Year's Day", date: '2025-01-01', type: 'Mandatory', status: 'Approved' },
        { id: 2, name: "Maha Shivaratri", date: '2025-02-26', type: 'Optional', status: 'None' },
        { id: 3, name: "Holi", date: '2025-03-14', type: 'Optional', status: 'None' },
        { id: 4, name: "Ramzan", date: '2025-03-31', type: 'Optional', status: 'None' },
        { id: 5, name: "Good Friday", date: '2025-04-18', type: 'Mandatory', status: 'Approved' },
        { id: 6, name: "May Day", date: '2025-05-01', type: 'Mandatory', status: 'Approved' },
        { id: 7, name: "Bakrid", date: '2025-06-07', type: 'Optional', status: 'None' },
        { id: 8, name: "Independence Day", date: '2025-08-15', type: 'Mandatory', status: 'Approved' },
        { id: 9, name: "Ganesh Chaturthi", date: '2025-08-27', type: 'Mandatory', status: 'Approved' },
        { id: 10, name: "Onam", date: '2025-09-05', type: 'Optional', status: 'None' },
        { id: 11, name: "Dussehra", date: '2025-10-01', type: 'Mandatory', status: 'Approved' },
        { id: 12, name: "Gandhi Jayanthi", date: '2025-10-02', type: 'Mandatory', status: 'Approved' },
        { id: 13, name: "Diwali", date: '2025-10-20', type: 'Mandatory', status: 'Approved' },
        { id: 14, name: "Christmas Day", date: '2025-12-25', type: 'Mandatory', status: 'Approved' },
    ]);

    const months = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];

    const getHolidaysForMonth = (monthIndex) => {
        return holidays.filter(h => {
            const date = new Date(h.date);
            return date.getMonth() === monthIndex && date.getFullYear() === selectedYear;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const handleOpenDialog = (holiday = null) => {
        if (holiday) {
            setEditingHoliday(holiday);
            setHolidayForm({ name: holiday.name, date: holiday.date, type: holiday.type });
        } else {
            setEditingHoliday(null);
            setHolidayForm({ name: '', date: '', type: 'Mandatory' });
        }
        setOpenDialog(true);
    };

    const handleSaveHoliday = () => {
        if (editingHoliday) {
            setHolidays(holidays.map(h => h.id === editingHoliday.id ? { ...h, ...holidayForm } : h));
        } else {
            setHolidays([...holidays, { ...holidayForm, id: Date.now(), status: 'None' }]);
        }
        setOpenDialog(false);
    };

    const handleDeleteHoliday = (holiday) => {
        setHolidayToDelete(holiday);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (holidayToDelete) {
            setHolidays(holidays.filter(h => h.id !== holidayToDelete.id));
            setOpenDeleteDialog(false);
            setHolidayToDelete(null);
        }
    };

    const handleApplyOptional = (holiday) => {
        setApplyingHoliday(holiday);
        setApplyDialog(true);
    };

    const confirmApply = () => {
        if (applyingHoliday) {
            setHolidays(holidays.map(h => h.id === applyingHoliday.id ? { ...h, status: 'Applied', reason: applyForm.reason } : h));
            setApplyDialog(false);
            setApplyingHoliday(null);
            setApplyForm({ reason: '' });
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <PageHeader
                title="Holiday Calendar"
                subtitle="View and manage company holidays"
                action={
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                sx={{
                                    borderRadius: '12px',
                                    bgcolor: 'background.paper',
                                    '& .MuiSelect-select': { py: 1 }
                                }}
                            >
                                {availableYears.map(year => (
                                    <MenuItem key={year} value={year}>{year}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {isAdmin && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                sx={{
                                    borderRadius: '12px',
                                    px: 3,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px ' + alpha(theme.palette.primary.main, 0.3),
                                }}
                            >
                                Add Holiday
                            </Button>
                        )}
                    </Box>
                }
            />

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)',
                    lg: 'repeat(4, 1fr)',
                    xl: 'repeat(4, 1fr)'
                },
                gap: 3,
                mt: 3
            }}>
                {months.map((month, index) => {
                    const monthHolidays = getHolidaysForMonth(index);
                    return (
                        <Paper
                            key={month}
                            sx={{
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 220,
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
                            }}
                        >
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
                                {month} {selectedYear}
                            </Typography>

                            <Box sx={{
                                flex: 1,
                                overflowY: monthHolidays.length > 0 ? 'auto' : 'hidden',
                                pr: monthHolidays.length > 0 ? 1 : 0,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {monthHolidays.length > 0 ? (
                                    monthHolidays.map((holiday) => {
                                        const holidayDate = new Date(holiday.date);
                                        const day = holidayDate.getDate().toString().padStart(2, '0');
                                        const weekday = holidayDate.toLocaleDateString('en-US', { weekday: 'short' });

                                        return (
                                            <Box
                                                key={holiday.id}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    mb: 1.5,
                                                    p: 1.5,
                                                    position: 'relative',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    borderRadius: '16px',
                                                    border: '1px dashed',
                                                    borderColor: alpha(theme.palette.primary.main, 0.2),
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <Box sx={{
                                                    minWidth: 42,
                                                    height: 42,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: 'background.paper',
                                                    borderRadius: '10px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                    border: '1px solid',
                                                    borderColor: alpha(theme.palette.divider, 0.5)
                                                }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, mb: 0, lineHeight: 1, color: 'primary.main' }}>
                                                        {day}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                                        {weekday}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: 'text.primary',
                                                                fontSize: '0.85rem'
                                                            }}
                                                        >
                                                            {holiday.name}
                                                        </Typography>
                                                        <Tooltip title={holiday.type === 'Mandatory' ? "Mandatory: Holiday for everyone" : "Optional: Apply to opt for this holiday"}>
                                                            <Box
                                                                sx={{
                                                                    width: 6,
                                                                    height: 6,
                                                                    borderRadius: '50%',
                                                                    bgcolor: holiday.type === 'Mandatory' ? 'error.main' : 'warning.main',
                                                                    flexShrink: 0
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                                                        {holiday.type} • {holiday.type === 'Mandatory' ? 'Restricted' : 'Eligible'}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {holiday.status === 'Applied' ? (
                                                        <Chip
                                                            label="APPLIED"
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                fontSize: '0.65rem',
                                                                fontWeight: 800,
                                                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                                                color: 'success.main',
                                                                border: 'none'
                                                            }}
                                                        />
                                                    ) : holiday.type === 'Optional' && !isAdmin ? (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleApplyOptional(holiday)}
                                                            sx={{
                                                                borderRadius: '8px',
                                                                px: 1.5,
                                                                py: 0.2,
                                                                textTransform: 'none',
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                                borderColor: 'primary.main',
                                                                color: 'primary.main',
                                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                                            }}
                                                        >
                                                            Apply
                                                        </Button>
                                                    ) : null}

                                                    {isAdmin && (
                                                        <Box
                                                            className="admin-actions"
                                                            sx={{
                                                                display: 'flex',
                                                                gap: 1,
                                                                ml: 'auto'
                                                            }}
                                                        >
                                                            <Tooltip title="Edit">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleOpenDialog(holiday)}
                                                                    sx={{
                                                                        color: 'text.secondary',
                                                                        border: '1px solid',
                                                                        borderColor: 'divider',
                                                                        p: 0.5,
                                                                        '&:hover': { color: 'primary.main', borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                                                    }}
                                                                >
                                                                    <EditIcon sx={{ fontSize: 14 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Box sx={{ width: '1px', height: 16, bgcolor: 'divider', my: 'auto' }} />
                                                            <Tooltip title="Delete">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDeleteHoliday(holiday)}
                                                                    sx={{
                                                                        color: 'text.secondary',
                                                                        border: '1px solid',
                                                                        borderColor: 'divider',
                                                                        p: 0.5,
                                                                        '&:hover': { color: 'error.main', borderColor: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.05) }
                                                                    }}
                                                                >
                                                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        );
                                    })
                                ) : (
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column'
                                    }}>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, letterSpacing: '0.05em' }}>
                                            No Holidays
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    );
                })}
            </Box>

            {/* Add/Edit Holiday Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Holiday Name"
                            value={holidayForm.name}
                            onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            fullWidth
                            label="Date"
                            type="date"
                            value={holidayForm.date}
                            onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Type"
                            value={holidayForm.type}
                            onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        >
                            <MenuItem value="Mandatory">Mandatory</MenuItem>
                            <MenuItem value="Optional">Optional</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveHoliday}
                        disabled={!holidayForm.name || !holidayForm.date}
                        sx={{ borderRadius: '12px', px: 3, fontWeight: 700 }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Employee Apply Holiday Dialog */}
            <Dialog
                open={applyDialog}
                onClose={() => setApplyDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    Apply for {applyingHoliday?.name}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Employee Name"
                                value={employeeInfo.full_name || ''}
                                variant="outlined"
                                disabled
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: alpha(theme.palette.action.disabledBackground, 0.05) } }}
                            />
                            <TextField
                                fullWidth
                                label="Employee ID"
                                value={employeeInfo.employee_id || ''}
                                variant="outlined"
                                disabled
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: alpha(theme.palette.action.disabledBackground, 0.05) } }}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            You are applying for an optional holiday on <strong>{applyingHoliday ? new Date(applyingHoliday.date).toLocaleDateString() : ''}</strong>.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Reason (Optional)"
                            multiline
                            rows={3}
                            value={applyForm.reason}
                            onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setApplyDialog(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={confirmApply}
                        sx={{ borderRadius: '12px', px: 3, fontWeight: 700 }}
                    >
                        Confirm Application
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modern Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                PaperProps={{ sx: { borderRadius: '24px', width: '100%', maxWidth: 400, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>
                    Delete Holiday?
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Are you sure you want to delete <strong>{holidayToDelete?.name}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        sx={{ color: 'text.secondary', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={confirmDelete}
                        sx={{ borderRadius: '12px', px: 3, fontWeight: 700 }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HolidayCalendar;
