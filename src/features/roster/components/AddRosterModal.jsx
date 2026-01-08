import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    Box,
    Typography,
    IconButton,
    Autocomplete,
    Alert,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import rosterService from '../store/Rosterapi';
import { useGetEmployeesQuery } from '../../employees/store/employeeApi';
import useSnackbar from '../../../hooks/useSnackbar';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import { TIME_OPTIONS, isEndTimeValid } from '../utils/timeConstants';

const AddRosterModal = ({ open, onClose, onSuccess, initialData }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { data: employeesData } = useGetEmployeesQuery();
    const employees = employeesData?.employees || [];

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    const [formData, setFormData] = useState({
        employee_id: '',
        name: '',
        pseudo_name: '',
        department: '',
        schedules: [
            { day: 'Monday', date: '', shift_start: '09:00AM', shift_end: '06:00PM', is_week_off: false }
        ]
    });

    useEffect(() => {
        if (open && initialData) {
            const selectedEmp = initialData.employee_id ? employees.find(e => e.id === initialData.employee_id) : null;
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const initialDate = initialData.date || '';
            const initialDay = initialDate ? days[new Date(initialDate).getDay()] : 'Monday';

            setFormData({
                employee_id: initialData.employee_id || '',
                name: selectedEmp ? `${selectedEmp.first_name} ${selectedEmp.last_name}` : '',
                pseudo_name: selectedEmp ? selectedEmp.pseudo_name || '' : '',
                department: selectedEmp ? (selectedEmp.department_name || selectedEmp.departments?.name || '') : '',
                schedules: [
                    {
                        day: initialDay,
                        date: initialDate,
                        shift_start: '09:00AM',
                        shift_end: '06:00PM',
                        is_week_off: false
                    }
                ]
            });
        } else if (open) {
            // Reset for fresh modal
            setFormData({
                employee_id: '',
                name: '',
                pseudo_name: '',
                department: '',
                schedules: [
                    { day: 'Monday', date: '', shift_start: '09:00AM', shift_end: '06:00PM', is_week_off: false }
                ]
            });
        }
    }, [open, initialData, employees]);

    const handleAddSchedule = () => {
        setFormData({
            ...formData,
            schedules: [
                ...formData.schedules,
                { day: 'Monday', date: '', shift_start: '09:00AM', shift_end: '06:00PM', is_week_off: false }
            ]
        });
    };

    const handleRemoveSchedule = (index) => {
        const newSchedules = formData.schedules.filter((_, i) => i !== index);
        setFormData({ ...formData, schedules: newSchedules });
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedules = [...formData.schedules];
        newSchedules[index][field] = value;

        // Auto-update day based on date
        if (field === 'date' && value) {
            // Use UTC to avoid timezone shifts for the day calculation
            const date = new Date(value);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            newSchedules[index].day = days[date.getDay()];
        }

        setFormData({ ...formData, schedules: newSchedules });
    };

    const handleSubmit = async () => {
        if (!formData.employee_id || !formData.name) {
            setError('Employee ID and Name are required');
            showSnackbar('Employee ID and Name are required', 'error');
            return;
        }

        // Validate all schedules
        const invalidSchedule = formData.schedules.find(s => !s.is_week_off && !isEndTimeValid(s.shift_start, s.shift_end));
        if (invalidSchedule) {
            setError('End time must be after start time for all schedules');
            showSnackbar('End time must be after start time for all schedules', 'error');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await rosterService.createRoster(formData);
            showSnackbar('Roster created successfully!', 'success');
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to create roster';
            setError(errorMsg);
            showSnackbar(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth fullScreen={isMobile}>
            <DialogTitle>Add New Roster</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Typography variant="h6" gutterBottom>Employee Information</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: '200px' }}>
                        <Autocomplete
                            options={employees}
                            getOptionLabel={(option) => `[${option.employee_code || option.id}] ${option.first_name} ${option.last_name}`}
                            value={employees.find(e => e.id === formData.employee_id) || null}
                            renderOption={(props, option) => (
                                <Box
                                    component="li"
                                    {...props}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        py: 1.5,
                                        px: 2,
                                        borderBottom: '1.5px dotted',
                                        borderColor: 'divider',
                                        '&:last-child': {
                                            borderBottom: 'none'
                                        }
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {`${option.first_name} ${option.last_name}`}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ID: {option.employee_code || option.id}
                                    </Typography>
                                </Box>
                            )}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setFormData({
                                        ...formData,
                                        employee_id: newValue.id,
                                        name: `${newValue.first_name} ${newValue.last_name}`,
                                        department: newValue.department_name || newValue.departments?.name || ''
                                    });
                                } else {
                                    setFormData({
                                        ...formData,
                                        employee_id: '',
                                        name: '',
                                        department: ''
                                    });
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Employee"
                                    fullWidth
                                />
                            )}
                        />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '200px' }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            disabled
                        />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '200px' }}>
                        <TextField
                            fullWidth
                            label="Department"
                            value={formData.department}
                            disabled
                        />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Schedules</Typography>
                    <Button startIcon={<AddIcon />} onClick={handleAddSchedule}>Add Day</Button>
                </Box>

                {formData.schedules.map((schedule, index) => (
                    <Box
                        key={index}
                        sx={{
                            p: 2,
                            mb: 2,
                            bgcolor: 'primary.light',
                            backgroundOpacity: 0.1, // Added for clarity, though MUI handles light well
                            border: '1.5px dotted',
                            borderColor: 'primary.main',
                            borderRadius: 2,
                            // Ensure light background doesn't clash with text
                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)'
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 20%' } }}>
                                <TextField
                                    fullWidth
                                    label="Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={schedule.date}
                                    onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                                />
                            </Box>
                            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 15%' } }}>
                                <TextField
                                    fullWidth
                                    label="Day"
                                    value={schedule.day}
                                    disabled
                                />
                            </Box>
                            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 20%' } }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Start Time"
                                    value={schedule.shift_start}
                                    onChange={(e) => handleScheduleChange(index, 'shift_start', e.target.value)}
                                    disabled={schedule.is_week_off}
                                    SelectProps={{
                                        MenuProps: {
                                            PaperProps: {
                                                sx: { maxHeight: 300 }
                                            }
                                        }
                                    }}
                                >
                                    {TIME_OPTIONS.map((time) => (
                                        <MenuItem key={time} value={time}>{time}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 20%' } }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="End Time"
                                    value={schedule.shift_end}
                                    onChange={(e) => handleScheduleChange(index, 'shift_end', e.target.value)}
                                    disabled={schedule.is_week_off}
                                    error={!schedule.is_week_off && !isEndTimeValid(schedule.shift_start, schedule.shift_end)}
                                    helperText={!schedule.is_week_off && !isEndTimeValid(schedule.shift_start, schedule.shift_end) ? "After Start" : ""}
                                    SelectProps={{
                                        MenuProps: {
                                            PaperProps: {
                                                sx: { maxHeight: 300 }
                                            }
                                        }
                                    }}
                                >
                                    {TIME_OPTIONS.map((time) => (
                                        <MenuItem key={time} value={time}>{time}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                            <Box sx={{ flex: '0 0 auto' }}>
                                <Button
                                    color={schedule.is_week_off ? "primary" : "inherit"}
                                    variant={schedule.is_week_off ? "contained" : "outlined"}
                                    onClick={() => handleScheduleChange(index, 'is_week_off', !schedule.is_week_off)}
                                    size="small"
                                >
                                    Off
                                </Button>
                            </Box>
                            <Box sx={{ flex: '0 0 auto' }}>
                                <IconButton color="error" onClick={() => handleRemoveSchedule(index)} disabled={formData.schedules.length === 1}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} loading={loading}>Save Roster</Button>
            </DialogActions>
            <CustomSnackbar
                open={snackbar.open}
                onClose={hideSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Dialog>
    );
};

export default AddRosterModal;
