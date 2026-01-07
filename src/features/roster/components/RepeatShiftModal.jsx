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
    FormControl,
    InputLabel,
    Select,
    Box,
    Autocomplete,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import rosterService from '../store/Rosterapi';
import { useGetEmployeesQuery } from '../../employees/store/employeeApi';
import useSnackbar from '../../../hooks/useSnackbar';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import { TIME_OPTIONS } from '../utils/timeConstants';

const RepeatShiftModal = ({ open, onClose, onSuccess }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { data: employeesData } = useGetEmployeesQuery();
    const employees = employeesData?.employees || [];

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    const [formData, setFormData] = useState({
        employee_id: '',
        start_date: new Date().toISOString().split('T')[0],
        shift_start: '09:00AM',
        shift_end: '06:00PM',
        is_week_off: false,
        duration: '1 month'
    });

    const handleSubmit = async () => {
        if (!formData.employee_id || !formData.start_date) {
            setError('Employee ID and Start Date are required');
            showSnackbar('Employee ID and Start Date are required', 'error');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await rosterService.repeatShift(formData);
            showSnackbar('Shift repeated successfully!', 'success');
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to repeat shift';
            setError(errorMsg);
            showSnackbar(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
            <DialogTitle>Repeat Shift (Bulk Fill)</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                        <Autocomplete
                            options={employees}
                            getOptionLabel={(option) => `[${option.employee_code || option.id}] ${option.first_name} ${option.last_name}`}
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
                                setFormData({ ...formData, employee_id: newValue ? newValue.id : '' });
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
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField
                                fullWidth
                                label="Start Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <FormControl fullWidth>
                                <InputLabel>Duration</InputLabel>
                                <Select
                                    value={formData.duration}
                                    label="Duration"
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: { maxHeight: 300 }
                                        }
                                    }}
                                >
                                    <MenuItem value="1 week">1 Week</MenuItem>
                                    <MenuItem value="1 month">1 Month</MenuItem>
                                    <MenuItem value="3 months">3 Months</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField
                                select
                                fullWidth
                                label="Shift Start"
                                value={formData.shift_start}
                                onChange={(e) => setFormData({ ...formData, shift_start: e.target.value })}
                                disabled={formData.is_week_off}
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
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField
                                select
                                fullWidth
                                label="Shift End"
                                value={formData.shift_end}
                                onChange={(e) => setFormData({ ...formData, shift_end: e.target.value })}
                                disabled={formData.is_week_off}
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
                    </Box>
                    <Box>
                        <Button
                            fullWidth
                            variant={formData.is_week_off ? "contained" : "outlined"}
                            onClick={() => setFormData({ ...formData, is_week_off: !formData.is_week_off })}
                        >
                            {formData.is_week_off ? "Marked as Week Off" : "Set as Week Off"}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Processing...' : 'Apply Repeat Shift'}
                </Button>
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

export default RepeatShiftModal;
