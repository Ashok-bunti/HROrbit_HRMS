import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Chip,
    IconButton,
    Card,
    Tooltip,
    InputAdornment,
    alpha
} from '@mui/material';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useTheme } from '@mui/material/styles';
import PageHeader from '../../../components/common/PageHeader';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import {
    useGetUsersQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useUpdateUserRoleMutation,
    useToggleUserStatusMutation,
} from '../../users/store/userApi';
import { useGetRolesQuery } from '../../roles/store/roleApi';

import { usePermissions } from '../../../hooks/usePermissions';

const UserManagement = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { can } = usePermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        role: '',
        first_name: '',
        last_name: '',
    });
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    const { data, isLoading, refetch } = useGetUsersQuery();
    const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery({ is_active: true });

    const roles = rolesData?.data || [];

    const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
    const [updateUserRole] = useUpdateUserRoleMutation();
    const [toggleUserStatus] = useToggleUserStatusMutation();

    const handleOpenDialog = (user = null) => {
        if (user) {
            setSelectedUser(user);
            setFormData({
                email: user.email,
                password: '',
                confirmPassword: '',
                role: user.role,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
            });
        } else {
            setSelectedUser(null);
            setFormData({
                email: '',
                role: roles.find(r => r.name.toLowerCase() === 'employee')?.name || roles[0]?.name || '',
                first_name: '',
                last_name: '',
            });
        }
        setError('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
        setFormData({ email: '', role: '', first_name: '', last_name: '' });
        setError('');
        setEmailError('');
        setPasswordError('');
    };


    // Password validation function


    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setFormData({ ...formData, email });

        // Validate email format in real-time
        if (email && !validateEmail(email)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async () => {
        try {
            setError('');

            // Validate email format
            if (!formData.email || !validateEmail(formData.email)) {
                setError('Please enter a valid email address');
                setEmailError('Please enter a valid email address');
                return;
            }

            if (selectedUser) {
                // Update user
                await updateUser({ id: selectedUser.id, ...formData }).unwrap();
                showSnackbar('User updated successfully', 'success');
            } else {
                // Create user - Password handled by backend
                await createUser(formData).unwrap();
                showSnackbar('User created successfully. Password sent via email.', 'success');
            }
            handleCloseDialog();
            refetch();
        } catch (err) {
            setError(err.data?.error || 'An error occurred');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await toggleUserStatus({ id, is_active: !currentStatus }).unwrap();
            refetch();
            showSnackbar(
                `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
                'success'
            );
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to toggle user status', 'error');
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (userToDelete) {
            try {
                await deleteUser(userToDelete.id).unwrap();
                setConfirmDeleteOpen(false);
                setUserToDelete(null);
                refetch();
                showSnackbar('User deleted successfully', 'success');
            } catch (err) {
                showSnackbar(err.data?.error || 'Failed to delete user', 'error');
            }
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await updateUserRole({ id, role: newRole }).unwrap();
            refetch();
            showSnackbar('User role updated successfully', 'success');
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to update role', 'error');
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'email',
            headerName: 'EMAIL ADDRESS',
            flex: 1.5,
            minWidth: 250,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                        {params.value || '- -'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'first_name',
            headerName: 'FULL NAME',
            flex: 1,
            minWidth: 220,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => {
                const name = `${params.row.first_name || ''} ${params.row.last_name || ''}`.trim();
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body2">
                            {name || '- -'}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            field: 'role',
            headerName: 'SYSTEM ROLE',
            width: 180,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Select
                    value={params.value || ''}
                    onChange={(e) => handleRoleChange(params.row.id, e.target.value)}
                    disabled={!can('users', 'update') || rolesLoading}
                    size="small"
                    fullWidth
                    sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        '& .MuiSelect-select': { py: 0.5, px: 1 },
                        bgcolor: 'action.hover',
                        borderRadius: 2,
                        '& fieldset': { border: 'none' }
                    }}
                >
                    {roles.map((role) => (
                        <MenuItem key={role.id} value={role.name} sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {role.name.toUpperCase()}
                        </MenuItem>
                    ))}
                    {roles.length === 0 && <MenuItem disabled>NO ROLES</MenuItem>}
                </Select>
            ),
        },
        {
            field: 'is_active',
            headerName: 'STATUS',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Chip
                        label={params.value ? 'ACTIVE' : 'INACTIVE'}
                        color={params.value ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.65rem', minWidth: 80 }}
                    />
                </Box>
            ),
        },
        {
            field: 'mfa_enabled',
            headerName: 'MFA STATUS',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Chip
                        label={params.value ? 'ENABLED' : 'DISABLED'}
                        color={params.value ? 'success' : 'error'}
                        size="small"
                        variant="soft"
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            minWidth: 90,
                            bgcolor: params.value ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
                            color: params.value ? '#2e7d32' : '#d32f2f',
                            border: 'none'
                        }}
                    />
                </Box>
            ),
        },
        {
            field: 'profile_completed',
            headerName: 'PROFILE STATUS',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Chip
                        label={params.value ? 'COMPLETED' : 'INCOMPLETE'}
                        color={params.value ? 'success' : 'warning'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.65rem', minWidth: 100, border: 'none' }}
                    />
                </Box>
            ),
        },
        {
            field: 'created_at',
            headerName: 'JOINED ON',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '- -',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'ACTIONS',
            width: 220,
            align: 'center',
            headerAlign: 'center',
            getActions: (params) => [
                can('users', 'update') && <GridActionsCellItem
                    key="toggle"
                    icon={
                        <Tooltip title={params.row.is_active ? 'Deactivate User' : 'Activate User'}>
                            {params.row.is_active ?
                                <ToggleOnIcon sx={{ fontSize: 32, color: '#4caf50' }} /> :
                                <ToggleOffIcon sx={{ fontSize: 32, color: '#bdbdbd' }} />
                            }
                        </Tooltip>
                    }
                    label="Toggle Status"
                    onClick={() => handleToggleStatus(params.row.id, params.row.is_active)}
                    sx={{
                        mx: 0.3,
                        '&:hover': { backgroundColor: 'transparent' }
                    }}
                />,
                can('users', 'update') && <GridActionsCellItem
                    key="edit"
                    icon={<Tooltip title="Edit User"><EditIcon sx={{ fontSize: 18 }} /></Tooltip>}
                    label="Edit"
                    onClick={() => handleOpenDialog(params.row)}
                    sx={{
                        color: '#9c27b0',
                        border: '1.5px solid',
                        borderColor: '#9c27b0',
                        borderRadius: '50%',
                        width: 34,
                        height: 34,
                        mx: 0.4,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: '#9c27b0',
                            color: 'white',
                            transform: 'scale(1.08)'
                        }
                    }}
                />,
                <GridActionsCellItem
                    key="view"
                    icon={<Tooltip title="View Profile"><VisibilityIcon sx={{ fontSize: 18 }} /></Tooltip>}
                    label="View Profile"
                    onClick={() => navigate(`/employee/profile?userId=${params.row.id}`)}
                    sx={{
                        color: '#2196f3',
                        border: '1.5px solid',
                        borderColor: '#2196f3',
                        borderRadius: '50%',
                        width: 34,
                        height: 34,
                        mx: 0.4,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: '#2196f3',
                            color: 'white',
                            transform: 'scale(1.08)'
                        }
                    }}
                />,
                can('users', 'delete') && <GridActionsCellItem
                    key="delete"
                    icon={<Tooltip title="Delete User"><DeleteIcon sx={{ fontSize: 18 }} /></Tooltip>}
                    label="Delete"
                    onClick={() => handleDeleteClick(params.row)}
                    sx={{
                        color: '#f44336',
                        border: '1.5px solid',
                        borderColor: '#f44336',
                        borderRadius: '50%',
                        width: 34,
                        height: 34,
                        mx: 0.4,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: '#f44336',
                            color: 'white',
                            transform: 'scale(1.08)'
                        }
                    }}
                />,
            ].filter(Boolean),
        },
    ];

    const users = data?.users || [];
    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="User Management"
                subtitle="Manage system access, roles and user account status."
                action={
                    can('users', 'create') && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ borderRadius: 2, px: 3 }}
                        >
                            Add User
                        </Button>
                    )
                }
            />

            <Card sx={{ overflow: 'hidden', boxShadow: theme.shadows[2], borderRadius: 2 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        placeholder="Search by name or email..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ minWidth: 350 }}
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
                        rows={filteredUsers}
                        columns={columns}
                        loading={isLoading}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10 },
                            },
                        }}
                        disableRowSelectionOnClick
                        density="compact"
                        rowHeight={52}
                        columnHeaderHeight={48}
                    />
                </Box>
            </Card>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="First Name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Last Name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            margin="normal"
                            required
                        />
                    </Box>

                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleEmailChange}
                        margin="normal"
                        required
                        error={!!emailError}
                        helperText={emailError || 'Enter a valid email address (e.g., user@example.com)'}
                    />

                    {!selectedUser && (
                        <Alert severity="info" sx={{ mt: 2, mb: 1 }}>
                            A strong password will be automatically generated and sent to the user's email address.
                        </Alert>
                    )}

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            label="Role"
                            disabled={rolesLoading}
                        >
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.name}>
                                    {role.name}
                                </MenuItem>
                            ))}
                            {roles.length === 0 && <MenuItem disabled>No roles available</MenuItem>}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isCreating || isUpdating}
                    >
                        {selectedUser ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete User"
                message={`Are you sure you want to delete user ${userToDelete?.first_name} ${userToDelete?.last_name || ''}? This action cannot be undone.`}
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

export default UserManagement;
