import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    useMediaQuery,
    Stack,
    alpha,
    Divider,
    InputAdornment,
    Tooltip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    Alert,
    Tab,
    Tabs,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import { DataGrid } from '@mui/x-data-grid';
import {
    PlayArrow,
    Receipt,
    Search,
    Send,
    CheckCircle,
    Cancel,
    Lock,
    LockOpen,
    Visibility,
    Edit,
    TrendingUp,
    People,
    AccountBalance,
    Assessment,
    CalendarToday,
    Info,
} from '@mui/icons-material';
import {
    useRunPayrollMutation,
    useSubmitPayrollMutation,
    useApprovePayrollMutation,
    useRejectPayrollMutation,
    useLockPayrollMutation,
    useUnlockPayrollMutation,
    useGetPayrollRunsQuery,
    useGetPayrollPreviewQuery,
} from '../store/payrollApi';
import { format } from 'date-fns';
import { usePermissions } from '../../../hooks/usePermissions';
import PageHeader from '../../../components/common/PageHeader';

const PayrollManagement = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { can } = usePermissions();
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    // API Hooks
    const { data: runsData, isLoading } = useGetPayrollRunsQuery();
    const [runPayroll, { isLoading: isRunning }] = useRunPayrollMutation();
    const [submitPayroll, { isLoading: isSubmitting }] = useSubmitPayrollMutation();
    const [approvePayroll, { isLoading: isApproving }] = useApprovePayrollMutation();
    const [rejectPayroll, { isLoading: isRejecting }] = useRejectPayrollMutation();
    const [lockPayroll, { isLoading: isLocking }] = useLockPayrollMutation();
    const [unlockPayroll, { isLoading: isUnlocking }] = useUnlockPayrollMutation();

    // State
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMMM'));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRun, setSelectedRun] = useState(null);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState(''); // 'submit', 'approve', 'reject', 'lock', 'unlock'
    const [rejectionReason, setRejectionReason] = useState('');
    const [unlockReason, setUnlockReason] = useState('');
    const [approvalLevel, setApprovalLevel] = useState('finance');
    const [comments, setComments] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    // Filter runs
    const filteredRuns = (runsData?.runs || []).filter(run =>
        (run.month && run.month.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (run.status && run.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (run.year && run.year.toString().includes(searchTerm))
    );

    // Months
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Status colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'DRAFT': return 'default';
            case 'PENDING_APPROVAL': return 'warning';
            case 'APPROVED': return 'success';
            case 'LOCKED': return 'info';
            case 'REJECTED': return 'error';
            default: return 'default';
        }
    };

    // Status steps
    const getStatusStep = (status) => {
        switch (status) {
            case 'DRAFT': return 0;
            case 'PENDING_APPROVAL': return 1;
            case 'APPROVED': return 2;
            case 'LOCKED': return 3;
            case 'REJECTED': return -1;
            default: return 0;
        }
    };

    // Handlers
    const handleRunPayroll = async () => {
        try {
            const result = await runPayroll({ month: selectedMonth, year: selectedYear }).unwrap();
            showSnackbar(`Payroll draft created successfully! Total: ₹${result.totalPayout?.toLocaleString('en-IN')}`, 'success');
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to run payroll', 'error');
        }
    };

    const handleOpenActionDialog = (run, action) => {
        setSelectedRun(run);
        setActionType(action);
        setActionDialogOpen(true);
        setRejectionReason('');
        setUnlockReason('');
        setComments('');
    };

    const handleAction = async () => {
        try {
            let result;
            switch (actionType) {
                case 'submit':
                    result = await submitPayroll(selectedRun.id).unwrap();
                    showSnackbar('Payroll submitted for approval', 'success');
                    break;
                case 'approve':
                    result = await approvePayroll({ runId: selectedRun.id, approval_level: approvalLevel, comments }).unwrap();
                    showSnackbar('Payroll approved successfully', 'success');
                    break;
                case 'reject':
                    if (!rejectionReason.trim()) {
                        showSnackbar('Rejection reason is required', 'error');
                        return;
                    }
                    result = await rejectPayroll({ runId: selectedRun.id, rejection_reason: rejectionReason }).unwrap();
                    showSnackbar('Payroll rejected', 'warning');
                    break;
                case 'lock':
                    result = await lockPayroll(selectedRun.id).unwrap();
                    showSnackbar('Payroll locked successfully', 'success');
                    break;
                case 'unlock':
                    if (!unlockReason.trim()) {
                        showSnackbar('Unlock reason is required', 'error');
                        return;
                    }
                    result = await unlockPayroll({ runId: selectedRun.id, reason: unlockReason }).unwrap();
                    showSnackbar('Payroll unlocked', 'info');
                    break;
            }
            setActionDialogOpen(false);
        } catch (err) {
            showSnackbar(err.data?.error || `Failed to ${actionType} payroll`, 'error');
        }
    };

    // DataGrid columns
    const columns = [
        {
            field: 'month',
            headerName: 'PERIOD',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                        {params.row.month} {params.row.year}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.total_employees || 0} employees
                    </Typography>
                </Box>
            )
        },
        {
            field: 'total_gross',
            headerName: 'GROSS SALARY',
            width: 160,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600}>
                    ₹{Number(params.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
            )
        },
        {
            field: 'total_payout',
            headerName: 'NET PAYOUT',
            width: 160,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700} color="success.main">
                    ₹{Number(params.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
            )
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 180,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value?.replace(/_/g, ' ') || 'UNKNOWN'}
                    color={getStatusColor(params.value)}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.65rem', minWidth: 120 }}
                />
            )
        },
        {
            field: 'created_at',
            headerName: 'CREATED',
            width: 180,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Typography variant="caption" color="text.secondary">
                    {params.value ? format(new Date(params.value), 'dd MMM, yyyy') : '-'}
                </Typography>
            )
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="View Details">
                        <IconButton
                            size="small"
                            onClick={() => {
                                setSelectedRun(params.row);
                                setPreviewDialogOpen(true);
                            }}
                            sx={{ color: 'primary.main' }}
                        >
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    {params.row.status === 'DRAFT' && can('payroll', 'manage') && (
                        <Tooltip title="Submit for Approval">
                            <IconButton
                                size="small"
                                onClick={() => handleOpenActionDialog(params.row, 'submit')}
                                sx={{ color: 'warning.main' }}
                            >
                                <Send fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {params.row.status === 'PENDING_APPROVAL' && can('payroll', 'manage') && (
                        <>
                            <Tooltip title="Approve">
                                <IconButton
                                    size="small"
                                    onClick={() => handleOpenActionDialog(params.row, 'approve')}
                                    sx={{ color: 'success.main' }}
                                >
                                    <CheckCircle fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                                <IconButton
                                    size="small"
                                    onClick={() => handleOpenActionDialog(params.row, 'reject')}
                                    sx={{ color: 'error.main' }}
                                >
                                    <Cancel fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}

                    {params.row.status === 'APPROVED' && can('payroll', 'manage') && (
                        <Tooltip title="Lock Payroll">
                            <IconButton
                                size="small"
                                onClick={() => handleOpenActionDialog(params.row, 'lock')}
                                sx={{ color: 'info.main' }}
                            >
                                <Lock fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {params.row.status === 'LOCKED' && can('payroll', 'manage') && (
                        <Tooltip title="Unlock (Admin Only)">
                            <IconButton
                                size="small"
                                onClick={() => handleOpenActionDialog(params.row, 'unlock')}
                                sx={{ color: 'warning.main' }}
                            >
                                <LockOpen fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            )
        },
    ];

    // Summary stats
    const stats = {
        totalRuns: runsData?.runs?.length || 0,
        draftRuns: runsData?.runs?.filter(r => r.status === 'DRAFT').length || 0,
        pendingRuns: runsData?.runs?.filter(r => r.status === 'PENDING_APPROVAL').length || 0,
        lockedRuns: runsData?.runs?.filter(r => r.status === 'LOCKED').length || 0,
    };

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Payroll Management"
                subtitle="Process monthly salaries with complete approval workflow and compliance tracking"
                action={
                    <TextField
                        placeholder="Search payroll runs..."
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
                }
            />

            {/* Summary Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        TOTAL RUNS
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} color="primary.main">
                                        {stats.totalRuns}
                                    </Typography>
                                </Box>
                                <Assessment sx={{ fontSize: 48, color: 'primary.main', opacity: 0.2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        DRAFT
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} color="warning.main">
                                        {stats.draftRuns}
                                    </Typography>
                                </Box>
                                <Edit sx={{ fontSize: 48, color: 'warning.main', opacity: 0.2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        PENDING APPROVAL
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} color="info.main">
                                        {stats.pendingRuns}
                                    </Typography>
                                </Box>
                                <Info sx={{ fontSize: 48, color: 'info.main', opacity: 0.2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        LOCKED
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} color="success.main">
                                        {stats.lockedRuns}
                                    </Typography>
                                </Box>
                                <Lock sx={{ fontSize: 48, color: 'success.main', opacity: 0.2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Process New Payroll */}
            {can('payroll', 'manage') && (
                <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], mb: 4 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <PlayArrow sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                            <Typography variant="h6" fontWeight={800}>
                                Process New Payroll
                            </Typography>
                        </Box>

                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                <strong>Workflow:</strong> DRAFT → PENDING APPROVAL → APPROVED → LOCKED
                            </Typography>
                        </Alert>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    label="Select Month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    fullWidth
                                    size="medium"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                        bgcolor: 'background.paper'
                                    }}
                                >
                                    {months.map((m) => (
                                        <MenuItem key={m} value={m}>{m}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    label="Financial Year"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    fullWidth
                                    size="medium"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                        bgcolor: 'background.paper'
                                    }}
                                >
                                    {[2024, 2025, 2026].map((y) => (
                                        <MenuItem key={y} value={y}>{y}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    startIcon={<PlayArrow />}
                                    onClick={handleRunPayroll}
                                    disabled={isRunning}
                                    sx={{
                                        textTransform: 'uppercase',
                                        py: 1.8,
                                        borderRadius: 2,
                                        fontWeight: 800,
                                        letterSpacing: 1,
                                        boxShadow: theme.shadows[4]
                                    }}
                                >
                                    {isRunning ? 'Processing...' : 'Create Draft'}
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Payroll Runs Table */}
            <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800}>Payroll History</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        ALL PAYROLL RUNS
                    </Typography>
                </Box>
                <CardContent sx={{ p: 0 }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{
                            height: 600,
                            width: '100%',
                            '& .MuiDataGrid-root': {
                                border: 'none',
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    fontSize: '0.875rem',
                                    '&:focus, &:focus-within': { outline: 'none' }
                                },
                                '& .MuiDataGrid-columnHeader': {
                                    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                                    color: 'text.secondary',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    '&:focus, &:focus-within': { outline: 'none' }
                                },
                            }
                        }}>
                            <DataGrid
                                rows={filteredRuns}
                                columns={columns}
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10 } },
                                }}
                                pageSizeOptions={[10, 25, 50]}
                                disableRowSelectionOnClick
                                density="comfortable"
                                rowHeight={70}
                                columnHeaderHeight={48}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Action Dialog */}
            <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {actionType === 'submit' && 'Submit Payroll for Approval'}
                    {actionType === 'approve' && 'Approve Payroll'}
                    {actionType === 'reject' && 'Reject Payroll'}
                    {actionType === 'lock' && 'Lock Payroll'}
                    {actionType === 'unlock' && 'Unlock Payroll'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {selectedRun && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>{selectedRun.month} {selectedRun.year}</strong> • {selectedRun.total_employees} employees • ₹{Number(selectedRun.total_payout || 0).toLocaleString('en-IN')}
                            </Typography>
                        </Alert>
                    )}

                    {actionType === 'approve' && (
                        <>
                            <TextField
                                select
                                label="Approval Level"
                                value={approvalLevel}
                                onChange={(e) => setApprovalLevel(e.target.value)}
                                fullWidth
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="manager">Manager</MenuItem>
                                <MenuItem value="finance">Finance</MenuItem>
                                <MenuItem value="hr_head">HR Head</MenuItem>
                            </TextField>
                            <TextField
                                label="Comments (Optional)"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
                            />
                        </>
                    )}

                    {actionType === 'reject' && (
                        <TextField
                            label="Rejection Reason *"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                            required
                            error={!rejectionReason.trim()}
                            helperText={!rejectionReason.trim() ? 'Rejection reason is required' : ''}
                        />
                    )}

                    {actionType === 'unlock' && (
                        <TextField
                            label="Unlock Reason *"
                            value={unlockReason}
                            onChange={(e) => setUnlockReason(e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                            required
                            error={!unlockReason.trim()}
                            helperText={!unlockReason.trim() ? 'Unlock reason is required' : ''}
                        />
                    )}

                    {actionType === 'submit' && (
                        <Typography variant="body2" color="text.secondary">
                            This will submit the payroll for approval. The status will change to <strong>PENDING_APPROVAL</strong>.
                        </Typography>
                    )}

                    {actionType === 'lock' && (
                        <Alert severity="warning">
                            <Typography variant="body2">
                                <strong>Warning:</strong> Once locked, the payroll cannot be modified without admin unlock.
                            </Typography>
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setActionDialogOpen(false)} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAction}
                        variant="contained"
                        color={actionType === 'reject' ? 'error' : 'primary'}
                        disabled={isSubmitting || isApproving || isRejecting || isLocking || isUnlocking}
                        sx={{ textTransform: 'none' }}
                    >
                        {actionType === 'submit' && 'Submit'}
                        {actionType === 'approve' && 'Approve'}
                        {actionType === 'reject' && 'Reject'}
                        {actionType === 'lock' && 'Lock'}
                        {actionType === 'unlock' && 'Unlock'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Preview Dialog */}
            <PreviewDialog
                open={previewDialogOpen}
                onClose={() => setPreviewDialogOpen(false)}
                run={selectedRun}
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

// Preview Dialog Component
const PreviewDialog = ({ open, onClose, run }) => {
    const theme = useTheme();
    const { data: previewData, isLoading } = useGetPayrollPreviewQuery(run?.id, {
        skip: !run?.id || !open,
    });

    if (!run) return null;

    const activeStep = getStatusStep(run.status);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800}>
                        Payroll Details
                    </Typography>
                    <Chip
                        label={run.status?.replace(/_/g, ' ')}
                        color={getStatusColor(run.status)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                    />
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {/* Workflow Stepper */}
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    <Step>
                        <StepLabel>Draft</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Pending Approval</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Approved</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Locked</StepLabel>
                    </Step>
                </Stepper>

                {/* Summary */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                PERIOD
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="primary.main">
                                {run.month} {run.year}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                EMPLOYEES
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="info.main">
                                {run.total_employees || 0}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                GROSS SALARY
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="warning.main">
                                ₹{Number(run.total_gross || 0).toLocaleString('en-IN')}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                NET PAYOUT
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="success.main">
                                ₹{Number(run.total_payout || 0).toLocaleString('en-IN')}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Payslips Preview */}
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : previewData?.payrollRun?.payslips?.length > 0 ? (
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                            Employee Payslips ({previewData.payrollRun.payslips.length})
                        </Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Employee</strong></TableCell>
                                        <TableCell align="right"><strong>Gross</strong></TableCell>
                                        <TableCell align="right"><strong>Deductions</strong></TableCell>
                                        <TableCell align="right"><strong>Net</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {previewData.payrollRun.payslips.map((payslip) => (
                                        <TableRow key={payslip.id}>
                                            <TableCell>
                                                {payslip.employees?.first_name} {payslip.employees?.last_name}
                                            </TableCell>
                                            <TableCell align="right">
                                                ₹{Number(payslip.gross_salary || 0).toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell align="right">
                                                ₹{Number(payslip.total_deductions || 0).toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell align="right">
                                                <strong>₹{Number(payslip.net_salary || 0).toLocaleString('en-IN')}</strong>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ) : null}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="contained">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

// Helper function
const getStatusColor = (status) => {
    switch (status) {
        case 'DRAFT': return 'default';
        case 'PENDING_APPROVAL': return 'warning';
        case 'APPROVED': return 'success';
        case 'LOCKED': return 'info';
        case 'REJECTED': return 'error';
        default: return 'default';
    }
};

const getStatusStep = (status) => {
    switch (status) {
        case 'DRAFT': return 0;
        case 'PENDING_APPROVAL': return 1;
        case 'APPROVED': return 2;
        case 'LOCKED': return 3;
        case 'REJECTED': return -1;
        default: return 0;
    }
};

export default PayrollManagement;
