import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    alpha
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const ConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    loading = false
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    width: '100%',
                    maxWidth: 400
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Box
                    sx={{
                        display: 'flex',
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                        color: 'error.main'
                    }}
                >
                    <WarningAmberRoundedIcon />
                </Box>
                <Typography variant="h6" fontWeight="bold">
                    {title}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Typography color="text.secondary">
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    color="inherit"
                    disabled={loading}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={loading}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                >
                    {loading ? "Deleting..." : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
