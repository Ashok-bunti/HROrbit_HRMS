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
    Paper,
    Stack,
    Grid,
    Alert,
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
import { Check, Close, Delete, Info, FactCheck, DateRange, VerifiedUser, PostAdd, History } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import {
    useGetAllLeavesQuery,
    useCreateLeaveMutation,
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
    const { data, isLoading } = useGetAllLeavesQuery({});
    const [createLeave] = useCreateLeaveMutation();
    const [approveLeave] = useApproveLeaveMutation();
    const [rejectLeave] = useRejectLeaveMutation();
    const [deleteLeave, { isLoading: isDeleting }] = useDeleteLeaveMutation();

    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
    const [activeTab, setActiveTab] = useState(0); // 0: History, 1: Apply, 2: Policies
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

            setFormData({
                leave_type: 'Sick',
                start_date: null,
                end_date: null,
                reason: '',
                is_half_day: false,
                half_day_type: 'first_half'
            });
            setFormError('');
            setActiveTab(0); // Switch to History tab after successful apply
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
                return actions;
            }
        }
    ];

    const filteredLeaves = (data?.leaves || []).filter(leave =>
        leave.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.leave_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Leave Management"
                subtitle="View and manage employee leave requests."
                action={
                    <Box
                        sx={{
                            display: 'inline-flex',
                            p: 0.6,
                            bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.05) : '#f4f6f8',
                            borderRadius: '14px',
                            border: '1px solid',
                            borderColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.1) : 'divider',
                            gap: 0.5
                        }}
                    >
                        {[
                            { label: 'History', icon: <History />, value: 0 },
                            { label: 'Apply', icon: <PostAdd />, value: 1 },
                            { label: 'Policies', icon: <FactCheck />, value: 2 }
                        ].map((item) => (
                            <Button
                                key={item.value}
                                onClick={() => setActiveTab(item.value)}
                                startIcon={React.cloneElement(item.icon, { sx: { fontSize: 18 } })}
                                size="small"
                                sx={{
                                    borderRadius: '10px',
                                    px: 2.5,
                                    py: 0.8,
                                    textTransform: 'none',
                                    fontWeight: activeTab === item.value ? 700 : 600,
                                    fontSize: '0.85rem',
                                    color: activeTab === item.value ? 'primary.main' : 'text.secondary',
                                    bgcolor: activeTab === item.value ? 'background.paper' : 'transparent',
                                    boxShadow: activeTab === item.value ? '0px 4px 10px rgba(0,0,0,0.06)' : 'none',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        bgcolor: activeTab === item.value ? 'background.paper' : alpha(theme.palette.primary.main, 0.05),
                                        transform: activeTab === item.value ? 'none' : 'translateY(-1px)'
                                    },
                                    '& .MuiButton-startIcon': {
                                        mr: 1,
                                        color: activeTab === item.value ? 'primary.main' : 'text.disabled',
                                        transition: 'color 0.25s'
                                    }
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>
                }
            />

            <Box sx={{ mt: 3 }}>
                {activeTab === 0 ? (
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
                            height: 565,
                            width: '100%',
                            '& .MuiDataGrid-root': {
                                border: 'none',
                                '& .MuiDataGrid-main': {
                                    borderRadius: 0
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
                                    pagination: { paginationModel: { page: 0, pageSize: 10 } },
                                }}
                                disableRowSelectionOnClick
                                density="compact"
                                rowHeight={52}
                                columnHeaderHeight={48}
                            />
                        </Box>
                    </Card>
                ) : activeTab === 1 ? (
                    <Grid container justifyContent="center">
                        <Grid item xs={12} md={8} lg={6}>
                            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                    <Typography variant="h6" fontWeight={700}>Submit Leave Request</Typography>
                                    <Typography variant="body2" color="text.secondary">Enter your leave details specifically to tenure rules.</Typography>
                                </Box>
                                <Box sx={{ p: 2.5 }}>
                                    {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}

                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>Leave Type</Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        value={formData.leave_type}
                                        onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                        sx={{ mb: 2 }}
                                    >
                                        {['Sick', 'Casual', 'Earned', 'Maternity', 'Paternity', 'Unpaid'].map((type) => (
                                            <MenuItem key={type} value={type}>{type} Leave</MenuItem>
                                        ))}
                                    </TextField>

                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>Duration</Typography>
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

                                    <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.info.main, 0.02) }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.is_half_day}
                                                    onChange={(e) => {
                                                        const isHalfDay = e.target.checked;
                                                        setFormData({
                                                            ...formData,
                                                            is_half_day: isHalfDay,
                                                            end_date: isHalfDay ? formData.start_date : formData.end_date
                                                        });
                                                    }}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body2" fontWeight="600">Half Day Leave</Typography>
                                                    <Typography variant="caption" color="text.secondary">Request only one session</Typography>
                                                </Box>
                                            }
                                        />

                                        {formData.is_half_day && (
                                            <Box sx={{ mt: 2, pl: 4 }}>
                                                <RadioGroup
                                                    row
                                                    value={formData.half_day_type}
                                                    onChange={(e) => setFormData({ ...formData, half_day_type: e.target.value })}
                                                >
                                                    <FormControlLabel
                                                        value="first_half"
                                                        control={<Radio size="small" />}
                                                        label={<Typography variant="body2">First Half</Typography>}
                                                    />
                                                    <FormControlLabel
                                                        value="second_half"
                                                        control={<Radio size="small" />}
                                                        label={<Typography variant="body2">Second Half</Typography>}
                                                    />
                                                </RadioGroup>
                                            </Box>
                                        )}
                                    </Box>

                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>Reason</Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Brief explanation for leave..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        sx={{ mb: 2.5 }}
                                    />

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={handleSubmit}
                                        sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                                    >
                                        Submit Application
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                ) : (
                    <Box>



                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(4, 1fr)',
                                lg: 'repeat(4, 1fr)',
                                xl: 'repeat(4, 1fr)'
                            },
                            gap: 3
                        }}>
                            {[
                                { title: 'Earned Leave', quota: '18 Days', desc: '1.5 days accrued per month.', eligibility: 'Full', status: 'Active', icon: 'EL', color: '#ff9800' },
                                { title: 'Sick Leave', quota: '12 Days', desc: '1.0 days accrued per month.', eligibility: 'Full', status: 'Active', icon: 'SL', color: '#2196f3' },
                                { title: 'Casual Leave', quota: '10 Days', desc: 'Accrued quarterly.', eligibility: 'Full', status: 'Active', icon: 'CL', color: '#ed6c02' },
                                { title: 'Loss of Pay (LOP)', quota: 'Unlimited', desc: 'Deducted from monthly salary.', eligibility: 'Full', status: 'Always Available', icon: 'LOP', color: '#757575' }
                            ].map((policy, idx) => (
                                <Card
                                    key={idx}
                                    elevation={0}
                                    sx={{
                                        borderRadius: '32px',
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.divider, 0.1),
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 20px 50px rgba(0,0,0,0.08)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                            <Typography
                                                fontWeight={800}
                                                variant="caption"
                                                sx={{
                                                    color: policy.color,
                                                    fontSize: '1.1rem',
                                                    letterSpacing: '0.5px'
                                                }}
                                            >
                                                {policy.icon}
                                            </Typography>
                                            <Chip
                                                label={policy.status}
                                                size="small"
                                                sx={{
                                                    borderRadius: '10px',
                                                    bgcolor: alpha(policy.status === 'Active' ? '#4caf50' : '#757575', 0.08),
                                                    color: policy.status === 'Active' ? '#4caf50' : '#757575',
                                                    fontWeight: 700,
                                                    fontSize: '0.65rem',
                                                    height: 24,
                                                    border: '1px solid',
                                                    borderColor: alpha(policy.status === 'Active' ? '#4caf50' : '#757575', 0.2),
                                                    textTransform: 'uppercase'
                                                }}
                                            />
                                        </Stack>


                                        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5, fontSize: '1.05rem' }}>
                                            {policy.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem', lineHeight: 1.4 }}>
                                            {policy.desc}
                                        </Typography>

                                        <Divider sx={{ mb: 2, borderStyle: 'dotted' }} />

                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 0.3, fontSize: '0.65rem' }}>
                                                    Yearly Quota
                                                </Typography>
                                                <Typography variant="body1" fontWeight={800} sx={{ fontSize: '0.9rem' }}>
                                                    {policy.quota}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 0.3, fontSize: '0.65rem' }}>
                                                    Eligibility
                                                </Typography>
                                                <Typography variant="body1" fontWeight={800} sx={{ color: policy.color, fontSize: '0.9rem' }}>
                                                    {policy.eligibility}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>

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
                    <Button onClick={() => setRejectionDialogOpen(false)} color="inherit">Cancel</Button>
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
