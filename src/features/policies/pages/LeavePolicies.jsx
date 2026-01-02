import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Typography,
    TextField,
    Tooltip,
    IconButton,
    InputAdornment,
    Grid,
    Paper,
    Divider
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    CheckCircle,
    Cancel,
    Search,
    EventAvailable,
    DateRange,
    History,
    HourglassBottom
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import PageHeader from '../../../components/common/PageHeader';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { usePermissions } from '../../../hooks/usePermissions';
import {
    useGetPoliciesQuery,
    useDeletePolicyMutation
} from '../store/policyApi';
import LeavePolicyForm from '../components/LeavePolicyForm';

const StatBox = ({ label, value, icon: Icon, color = 'primary' }) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.04),
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette[color].main, 0.1)
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {Icon && <Icon sx={{ fontSize: 16, mr: 1, color: `${color}.main`, opacity: 0.8 }} />}
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {label}
            </Typography>
        </Box>
        <Typography variant="body2" fontWeight={600} color="text.primary">
            {value}
        </Typography>
    </Box>
);

const PolicyCard = ({ policy, onEdit, onDelete, canEdit, canDelete }) => {
    const theme = useTheme();
    const config = policy.policy_config || {};

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                '&:hover': {
                    borderColor: 'primary.main',
                }
            }}
        >
            {/* Card Header */}
            <Box sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05)
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            minWidth: 36,
                            px: 1,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                        }}
                    >
                        {policy.leave_type}
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                            {policy.display_name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 600,
                                    color: policy.category === 'PAID' ? 'success.main' : 'text.secondary',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {policy.category}
                            </Typography>
                            <Box component="span" sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 600,
                                    color: policy.is_active ? 'success.main' : 'text.disabled'
                                }}
                            >
                                {policy.is_active ? 'Active' : 'Inactive'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {canEdit && (
                        <Tooltip title="Edit">
                            <IconButton
                                onClick={() => onEdit(policy)}
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': { color: 'primary.main', borderColor: 'primary.main', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }
                                }}
                            >
                                <Edit fontSize="small" sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Box sx={{ width: '1px', height: 20, bgcolor: 'divider', my: 'auto' }} />
                    {canDelete && (
                        <Tooltip title="Delete">
                            <IconButton
                                onClick={() => onDelete(policy.id)}
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                    border: '1px solid',
                                    borderColor: 'text.secondary',
                                    '&:hover': { color: 'error.main', borderColor: 'error.main', bgcolor: (theme) => alpha(theme.palette.error.main, 0.05) }
                                }}
                            >
                                <Delete fontSize="small" sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            {/* Card Body - Stats Grid */}
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <StatBox
                        label="Accrual"
                        value={config.monthly_accrual_rate ? `${config.monthly_accrual_rate}/mo` : '-'}
                        icon={EventAvailable}
                    />
                    <StatBox
                        label="Quota"
                        value={config.yearly_quota ? `${config.yearly_quota}/yr` : 'Unlimited'}
                        icon={DateRange}
                        color="secondary"
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <StatBox
                            label="Max Bal"
                            value={config.max_balance ?? 'NA'}
                            icon={History}
                            color="info"
                        />
                        <StatBox
                            label="Carry Fwd"
                            value={config.carry_forward_enabled ? (config.max_carry_forward ?? 'Yes') : 'No'}
                            icon={HourglassBottom}
                            color={config.carry_forward_enabled ? 'success' : 'warning'}
                        />
                    </Box>
                </Box>
            </CardContent>
        </Paper>
    );
};

const LeavePolicies = () => {
    const theme = useTheme();
    const { can } = usePermissions();
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
    const [searchTerm, setSearchTerm] = useState('');
    const [openForm, setOpenForm] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState(null);

    const { data, isLoading, error } = useGetPoliciesQuery({});
    const [deletePolicy, { isLoading: isDeleting }] = useDeletePolicyMutation();

    const handleDeleteClick = (id) => {
        setPolicyToDelete(id);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (policyToDelete) {
            try {
                await deletePolicy(policyToDelete).unwrap();
                showSnackbar('Leave policy deactivated successfully', 'success');
                setConfirmDeleteOpen(false);
                setPolicyToDelete(null);
            } catch (err) {
                showSnackbar(err.data?.error || 'Failed to delete policy', 'error');
            }
        }
    };

    const handleEditClick = (policy) => {
        setSelectedPolicy(policy);
        setOpenForm(true);
    };

    const handleAddClick = () => {
        setSelectedPolicy(null);
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setSelectedPolicy(null);
    };

    const filteredPolicies = (data?.policies || []).filter(policy =>
        policy.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.leave_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Leave Policies"
                subtitle="Configure and manage employee leave policies"
                action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            placeholder="Search policies..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                sx: { bgcolor: 'background.paper', borderRadius: 2 }
                            }}
                            sx={{ width: 300 }}
                        />
                        {can('leaves', 'create') && (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleAddClick}
                                sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600 }}
                            >
                                Add New Policy
                            </Button>
                        )}
                    </Box>
                }
            />



            {/* Content Grid */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(auto-fill, minmax(320px, 1fr))' },
                gap: 3
            }}>
                {filteredPolicies.map((policy) => (
                    <PolicyCard
                        key={policy.id}
                        policy={policy}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        canEdit={can('leaves', 'update')}
                        canDelete={can('leaves', 'delete')}
                    />
                ))}
            </Box>

            {/* Empty State */}
            {!isLoading && filteredPolicies.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                        No policies found matching your search.
                    </Typography>
                </Box>
            )}

            <ConfirmDialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Deactivate Policy"
                message="Are you sure you want to deactivate this policy? It will no longer be available for employees."
                loading={isDeleting}
            />

            <CustomSnackbar
                open={snackbar.open}
                onClose={hideSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />

            <LeavePolicyForm open={openForm} onClose={handleCloseForm} policy={selectedPolicy} />
        </Box>
    );
};

export default LeavePolicies;
