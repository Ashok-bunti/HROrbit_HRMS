import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    LinearProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Alert,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import rosterService from '../store/Rosterapi';

const ExcelUploadModal = ({ open, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [file, setFile] = useState(null);
    const [duration, setDuration] = useState('1 month');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await rosterService.uploadExcel(file, duration, startDate);
            setSuccess('Roster uploaded successfully!');
            setTimeout(() => {
                onClose();
                setSuccess('');
                setFile(null);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload roster');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
            <DialogTitle>Upload Roster Excel</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Box
                        sx={{
                            border: '2px dashed #ccc',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            cursor: 'pointer',
                            mb: 3,
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                        }}
                        onClick={() => document.getElementById('roster-file-input').click()}
                    >
                        <input
                            type="file"
                            id="roster-file-input"
                            accept=".xlsx, .xls, .csv"
                            hidden
                            onChange={handleFileChange}
                        />
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                            {file ? file.name : 'Click to select Excel file'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <FormControl fullWidth>
                            <InputLabel>Duration</InputLabel>
                            <Select
                                value={duration}
                                label="Duration"
                                onChange={(e) => setDuration(e.target.value)}
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
                        <TextField
                            label="Start Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleUpload}
                    variant="contained"
                    disabled={loading || !file}
                >
                    {loading ? 'Uploading...' : 'Upload'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExcelUploadModal;
