import React, { useState, useEffect } from 'react';
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
    InputAdornment,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ChevronLeft,
    ChevronRight,
    EventAvailable as EventIcon,
    Search
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import { usePermissions } from '../../../hooks/usePermissions';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/store/authSlice';
import { useGetEmployeeByUserIdQuery } from '../../employees/store/employeeApi';
import {
    useGetHolidaysQuery,
    useCreateHolidayMutation,
    useUpdateHolidayMutation,
    useDeleteHolidayMutation
} from '../store/calendarApi';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // API Hooks
    const { data: holidaysData, isLoading, error } = useGetHolidaysQuery({ year: selectedYear });
    const [createHoliday] = useCreateHolidayMutation();
    const [updateHoliday] = useUpdateHolidayMutation();
    const [deleteHoliday] = useDeleteHolidayMutation();

    const holidays = holidaysData?.events || [];

    // Generate dynamic years (e.g., 5 years back and 5 years forward)
    const availableYears = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [holidayToDelete, setHolidayToDelete] = useState(null);
    const [editingHoliday, setEditingHoliday] = useState(null);

    // Form state matching backend schema
    const [holidayForm, setHolidayForm] = useState({
        title: '',
        date: '',
        leave_type: 'NATIONAL_HOLIDAY',
        description: '',
        is_holiday: true
    });



    const months = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];

    const getHolidaysForMonth = (monthIndex) => {
        return holidays.filter(h => {
            const date = new Date(h.date);
            const matchesSearch = h.title.toLowerCase().includes(searchTerm.toLowerCase());
            return date.getMonth() === monthIndex && date.getFullYear() === selectedYear && matchesSearch;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const handleOpenDialog = (holiday = null) => {
        if (holiday) {
            setEditingHoliday(holiday);
            // Convert date to YYYY-MM-DD for input
            const dateStr = new Date(holiday.date).toISOString().split('T')[0];
            setHolidayForm({
                title: holiday.title,
                date: dateStr,
                leave_type: holiday.leave_type || 'NATIONAL_HOLIDAY',
                description: holiday.description || '',
                is_holiday: holiday.is_holiday
            });
        } else {
            setEditingHoliday(null);
            setHolidayForm({
                title: '',
                date: '',
                leave_type: 'NATIONAL_HOLIDAY',
                description: '',
                is_holiday: true
            });
        }
        setOpenDialog(true);
    };

    const handleSaveHoliday = async () => {
        try {
            if (editingHoliday) {
                await updateHoliday({ id: editingHoliday.id, ...holidayForm }).unwrap();
                setSnackbar({ open: true, message: 'Holiday updated successfully', severity: 'success' });
            } else {
                await createHoliday(holidayForm).unwrap();
                setSnackbar({ open: true, message: 'Holiday created successfully', severity: 'success' });
            }
            setOpenDialog(false);
        } catch (err) {
            console.error("Failed to save holiday:", err);
            setSnackbar({ open: true, message: err?.data?.error || 'Failed to save holiday', severity: 'error' });
        }
    };

    const handleDeleteHoliday = (holiday) => {
        setHolidayToDelete(holiday);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (holidayToDelete) {
            try {
                await deleteHoliday(holidayToDelete.id).unwrap();
                setSnackbar({ open: true, message: 'Holiday deleted successfully', severity: 'success' });
                setOpenDeleteDialog(false);
                setHolidayToDelete(null);
            } catch (err) {
                console.error("Failed to delete holiday:", err);
                setSnackbar({ open: true, message: err?.data?.error || 'Failed to delete holiday', severity: 'error' });
            }
        }
    };



    const getLeaveTypeLabel = (type) => {
        switch (type) {
            case 'NATIONAL_HOLIDAY': return 'Mandatory';
            case 'RESTRICTED_HOLIDAY': return 'Optional';
            case 'FUNCTIONAL_HOLIDAY': return 'Functional';
            default: return type;
        }
    };

    const isOptional = (type) => type === 'RESTRICTED_HOLIDAY';

    const getLeaveTypeColor = (type) => {
        if (type === 'RESTRICTED_HOLIDAY') return 'warning.main';
        return 'error.main'; // Mandatory/National/Functional
    };

    // Helper function to check if a holiday date has passed
    const isHolidayPast = (holidayDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        const holiday = new Date(holidayDate);
        holiday.setHours(0, 0, 0, 0);
        return holiday < today;
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <PageHeader
                title="Company Calendar"
                subtitle="View and manage company holidays"
                action={
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                        <TextField
                            placeholder="Search holidays..."
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
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                sx={{
                                    borderRadius: '12px',
                                    bgcolor: 'background.paper',
                                    '& .MuiSelect-select': { py: 1 }
                                }}
                                MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
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

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Box sx={{ p: 4 }}>
                    <Alert severity="error">Failed to load holidays: {error.data?.error || 'Unknown error'}</Alert>
                </Box>
            ) : (
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
                                            const niceLabel = getLeaveTypeLabel(holiday.leave_type);

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

                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    color: 'text.primary',
                                                                    fontSize: '0.9rem',
                                                                    lineHeight: 1.2
                                                                }}
                                                            >
                                                                {holiday.title}
                                                            </Typography>

                                                            <Box sx={{ width: '1px', height: '14px', bgcolor: 'divider' }} />

                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: getLeaveTypeColor(holiday.leave_type),
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                {niceLabel}
                                                            </Typography>
                                                        </Box>

                                                        {holiday.description && (
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    fontSize: '0.8rem',
                                                                    lineHeight: 1.4,
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }}
                                                            >
                                                                {holiday.description}
                                                            </Typography>
                                                        )}
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>


                                                        {isAdmin && (
                                                            <Box
                                                                className="admin-actions"
                                                                sx={{
                                                                    display: 'flex',
                                                                    gap: 1,
                                                                    ml: 'auto'
                                                                }}
                                                            >
                                                                <Tooltip title={isHolidayPast(holiday.date) ? "Cannot edit past holidays" : "Edit"}>
                                                                    <span>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleOpenDialog(holiday)}
                                                                            disabled={isHolidayPast(holiday.date)}
                                                                            sx={{
                                                                                color: isHolidayPast(holiday.date) ? 'text.disabled' : 'text.secondary',
                                                                                border: '1px solid',
                                                                                borderColor: isHolidayPast(holiday.date) ? 'action.disabledBackground' : 'divider',
                                                                                p: 0.5,
                                                                                '&:hover': !isHolidayPast(holiday.date) && {
                                                                                    color: 'primary.main',
                                                                                    borderColor: theme.palette.primary.main,
                                                                                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                                                                                },
                                                                                '&.Mui-disabled': {
                                                                                    opacity: 0.5,
                                                                                    cursor: 'not-allowed'
                                                                                }
                                                                            }}
                                                                        >
                                                                            <EditIcon sx={{ fontSize: 14 }} />
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                                <Box sx={{ width: '1px', height: 16, bgcolor: 'divider', my: 'auto' }} />
                                                                <Tooltip title={isHolidayPast(holiday.date) ? "Cannot delete past holidays" : "Delete"}>
                                                                    <span>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleDeleteHoliday(holiday)}
                                                                            disabled={isHolidayPast(holiday.date)}
                                                                            sx={{
                                                                                color: isHolidayPast(holiday.date) ? 'text.disabled' : 'text.secondary',
                                                                                border: '1px solid',
                                                                                borderColor: isHolidayPast(holiday.date) ? 'action.disabledBackground' : 'divider',
                                                                                p: 0.5,
                                                                                '&:hover': !isHolidayPast(holiday.date) && {
                                                                                    color: 'error.main',
                                                                                    borderColor: theme.palette.error.main,
                                                                                    bgcolor: alpha(theme.palette.error.main, 0.05)
                                                                                },
                                                                                '&.Mui-disabled': {
                                                                                    opacity: 0.5,
                                                                                    cursor: 'not-allowed'
                                                                                }
                                                                            }}
                                                                        >
                                                                            <DeleteIcon sx={{ fontSize: 14 }} />
                                                                        </IconButton>
                                                                    </span>
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
            )}

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
                            label="Holiday Title"
                            value={holidayForm.title}
                            onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={holidayForm.description}
                            onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                            variant="outlined"
                            multiline
                            rows={2}
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
                            value={holidayForm.leave_type}
                            onChange={(e) => setHolidayForm({ ...holidayForm, leave_type: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
                        >
                            <MenuItem value="NATIONAL_HOLIDAY">National Holiday (Mandatory)</MenuItem>
                            <MenuItem value="FUNCTIONAL_HOLIDAY">Functional Holiday (Mandatory)</MenuItem>
                            <MenuItem value="RESTRICTED_HOLIDAY">Restricted Holiday (Optional)</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveHoliday}
                        disabled={!holidayForm.title || !holidayForm.date}
                        sx={{ borderRadius: '12px', px: 3, fontWeight: 700 }}
                    >
                        Save
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
                        Are you sure you want to delete <strong>{holidayToDelete?.title}</strong>? This action cannot be undone.
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
            <CustomSnackbar
                open={snackbar.open}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Box>
    );
};

export default HolidayCalendar;
