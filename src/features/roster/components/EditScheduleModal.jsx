import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
    Box
} from '@mui/material';
import rosterService from '../store/Rosterapi';
import useSnackbar from '../../../hooks/useSnackbar';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import MenuItem from '@mui/material/MenuItem';
import { TIME_OPTIONS } from '../utils/timeConstants';

const EditScheduleModal = ({ open, onClose, schedule, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
    const [formData, setFormData] = useState({
        date: '',
        shift_start: '',
        shift_end: '',
        is_week_off: false
    });

    useEffect(() => {
        if (schedule) {
            setFormData({
                date: schedule.date ? schedule.date.split('T')[0] : '',
                shift_start: schedule.shift_start || '',
                shift_end: schedule.shift_end || '',
                is_week_off: schedule.is_week_off || false
            });
        }
    }, [schedule]);

    const handleUpdate = async () => {
        setLoading(true);
        setError('');
        try {
            await rosterService.updateSchedule(schedule.id, formData);
            showSnackbar('Schedule updated successfully!', 'success');
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to update schedule';
            setError(errorMsg);
            showSnackbar(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this schedule entry?')) return;

        setLoading(true);
        setError('');
        try {
            await rosterService.deleteSchedule(schedule.id);
            showSnackbar('Schedule deleted successfully!', 'success');
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to delete schedule';
            setError(errorMsg);
            showSnackbar(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
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
                    <Button
                        fullWidth
                        variant={formData.is_week_off ? "contained" : "outlined"}
                        onClick={() => setFormData({ ...formData, is_week_off: !formData.is_week_off })}
                    >
                        {formData.is_week_off ? "Marked as Week Off" : "Set as Week Off"}
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
                <Button color="error" onClick={handleDelete} disabled={loading}>Delete</Button>
                <Box>
                    <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdate} disabled={loading}>Save</Button>
                </Box>
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

export default EditScheduleModal;
