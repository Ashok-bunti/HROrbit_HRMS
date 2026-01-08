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
    Tooltip,
    IconButton,
    InputAdornment
} from '@mui/material';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Check, Close, Delete, Info, FactCheck, DateRange, VerifiedUser, PostAdd, History, RemoveCircle, Search } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInHours } from 'date-fns';
import {
    useGetMyLeavesQuery,
    useGetPendingLeavesQuery,
    useGetAvailableLeaveTypesQuery,
    useGetMyManagerQuery,
    useGetHRManagerEmailsQuery,
    useGetApproversQuery,
    useGetMyBalancesQuery,
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

    // Data Query Hooks
    // Data Query Hooks
    const { data: myLeavesData, isLoading: isLoadingMyLeaves } = useGetMyLeavesQuery({ userId: user?.id });
    const { data: pendingLeavesData, isLoading: isLoadingPendingLeaves } = useGetPendingLeavesQuery({ userId: user?.id }, { skip: !can('leaves', 'update') });
    const { data: leaveTypesData } = useGetAvailableLeaveTypesQuery({ userId: user?.id });
    const { data: managerData, isLoading: isLoadingManager } = useGetMyManagerQuery();
    const { data: approversData, isLoading: isLoadingApprovers } = useGetApproversQuery();
    const { data: hrEmailsData } = useGetHRManagerEmailsQuery();
    const { data: balancesData } = useGetMyBalancesQuery({ userId: user?.id, year: new Date().getFullYear() });
    // New: fetch all leaves for manager approvals view
    // Use pending leaves for manager approvals instead of filtering all leaves
    const managerApprovals = pendingLeavesData?.leaves || [];

    // Mutations
    const [createLeave] = useCreateLeaveMutation();
    const [approveLeave] = useApproveLeaveMutation();
    const [rejectLeave] = useRejectLeaveMutation();
    const [deleteLeave, { isLoading: isDeleting }] = useDeleteLeaveMutation();

    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
    const [activeTab, setActiveTab] = useState(0); // 0: History, 1: Apply, 2: Policies
    const [formData, setFormData] = useState({
        leave_type: '',
        start_date: null,
        end_date: null,
        reason: '',
        is_half_day: false,
        half_day_type: 'FIRST_HALF',
        applied_to: '',
        cc_emails: []
    });

    // Auto-populate manager if found, but don't overwrite if user manually selected (unless empty)
    React.useEffect(() => {
        if (managerData?.manager?.id && !formData.applied_to) {
            setFormData(prev => ({ ...prev, applied_to: managerData.manager.id }));
        }
    }, [managerData]);
    const [formError, setFormError] = useState('');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [leaveToDeleteId, setLeaveToDeleteId] = useState(null);
    const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [leaveToRejectId, setLeaveToRejectId] = useState(null);
    const [historyYear, setHistoryYear] = useState(new Date().getFullYear());
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);

    const isAdmin = isUserAdmin || isHR;

    const handleSubmit = async () => {
        if (formData.is_half_day && formData.start_date) {
            // Auto-fill end_date for half day to pass validation
            // We'll update the state or just use a local object for validation
            // Better to update formData before check, but react state is async.
            // Let's create a submission object.
        }

        const submissionData = {
            ...formData,
            end_date: formData.is_half_day ? formData.start_date : formData.end_date
        };

        if (!submissionData.leave_type || !submissionData.start_date || !submissionData.end_date || !submissionData.reason) {
            setFormError('Please fill in all required fields');
            return;
        }

        if (!formData.applied_to) {
            setFormError('Reporting Manager is not assigned. Please contact HR.');
            return;
        }

        if (new Date(submissionData.end_date) < new Date(submissionData.start_date)) {
            setFormError('End date must be after start date');
            return;
        }

        // Sick Leave Validation: Cannot apply for future dates
        if (submissionData.leave_type === 'SL') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const start = new Date(submissionData.start_date);
            start.setHours(0, 0, 0, 0);

            if (start > today) {
                setFormError('Sick Leave cannot be applied in advance (only today or past dates).');
                return;
            }
        }

        // Calculate days locally to check balance
        const start = new Date(submissionData.start_date);
        const end = new Date(submissionData.end_date);
        // Reset time to ensure accurate day diff
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(end - start);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Find selected leave type balance
        const selectedLeave = (leaveTypesData?.leave_types || []).find(
            t => t.leave_type.toUpperCase() === submissionData.leave_type.toUpperCase()
        );

        if (selectedLeave) {
            // Logic: Calculate Available Dynamically (same as Balances tab)
            let allocated = parseFloat(selectedLeave.allocated || 0);
            const policy = selectedLeave.policy_config || {};
            if (allocated === 0 && policy) {
                if (policy.credit_timing === 'annual') allocated = parseFloat(policy.yearly_quota || 0);
                else if (policy.credit_timing === 'monthly') allocated = parseFloat(policy.monthly_accrual_rate || 0) * 12;
                else if (policy.number_of_days) allocated = parseFloat(policy.number_of_days || 0);
                else if (policy.max_days) allocated = parseFloat(policy.max_days || 0);
            }
            const used = parseFloat(selectedLeave.used || 0);
            const pending = parseFloat(selectedLeave.pending || 0);
            let available = parseFloat(selectedLeave.available_balance || 0);

            if (parseFloat(selectedLeave.allocated || 0) === 0 && allocated > 0) {
                available = Math.max(0, allocated - used - pending);
            }

            const requestDays = submissionData.is_half_day ? 0.5 : totalDays;

            if (requestDays > available) {
                setFormError(`Insufficient balance. You have ${available} days available, but are applying for ${requestDays} days.`);
                return;
            }
        }

        try {
            const managerId = parseInt(formData.applied_to, 10);
            if (!managerId || isNaN(managerId)) {
                setFormError('Reporting Manager ID is invalid. Please refresh or contact HR.');
                return;
            }

            await createLeave({
                ...submissionData,
                leave_type: submissionData.leave_type.toUpperCase(), // Force uppercase for backend alignment
                applied_to: managerId,
                start_date: format(submissionData.start_date, 'yyyy-MM-dd'),
                end_date: format(submissionData.end_date, 'yyyy-MM-dd'),
                is_half_day: submissionData.is_half_day,
                half_day_type: submissionData.is_half_day ? submissionData.half_day_type : null
            }).unwrap();

            setFormData({
                leave_type: '',
                start_date: null,
                end_date: null,
                reason: '',
                is_half_day: false,
                half_day_type: 'FIRST_HALF',
                applied_to: managerData?.manager?.id || '',
                cc_emails: []
            });
            setFormError('');
            // Switch to history/my leaves tab after success
            // Manager: My Leaves is index 2. Employee: History is index 2.
            setActiveTab(2);
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
                showSnackbar('Leave request withdrawn successfully', 'success');
            } catch (err) {
                showSnackbar(err.data?.error || 'Failed to withdraw leave request', 'error');
            }
        }
    };

    const handleCardClick = (leave) => {
        setSelectedLeave(leave);
        setDetailsDialogOpen(true);
    };

    // Tab Definitions
    // Strictly restrict Approvals tab to Managers, HR, Admins, or those with 'manage' permission
    const isManager = user?.role === 'manager' || isAdmin || can('leaves', 'manage');

    // Employee: Apply (0), Balances (1), History (2)
    // Manager: Apply (0), Balances (1), My Leaves (2), Approvals (3)
    const tabs = isManager
        ? [
            { label: 'Apply', icon: <PostAdd />, value: 0, data: null },
            { label: 'Balances', icon: <FactCheck />, value: 1, data: null },
            { label: 'My Leaves', icon: <History />, value: 2, data: myLeavesData?.leaves },
            { label: 'Approvals', icon: <VerifiedUser />, value: 3, data: managerApprovals }
        ]
        : [
            { label: 'Apply', icon: <PostAdd />, value: 0, data: null },
            { label: 'Balances', icon: <FactCheck />, value: 1, data: null },
            { label: 'Leave History', icon: <History />, value: 2, data: myLeavesData?.leaves }
        ];

    const currentTabObj = tabs.find(t => t.value === activeTab) || tabs[0];
    const isApprovalsTab = isManager && activeTab === 3;

    const columns = [
        {
            field: 'employee_name',
            headerName: 'EMPLOYEE',
            flex: 1,
            minWidth: 150,
            align: 'left',
            headerAlign: 'left',
            // Hide for Employee's history/My Leaves unless admin
            hide: !isApprovalsTab && !isAdmin,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="primary.main">
                    {params.value || '- -'}
                </Typography>
            )
        },
        {
            field: 'reason',
            headerName: 'REASON',
            flex: 1.5,
            minWidth: 180,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Tooltip title={params.value || ''} arrow placement="top-start">
                    <Typography variant="body2" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        cursor: 'default'
                    }}>
                        {params.value || '-'}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: 'leave_type',
            headerName: 'TYPE',
            flex: 1,
            minWidth: 80,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'start_date',
            headerName: 'START',
            flex: 1,
            minWidth: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => params.value ? format(new Date(params.value), 'dd MMM') : '-'
        },
        {
            field: 'end_date',
            headerName: 'END',
            flex: 1,
            minWidth: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => params.value ? format(new Date(params.value), 'dd MMM') : '-'
        },
        {
            field: 'first_half',
            headerName: 'FIRST HALF',
            flex: 1,
            minWidth: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const isFirstHalf = params.row.is_half_day && params.row.half_day_type === 'FIRST_HALF';
                return isFirstHalf ? <Check fontSize="small" color="primary" /> : '-';
            }
        },
        {
            field: 'second_half',
            headerName: 'SECOND HALF',
            flex: 1,
            minWidth: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const isSecondHalf = params.row.is_half_day && params.row.half_day_type === 'SECOND_HALF';
                return isSecondHalf ? <Check fontSize="small" color="primary" /> : '-';
            }
        },
        {
            field: 'total_days',
            headerName: 'DAYS',
            width: 80,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const status = params.value?.toUpperCase();

                const isApproved = status === 'APPROVED';
                const isRejected = status === 'REJECTED';
                const isPending = status === 'PENDING';

                const tooltipText = isRejected
                    ? `Reason: ${params.row.rejection_reason || 'Not specified'}`
                    : isApproved
                        ? `Approved by: ${params.row.approver_email || 'Approver'}`
                        : 'Awaiting approval';

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Tooltip title={tooltipText} arrow placement="top">
                            <Chip
                                label={params.value || '- -'}
                                size="small"
                                variant="outlined"
                                sx={{
                                    fontWeight: 700,
                                    minWidth: 100,
                                    height: 24,
                                    fontSize: '0.65rem',
                                    textTransform: 'uppercase',
                                    borderRadius: '6px',
                                    bgcolor: isApproved
                                        ? alpha(theme.palette.success.main, 0.1)
                                        : 'transparent',
                                    color: isApproved
                                        ? theme.palette.success.dark
                                        : isRejected
                                            ? theme.palette.error.main
                                            : theme.palette.warning.main,
                                    borderColor: isApproved
                                        ? theme.palette.success.main
                                        : isRejected
                                            ? alpha(theme.palette.error.main, 0.5)
                                            : alpha(theme.palette.warning.main, 0.5),
                                }}
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
            width: 120,
            align: 'center',
            headerAlign: 'center',
            getActions: (params) => {
                const actions = [];
                const status = params.row.status?.toUpperCase();
                const isPending = status === 'PENDING';

                // Approve/Reject only in Approvals Tab for Managers
                if (isApprovalsTab && isPending) {
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

                // Delete only in My Leaves/History for pending requests
                // OR admins. 
                // Don't show Delete in Approvals tab usually (Manager shouldn't delete employee request, only reject)
                // RULE: Cannot withdraw Sick Leave (SL)
                const isSickLeave = params.row.leave_type === 'SL';

                if (!isApprovalsTab && (isPending || isAdmin) && !isSickLeave) {
                    // RULE: Withdraw Time Limit (12 hours before start)
                    const now = new Date();
                    const startDate = new Date(params.row.start_date);
                    const hoursDiff = differenceInHours(startDate, now);
                    // If hoursDiff < 12 (meaning less than 12h remaining OR already started/past), disable withdraw
                    // Actually request says "before 12 hours of applied date employee can withdraw otherwise show message"
                    // Meaning if (StartDate - Now) < 12h, Withdraw is blocked.

                    const isWithdrawBlocked = hoursDiff < 12;

                    if (!isWithdrawBlocked) {
                        actions.push(
                            <GridActionsCellItem
                                key={`withdraw-${params.id}`}
                                icon={<Tooltip title="Withdraw"><RemoveCircle fontSize="small" /></Tooltip>}
                                label="Withdraw"
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
                    } else {
                        // Show Disabled/Info icon explaining why
                        actions.push(
                            <GridActionsCellItem
                                key={`withdraw-blocked-${params.id}`}
                                icon={
                                    <Tooltip title="Withdrawal is only allowed at least 12 hours before the leave start date.">
                                        <RemoveCircle fontSize="small" color="disabled" />
                                    </Tooltip>
                                }
                                label="Withdraw Blocked"
                                showInMenu={false}
                                sx={{
                                    color: 'text.disabled',
                                    border: 1,
                                    borderColor: 'text.disabled',
                                    borderRadius: '50%',
                                    width: 32,
                                    height: 32,
                                    opacity: 0.5,
                                    cursor: 'not-allowed'
                                }}
                            />
                        );
                    }
                }
                return actions;
            }
        }
    ].filter(col => !col.hide);


    const filteredLeaves = (currentTabObj.data || []).filter(leave =>
        (leave.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (leave.leave_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (leave.reason || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: 'text.primary' }}>
                            {!isManager ? "My Leaves" : "Leave Management"}
                        </Typography>
                        {activeTab === 2 && (
                            <>
                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'divider', height: '24px', alignSelf: 'center' }} />
                                <Typography variant="h6" fontWeight={600} color="primary.main" sx={{ fontSize: '1.1rem' }}>
                                    {historyYear}
                                </Typography>
                            </>
                        )}
                    </Box>
                }
                subtitle={!isManager
                    ? "View your leave balance, apply for leave, and track request status."
                    : "View and manage employee leave requests."
                }
                action={
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {activeTab === 2 && (
                            <TextField
                                placeholder="Search leaves..."
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: 280,
                                    bgcolor: 'background.paper',
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />
                        )}
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
                            {tabs.map((item) => (
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
                    </Box>
                }
            />

            <Box sx={{ mt: 3 }}>
                {/* Approvals Tab (3) - Table View */}
                {activeTab === 3 && (
                    <Card sx={{ overflow: 'hidden', boxShadow: theme.shadows[2], borderRadius: 3 }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <TextField
                                placeholder="Search approvals..."
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
                                loading={isLoadingPendingLeaves}
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
                )}

                {/* History / My Leaves Tab (2) - Month-wise Card View */}
                {activeTab === 2 && (
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
                            {Array.from({ length: 12 }).map((_, monthIndex) => {
                                const currentDate = new Date(historyYear, monthIndex, 1);
                                const monthName = format(currentDate, 'MMM yyyy').toUpperCase();

                                // Filter leaves for this month
                                const monthLeaves = filteredLeaves.filter(leave => {
                                    const leaveDate = new Date(leave.start_date);
                                    return leaveDate.getFullYear() === historyYear && leaveDate.getMonth() === monthIndex;
                                }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

                                const isCurrentMonth = new Date().getMonth() === monthIndex && new Date().getFullYear() === historyYear;

                                return (
                                    <Paper
                                        key={monthIndex}
                                        sx={{
                                            p: 3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            minHeight: 350,
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
                                                color: 'text.primary',
                                                letterSpacing: '0.1em',
                                                mb: 2.5,
                                                display: 'block',
                                                opacity: 0.7
                                            }}
                                        >
                                            {monthName}
                                        </Typography>

                                        <Box sx={{
                                            flex: 1,
                                            overflowY: 'auto',
                                            pr: monthLeaves.length > 0 ? 1 : 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            // Custom Scrollbar
                                            '&::-webkit-scrollbar': {
                                                width: '4px',
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                background: 'transparent',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                background: theme.palette.divider,
                                                borderRadius: '4px',
                                            },
                                            '&::-webkit-scrollbar-thumb:hover': {
                                                background: theme.palette.text.secondary,
                                            }
                                        }}>
                                            {monthLeaves.length > 0 ? (
                                                <Stack spacing={1.5}>
                                                    {monthLeaves.map(leave => {
                                                        let statusColor = 'default';
                                                        const status = leave.status?.toUpperCase();
                                                        if (status === 'APPROVED') statusColor = 'success';
                                                        else if (status === 'REJECTED') statusColor = 'error';
                                                        else if (status === 'PENDING') statusColor = 'warning';

                                                        // Determine if withdrawable
                                                        const isPending = status === 'PENDING';
                                                        const isSickLeave = leave.leave_type === 'SL';
                                                        const startDate = new Date(leave.start_date);
                                                        const hoursDiff = differenceInHours(startDate, new Date());
                                                        const isWithdrawBlocked = hoursDiff < 12;
                                                        const shouldShowWithdraw = (isPending || isAdmin) && !isSickLeave;

                                                        const day = format(startDate, 'dd');
                                                        const weekday = format(startDate, 'EEE');

                                                        return (
                                                            <Box
                                                                key={leave.id}
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
                                                                    transition: 'all 0.2s ease',
                                                                    cursor: 'pointer',
                                                                    '&:hover': {
                                                                        borderColor: theme.palette.primary.main,
                                                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                                        transform: 'scale(1.02)'
                                                                    }
                                                                }}
                                                                onClick={() => handleCardClick(leave)}
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
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{
                                                                                fontWeight: 600,
                                                                                color: 'text.primary',
                                                                                fontSize: '0.85rem'
                                                                            }}
                                                                            noWrap
                                                                        >
                                                                            {leave.leave_type}
                                                                        </Typography>
                                                                        {leave.is_half_day && (
                                                                            <Chip label="0.5" size="small" sx={{ height: 16, fontSize: '0.55rem', borderRadius: 0.5 }} />
                                                                        )}
                                                                    </Box>
                                                                    <Tooltip title={leave.reason}>
                                                                        <Typography variant="caption" sx={{
                                                                            color: 'text.secondary',
                                                                            fontSize: '0.7rem',
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: 1,
                                                                            WebkitBoxOrient: 'vertical',
                                                                            overflow: 'hidden'
                                                                        }}>
                                                                            {leave.reason}
                                                                        </Typography>
                                                                    </Tooltip>
                                                                </Box>

                                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                                                                    <Chip
                                                                        label={status === 'APPROVED' ? 'Approved' : status === 'REJECTED' ? 'Rejected' : 'Pending'}
                                                                        size="small"
                                                                        color={statusColor}
                                                                        variant="outlined"
                                                                        sx={{
                                                                            height: 20,
                                                                            fontSize: '0.65rem',
                                                                            fontWeight: 800,
                                                                            px: 0.5,
                                                                            ...(status === 'APPROVED' && {
                                                                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                                                                color: theme.palette.success.dark,
                                                                                borderColor: theme.palette.success.main
                                                                            })
                                                                        }}
                                                                    />

                                                                    {shouldShowWithdraw && (
                                                                        isWithdrawBlocked ? (
                                                                            <Tooltip title="Withdrawal blocked (< 12h)">
                                                                                <Box sx={{ p: 0.5, opacity: 0.4, cursor: 'not-allowed' }}>
                                                                                    <RemoveCircle sx={{ fontSize: 16, color: 'text.disabled' }} />
                                                                                </Box>
                                                                            </Tooltip>
                                                                        ) : (
                                                                            <Tooltip title="Withdraw Leave">
                                                                                <Box
                                                                                    component="span"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDeleteClick(leave.id);
                                                                                    }}
                                                                                    sx={{
                                                                                        cursor: 'pointer',
                                                                                        color: 'text.disabled',
                                                                                        display: 'flex',
                                                                                        p: 0.5,
                                                                                        '&:hover': { color: 'error.main' }
                                                                                    }}
                                                                                >
                                                                                    <RemoveCircle sx={{ fontSize: 16 }} />
                                                                                </Box>
                                                                            </Tooltip>
                                                                        )
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        );
                                                    })}
                                                </Stack>
                                            ) : (
                                                <Box sx={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexDirection: 'column',
                                                    opacity: 0.6
                                                }}>
                                                    <DateRange sx={{ fontSize: 32, mb: 1, color: 'text.disabled' }} />
                                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, letterSpacing: '0.05em' }}>
                                                        No Leaves
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Paper>
                                );
                            })}
                        </Box>
                    </Box>
                )}
                {/* Content Area */}
                {/* Apply Tab (0) - Vertical Compressed */}
                {activeTab === 0 && (
                    <Grid container justifyContent="center">
                        <Grid item xs={12} md={8} lg={6}>
                            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', maxWidth: 600, mx: 'auto' }}>
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight={700}>New Leave Request</Typography>
                                        <Typography variant="caption" color="text.secondary">Balances update automatically</Typography>
                                    </Box>
                                    <Button onClick={() => setActiveTab(1)} variant="outlined" size="small" sx={{ borderRadius: 2 }}>Check Balances</Button>
                                </Box>

                                <Box sx={{ p: 3 }}>
                                    {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}

                                    <Stack spacing={2.5}>
                                        <Box>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>LEAVE TYPE</Typography>
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={formData.leave_type}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, leave_type: e.target.value })
                                                }
                                                SelectProps={{
                                                    displayEmpty: true,
                                                }}
                                            >
                                                {/* Placeholder */}
                                                <MenuItem value="" disabled>
                                                    Select Leave Type
                                                </MenuItem>

                                                {(leaveTypesData?.leave_types || []).map((type) => {
                                                    // Logic: Calculate Available Dynamically (same as Balances tab)
                                                    let allocated = parseFloat(type.allocated || 0);
                                                    const policy = type.policy_config || {};
                                                    if (allocated === 0 && policy) {
                                                        if (policy.credit_timing === 'annual') allocated = parseFloat(policy.yearly_quota || 0);
                                                        else if (policy.credit_timing === 'monthly') allocated = parseFloat(policy.monthly_accrual_rate || 0) * 12;
                                                        else if (policy.number_of_days) allocated = parseFloat(policy.number_of_days || 0);
                                                        else if (policy.max_days) allocated = parseFloat(policy.max_days || 0);
                                                    }
                                                    const used = parseFloat(type.used || 0);
                                                    const pending = parseFloat(type.pending || 0);
                                                    let available = parseFloat(type.available_balance || 0);
                                                    if (parseFloat(type.allocated || 0) === 0 && allocated > 0) {
                                                        available = Math.max(0, allocated - used - pending);
                                                    }

                                                    return (
                                                        <MenuItem key={type.leave_type} value={type.leave_type}>
                                                            {type.display_name} ({available})
                                                        </MenuItem>
                                                    );
                                                })}
                                            </TextField>

                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>START DATE</Typography>
                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker
                                                        value={formData.start_date}
                                                        onChange={(newValue) => setFormData({ ...formData, start_date: newValue })}
                                                        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                                        disablePast
                                                    />
                                                </LocalizationProvider>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>END DATE</Typography>
                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker
                                                        value={formData.end_date}
                                                        onChange={(newValue) => setFormData({ ...formData, end_date: newValue })}
                                                        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                                        disabled={formData.is_half_day}
                                                        disablePast
                                                    />
                                                </LocalizationProvider>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size="small"
                                                        checked={formData.is_half_day}
                                                        onChange={(e) => {
                                                            const isHalfDay = e.target.checked;
                                                            setFormData({
                                                                ...formData,
                                                                is_half_day: isHalfDay,
                                                                end_date: isHalfDay ? formData.start_date : formData.end_date
                                                            });
                                                        }}
                                                    />
                                                }
                                                label={<Typography variant="body2" fontWeight={600}>Half Day Leave</Typography>}
                                            />

                                            {formData.is_half_day && (
                                                <Box sx={{ mt: 1, ml: 1 }}>
                                                    <RadioGroup
                                                        row
                                                        value={formData.half_day_type}
                                                        onChange={(e) => setFormData({ ...formData, half_day_type: e.target.value })}
                                                    >
                                                        <FormControlLabel value="FIRST_HALF" control={<Radio size="small" />} label={<Typography variant="caption">First Half</Typography>} />
                                                        <FormControlLabel value="SECOND_HALF" control={<Radio size="small" />} label={<Typography variant="caption">Second Half</Typography>} />
                                                    </RadioGroup>
                                                </Box>
                                            )}
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>REPORTING TO</Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={
                                                    (() => {
                                                        if (isLoadingManager || isLoadingApprovers) return "Loading...";
                                                        const clean = (val) => {
                                                            if (!val) return null;
                                                            const str = String(val).trim();
                                                            const l = str.toLowerCase();
                                                            if (l === 'undefined' || l === 'null' || l === 'undefined undefined' || l === 'null null') return null;
                                                            if (l.includes('undefined') || l.includes('null')) return null;
                                                            return str === '' ? null : str;
                                                        };

                                                        // 1. Manager Name from backend
                                                        const bName = clean(managerData?.manager?.name);
                                                        if (bName) return bName;

                                                        // 2. Approvers List Lookup
                                                        if (formData.applied_to && approversData?.approvers) {
                                                            const appr = approversData.approvers.find(a => Number(a.id) === Number(formData.applied_to));
                                                            const aName = clean(appr?.name);
                                                            if (aName) return aName;
                                                        }

                                                        // 3. Email fallback
                                                        if (managerData?.manager?.email) {
                                                            const parts = managerData.manager.email.split('@')[0].split(/[._]/);
                                                            return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
                                                        }

                                                        return "Not Assigned";
                                                    })()
                                                }
                                                InputProps={{
                                                    readOnly: true,
                                                    disabled: true
                                                }}
                                                helperText="Your Reporting Manager (Auto-assigned)"
                                            />
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>REASON</Typography>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={2}
                                                size="small"
                                                placeholder="Brief explanation..."
                                                value={formData.reason}
                                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            />
                                        </Box>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={handleSubmit}
                                            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
                                        >
                                            Submit Request
                                        </Button>
                                    </Stack>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                )}
                {/* Balances Tab (1) */}
                {/* Balances Tab (1) */}
                {activeTab === 1 && (
                    <Box>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)',
                                lg: 'repeat(4, 1fr)',
                                xl: 'repeat(4, 1fr)'
                            },
                            gap: 3
                        }}>
                            {(leaveTypesData?.leave_types || []).map((balance, idx) => {
                                // Calculate Allocated
                                let allocated = parseFloat(balance.allocated || 0);
                                const policy = balance.policy_config || {};

                                // Fallback if allocated is 0 but policy exists
                                if (allocated === 0 && policy) {
                                    if (policy.credit_timing === 'annual') {
                                        allocated = parseFloat(policy.yearly_quota || 0);
                                    } else if (policy.credit_timing === 'monthly') {
                                        // Show projected annual allocation for monthly types
                                        allocated = parseFloat(policy.monthly_accrual_rate || 0) * 12;
                                    } else if (policy.number_of_days) {
                                        // For types like Marriage Leave
                                        allocated = parseFloat(policy.number_of_days || 0);
                                    } else if (policy.max_days) {
                                        // For types like Sabbatical
                                        allocated = parseFloat(policy.max_days || 0);
                                    }
                                }

                                const used = parseFloat(balance.used || 0);
                                const pending = parseFloat(balance.pending || 0);

                                // Calculate Available - Trust Backend Primary, Fallback Logic only if allocated is 0 and we have policy
                                let available = parseFloat(balance.available_balance || 0);

                                // If backend returned 0 allocation but we calculated a local allocated (e.g. infinite monthly), adjust available
                                if (parseFloat(balance.allocated || 0) === 0 && allocated > 0) {
                                    // Only adjust if available is 0 (meaning backend didn't calculate it or it's monthly infinite)
                                    // Actually, backend available_balance should be the source of truth if possible.
                                    // Revert to simple: Available = Allocated - Used - Pending (if backend is 0)
                                    if (available === 0) {
                                        available = Math.max(0, allocated - used - pending);
                                    }
                                } else {
                                    // If backend has allocated, trust its available_balance
                                    // But user says: "2 in used, 4 remaining (available)...."
                                    // Verify: Available should be Allocated - Used - Pending
                                    // Let's force consistency for display if backend might be stale or weird
                                    const calculatedAvailable = Math.max(0, allocated - used - pending);
                                    // Use calculated if it differs significantly? No, backend logic handles gender etc.
                                    // Let's just trust backend, BUT if backend allocated was 0 and we derived one, we must derive available too.

                                    // User Issue: "2 used, 4 remaining... should display available 2?? No, 4 remaining should be available" -> Correct.
                                    // User Issue: "2 should display in used 0 pending" -> Correct.
                                    // "show upcoming leave based on applied leave" -> This is a separate fix in upcoming_leave logic if needed.
                                }

                                return (
                                    <Paper
                                        key={idx}
                                        sx={{
                                            p: 3,
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
                                        {/* Header: Name (Left) + Available/Allocated Table (Right) */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, gap: 2 }}>
                                            {/* Leave Type Name */}
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: '1.1rem',
                                                    color: 'text.primary',
                                                    letterSpacing: '-0.02em',
                                                    flex: 1
                                                }}
                                            >
                                                {balance.display_name}
                                            </Typography>

                                            {/* Available / Allocated Bordered Table */}
                                            <Box sx={{
                                                border: '1px solid',
                                                borderColor: alpha(theme.palette.divider, 0.5),
                                                borderRadius: 1,
                                                overflow: 'hidden'
                                            }}>
                                                {/* Available Row */}
                                                <Box sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '75px 55px',
                                                    borderBottom: '1px solid',
                                                    borderColor: alpha(theme.palette.divider, 0.5)
                                                }}>
                                                    <Box sx={{
                                                        p: 0.75,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                        borderRight: '1px solid',
                                                        borderColor: alpha(theme.palette.divider, 0.5)
                                                    }}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: 'text.secondary',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.03em'
                                                            }}
                                                        >
                                                            Available
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ p: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 800,
                                                                color: 'primary.main',
                                                                lineHeight: 1,
                                                                fontSize: '1.1rem'
                                                            }}
                                                        >
                                                            {available}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Allocated Row */}
                                                <Box sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '75px 55px'
                                                }}>
                                                    <Box sx={{
                                                        p: 0.75,
                                                        bgcolor: alpha(theme.palette.grey[500], 0.04),
                                                        borderRight: '1px solid',
                                                        borderColor: alpha(theme.palette.divider, 0.5)
                                                    }}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: 'text.secondary',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.03em'
                                                            }}
                                                        >
                                                            Allocated
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ p: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: 'text.secondary',
                                                                lineHeight: 1,
                                                                fontSize: '0.95rem'
                                                            }}
                                                        >
                                                            {allocated}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ mb: 1.5, borderStyle: 'dashed', borderColor: alpha(theme.palette.divider, 0.4) }} />

                                        {/* Stats Grid */}
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            rowGap: 1.25,
                                            columnGap: 2
                                        }}>
                                            {/* Used */}
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'text.disabled',
                                                        fontSize: '0.6rem',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        display: 'block',
                                                        mb: 0.2
                                                    }}
                                                >
                                                    Used
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: 'text.primary',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    {used}
                                                </Typography>
                                            </Box>

                                            {/* Pending */}
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'text.disabled',
                                                        fontSize: '0.6rem',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        display: 'block',
                                                        mb: 0.2
                                                    }}
                                                >
                                                    Pending
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: 'warning.main',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    {pending}
                                                </Typography>
                                            </Box>

                                            {/* Upcoming */}
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'text.disabled',
                                                        fontSize: '0.6rem',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        display: 'block',
                                                        mb: 0.2
                                                    }}
                                                >
                                                    Upcoming
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: 'text.secondary',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {balance.upcoming_leave ? format(new Date(balance.upcoming_leave), 'dd MMM') : 'None'}
                                                </Typography>
                                            </Box>

                                            {/* Expires */}
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'text.disabled',
                                                        fontSize: '0.6rem',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        display: 'block',
                                                        mb: 0.2
                                                    }}
                                                >
                                                    Expires
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: 'text.secondary',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {balance.expiry_date ? format(new Date(balance.expiry_date), 'dd MMM yyyy') : '31 Dec 2026'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                )
                            })}
                        </Box>
                    </Box>
                )}


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
                    title="Withdraw Leave Request"
                    message="Are you sure you want to withdraw this leave request? This action cannot be undone."
                    confirmText="Withdraw"
                    loading={isDeleting}
                />

                <Dialog
                    open={detailsDialogOpen}
                    onClose={() => setDetailsDialogOpen(false)}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: '24px', p: 0.5, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }
                    }}
                >
                    <DialogTitle sx={{ py: 1.5, px: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {selectedLeave && (
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        bgcolor: selectedLeave.status?.toUpperCase() === 'APPROVED' ? 'success.main' :
                                            selectedLeave.status?.toUpperCase() === 'REJECTED' ? 'error.main' : 'warning.main',
                                        boxShadow: '0 0 0 2px ' + alpha(
                                            selectedLeave.status?.toUpperCase() === 'APPROVED' ? theme.palette.success.main :
                                                selectedLeave.status?.toUpperCase() === 'REJECTED' ? theme.palette.error.main : theme.palette.warning.main,
                                            0.2
                                        )
                                    }}
                                />
                            )}
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'text.secondary', letterSpacing: '-0.01em' }}>
                                Leave Details
                            </Typography>
                            {selectedLeave && (
                                <>
                                    <Box sx={{ width: '1px', height: '16px', bgcolor: 'divider' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '0.95rem', color: 'text.primary' }}>
                                        {selectedLeave.leave_type}
                                    </Typography>
                                </>
                            )}
                        </Box>
                        <IconButton onClick={() => setDetailsDialogOpen(false)} size="small" sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                            <Close fontSize="small" />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 2.5 }}>
                        {selectedLeave && (
                            <Stack spacing={2}>

                                {/* Duration Info Table */}
                                <Box sx={{
                                    border: '1px dashed',
                                    borderColor: alpha(theme.palette.primary.main, 0.4),
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                                }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr' }}>
                                        <Box sx={{ p: 1.5, borderRight: '1px dashed', borderColor: alpha(theme.palette.primary.main, 0.3) }}>
                                            <Typography variant="caption" sx={{ color: 'primary.main', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.2 }}>Duration</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.9rem' }}>
                                                {format(new Date(selectedLeave.start_date), 'dd MMM')} - {format(new Date(selectedLeave.end_date), 'dd MMM')}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ p: 1.5 }}>
                                            <Typography variant="caption" sx={{ color: 'primary.main', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.2 }}>Total</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                                                {selectedLeave.is_half_day ? '0.5 Day' : `${selectedLeave.total_days} ${selectedLeave.total_days > 1 ? 'Days' : 'Day'}`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Reason Sections */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>Reason for Application</Typography>
                                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha('#f4f6f8', 0.5), border: '1px dashed', borderColor: alpha(theme.palette.divider, 0.8) }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                {selectedLeave.reason}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {selectedLeave.status?.toUpperCase() === 'REJECTED' && (
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'error.main', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>Rejection Reason</Typography>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(theme.palette.error.main, 0.04), border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.15) }}>
                                                <Typography variant="body2" sx={{ color: 'error.dark', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                    {selectedLeave.rejection_reason || 'Not specified'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {selectedLeave.status?.toUpperCase() === 'APPROVED' && selectedLeave.approver_name && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: '12px', bgcolor: alpha(theme.palette.success.main, 0.03), border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.1) }}>
                                            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6rem' }}>Approved By</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.dark', fontSize: '0.75rem' }}>{selectedLeave.approver_name}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Stack>
                        )}
                    </DialogContent>
                </Dialog>

                <CustomSnackbar
                    open={snackbar.open}
                    onClose={hideSnackbar}
                    message={snackbar.message}
                    severity={snackbar.severity}
                />
            </Box>
        </Box >
    );
};

export default Leaves;
