import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    IconButton,
    Alert,
    CircularProgress,
    FormControlLabel,
    Switch,
    Divider,
    RadioGroup,
    Radio,
    Tooltip
} from '@mui/material';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Check, Close, Delete } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import {
    useGetAllLeavesQuery,
    useCreateLeaveMutation,
    useUpdateLeaveMutation,
    useApproveLeaveMutation,
    useRejectLeaveMutation,
    useDeleteLeaveMutation
} from '../store/leaveApi';
import { useAuth } from '../../../context/AuthContext';
import PageHeader from '../../../components/common/PageHeader';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

import { usePermissions } from '../../../hooks/usePermissions';

const Leaves = () => {
    const theme = useTheme();
    const { can, isAdmin: isUserAdmin, isHR } = usePermissions();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const { data, isLoading, error } = useGetAllLeavesQuery({});
    const [createLeave] = useCreateLeaveMutation();
    const [approveLeave] = useApproveLeaveMutation();
    const [rejectLeave] = useRejectLeaveMutation();
    const [deleteLeave, { isLoading: isDeleting }] = useDeleteLeaveMutation();

    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        leave_type: 'Sick',
        start_date: null,
        end_date: null,
        reason: '',
        is_half_day: false,
        half_day_type: 'first_half'
    });
    const [formError, setFormError] = useState('');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [leaveToDeleteId, setLeaveToDeleteId] = useState(null);
    const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [leaveToRejectId, setLeaveToRejectId] = useState(null);

    const isAdmin = isUserAdmin || isHR;

    const handleOpenDialog = () => {
        setFormData({
            leave_type: 'Sick',
            start_date: null,
            end_date: null,
            reason: '',
            is_half_day: false,
            half_day_type: 'first_half'
        });
        setFormError('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSubmit = async () => {
        if (!formData.start_date || !formData.end_date || !formData.reason) {
            setFormError('Please fill in all fields');
            return;
        }

        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setFormError('End date must be after start date');
            return;
        }

        if (formData.reason.trim().length < 5) {
            setFormError('Reason must be at least 5 characters');
            return;
        }

        try {
            await createLeave({
                ...formData,
                start_date: format(formData.start_date, 'yyyy-MM-dd'),
                end_date: format(formData.end_date, 'yyyy-MM-dd'),
                is_half_day: formData.is_half_day,
                half_day_type: formData.is_half_day ? formData.half_day_type : null
            }).unwrap();
            handleCloseDialog();
            showSnackbar('Leave request submitted successfully', 'success');
        } catch (err) {
            setFormError(err.data?.error || 'Failed to create leave request');
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveLeave(id).unwrap();
            showSnackbar('Leave request approved successfully', 'success');
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to approve leave request', 'error');
        }
    };

    const handleRejectClick = (id) => {
        setLeaveToRejectId(id);
        setRejectionReason('');
        setRejectionDialogOpen(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            showSnackbar('Please enter a rejection reason', 'error');
            return;
        }

        try {
            await rejectLeave({ id: leaveToRejectId, reason: rejectionReason }).unwrap();
            setRejectionDialogOpen(false);
            setLeaveToRejectId(null);
            setRejectionReason('');
            showSnackbar('Leave request rejected', 'info');
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to reject leave request', 'error');
        }
    };

    const handleDeleteClick = (id) => {
        setLeaveToDeleteId(id);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (leaveToDeleteId) {
            try {
                await deleteLeave(leaveToDeleteId).unwrap();
                setConfirmDeleteOpen(false);
                setLeaveToDeleteId(null);
                showSnackbar('Leave request deleted successfully', 'success');
            } catch (err) {
                showSnackbar(err.data?.error || 'Failed to delete leave request', 'error');
            }
        }
    };

    const columns = [
        {
            field: 'employee_name',
            headerName: 'EMPLOYEE',
            flex: 1,
            minWidth: 200,
            align: 'left',
            headerAlign: 'left',
            hide: !isAdmin,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                        {params.value || '- -'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'leave_type',
            headerName: 'LEAVE TYPE',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'start_date',
            headerName: 'START DATE',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const dateStr = params.value ? format(new Date(params.value), 'dd MMM, yyyy') : '- -';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {dateStr}
                    </Box>
                );
            }
        },
        {
            field: 'end_date',
            headerName: 'END DATE',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const dateStr = params.value ? format(new Date(params.value), 'dd MMM, yyyy') : '- -';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {dateStr}
                    </Box>
                );
            }
        },
        {
            field: 'total_days',
            headerName: 'DAYS',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {params.value ?? '- -'}
                </Box>
            )
        },
        {
            field: 'reason',
            headerName: 'LEAVE REASON',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'rejection_reason',
            headerName: 'REJECTION REMARK',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: params.value ? 'error.main' : 'text.disabled',
                            fontStyle: params.value ? 'italic' : 'normal',
                            fontSize: '0.825rem'
                        }}
                    >
                        {params.value || (params.row.status === 'Rejected' ? 'No remark' : '- -')}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                let color = 'default';
                if (params.value === 'Approved') color = 'success';
                if (params.value === 'Rejected') color = 'error';
                if (params.value === 'Pending') color = 'warning';

                const tooltipText = params.value === 'Rejected'
                    ? `Reason: ${params.row.rejection_reason || 'Not specified'}`
                    : params.value === 'Approved'
                        ? `Approved by: ${params.row.approver_email || 'Approver'}`
                        : 'Awaiting approval';

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Tooltip title={tooltipText} arrow placement="top">
                            <Chip
                                label={params.value || '- -'}
                                color={color}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 600, minWidth: 90 }}
                            />
                        </Tooltip>
                    </Box>
                );
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'ACTIONS',
            width: 160,
            align: 'center',
            headerAlign: 'center',
            getActions: (params) => {
                const actions = [];
                const isPending = params.row.status === 'Pending';

                if (can('leaves', 'update') && isPending) {
                    actions.push(
                        <GridActionsCellItem
                            key={`approve-${params.id}`}
                            icon={<Tooltip title="Approve"><Check fontSize="small" /></Tooltip>}
                            label="Approve"
                            onClick={() => handleApprove(params.row.id)}
                            sx={{
                                color: 'success.main',
                                border: 1,
                                borderColor: 'success.main',
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                mr: 1,
                                '&:hover': { backgroundColor: 'success.light', color: 'white' }
                            }}
                        />,
                        <GridActionsCellItem
                            key={`reject-${params.id}`}
                            icon={<Tooltip title="Reject"><Close fontSize="small" /></Tooltip>}
                            label="Reject"
                            onClick={() => handleRejectClick(params.row.id)}
                            sx={{
                                color: 'error.main',
                                border: 1,
                                borderColor: 'error.main',
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                mr: 1,
                                '&:hover': { backgroundColor: 'error.light', color: 'white' }
                            }}
                        />
                    );
                }

                const isOwnLeave = params.row.user_id === user?.id;
                if (can('leaves', 'delete') && (isPending || isAdmin)) {
                    if (isOwnLeave || isAdmin) {
                        actions.push(
                            <GridActionsCellItem
                                key={`delete-${params.id}`}
                                icon={<Tooltip title="Delete"><Delete fontSize="small" /></Tooltip>}
                                label="Delete"
                                onClick={() => handleDeleteClick(params.row.id)}
                                sx={{
                                    color: 'error.main',
                                    border: 1,
                                    borderColor: 'error.main',
                                    borderRadius: '50%',
                                    width: 32,
                                    height: 32,
                                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                                }}
                            />
                        );
                    }
                }
                return actions.filter(Boolean);
            }
        }
    ];

    // Filter leaves based on search term
    const filteredLeaves = (data?.leaves || []).filter(leave =>
        leave.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.leave_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.rejection_reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Leave Management"
                subtitle="View and manage employee leave requests."
                action={
                    can('leaves', 'create') && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleOpenDialog}
                            sx={{ borderRadius: 2 }}
                        >
                            Apply Leave
                        </Button>
                    )
                }
            />

            <Card sx={{ overflow: 'hidden', boxShadow: theme.shadows[2], borderRadius: 2 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        placeholder="Search leaves..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ minWidth: 300 }}
                    />
                </Box>
                <Box sx={{
                    height: 650,
                    width: '100%',
                    '& .MuiDataGrid-root': {
                        border: 'none',
                        '& .MuiDataGrid-main': {
                            borderRadius: 2
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            fontSize: '0.875rem',
                            '&:focus': {
                                outline: 'none'
                            },
                            '&:focus-within': {
                                outline: 'none'
                            }
                        },
                        '& .MuiDataGrid-columnHeader': {
                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                            color: 'text.secondary',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            '&:focus': {
                                outline: 'none'
                            },
                            '&:focus-within': {
                                outline: 'none'
                            }
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: (theme) => theme.palette.action.hover,
                        },
                        '& .MuiDataGrid-columnSeparator': {
                            display: 'none'
                        },
                        // Custom Scrollbar
                        '& ::-webkit-scrollbar': {
                            width: 8,
                            height: 8,
                        },
                        '& ::-webkit-scrollbar-track': {
                            backgroundColor: 'transparent',
                        },
                        '& ::-webkit-scrollbar-thumb': {
                            backgroundColor: (theme) => theme.palette.divider,
                            borderRadius: 4,
                            '&:hover': {
                                backgroundColor: (theme) => theme.palette.text.disabled,
                            },
                        },
                    }
                }}>
                    <DataGrid
                        rows={filteredLeaves}
                        columns={columns}
                        loading={isLoading}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 },
                            },
                        }}
                        disableRowSelectionOnClick
                        density="compact"
                        rowHeight={52}
                        columnHeaderHeight={48}
                    />
                </Box>
            </Card>


            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth >
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

                        <TextField
                            select
                            fullWidth
                            label="Leave Type"
                            value={formData.leave_type}
                            onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                            sx={{ mb: 2 }}
                        >
                            {['Sick', 'Casual', 'Earned', 'Maternity', 'Paternity', 'Unpaid'].map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type} Leave
                                </MenuItem>
                            ))}
                        </TextField>

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <DatePicker
                                        label="Start Date"
                                        value={formData.start_date}
                                        onChange={(newValue) => setFormData({ ...formData, start_date: newValue })}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <DatePicker
                                        label="End Date"
                                        value={formData.end_date}
                                        onChange={(newValue) => setFormData({ ...formData, end_date: newValue })}
                                        slotProps={{ textField: { fullWidth: true } }}
                                        disabled={formData.is_half_day}
                                    />
                                </Grid>
                            </Grid>
                        </LocalizationProvider>

                        {/* Half Day Toggle */}
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.is_half_day}
                                    onChange={(e) => {
                                        const isHalfDay = e.target.checked;
                                        setFormData({
                                            ...formData,
                                            is_half_day: isHalfDay,
                                            // If half day is selected, set end_date same as start_date
                                            end_date: isHalfDay ? formData.start_date : formData.end_date
                                        });
                                    }}
                                    color="primary"
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="medium">Half Day Leave</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Request only half a day off
                                    </Typography>
                                </Box>
                            }
                            sx={{ mb: formData.is_half_day ? 1 : 2, display: 'flex' }}
                        />

                        {/* First Half / Second Half Selection */}
                        {formData.is_half_day && (
                            <Box sx={{
                                ml: 4,
                                mb: 2,
                                p: 2,
                                bgcolor: 'action.hover',
                                borderRadius: 2
                            }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Select half of the day
                                </Typography>
                                <RadioGroup
                                    row
                                    value={formData.half_day_type}
                                    onChange={(e) => setFormData({ ...formData, half_day_type: e.target.value })}
                                >
                                    <FormControlLabel
                                        value="first_half"
                                        control={<Radio size="small" />}
                                        label={
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">First Half</Typography>
                                                <Typography variant="caption" color="text.secondary">Morning session</Typography>
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        value="second_half"
                                        control={<Radio size="small" />}
                                        label={
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">Second Half</Typography>
                                                <Typography variant="caption" color="text.secondary">Afternoon session</Typography>
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </Box>
                        )}

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Reason"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog} variant="outlined" color="error">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 2 }}>Apply</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Reject Leave Request</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Please provide a reason for rejecting this leave request.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Rejection Reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason here..."
                        autoFocus
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setRejectionDialogOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmReject}
                        variant="contained"
                        color="error"
                        disabled={!rejectionReason.trim()}
                    >
                        Reject Request
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Leave Request"
                message="Are you sure you want to delete this leave request? This action cannot be undone."
                loading={isDeleting}
            />

            <CustomSnackbar
                open={snackbar.open}
                onClose={hideSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Box>
    );
};

export default Leaves;
