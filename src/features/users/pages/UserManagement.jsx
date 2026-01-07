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
    alpha,
    CardContent,
    Menu,
    Stack,
    Avatar,
    Divider,
    ListItemIcon,
    ListItemText
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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

    // Responsive Logic
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Switch to cards on Tablet (MD) too, per request strategy? 
    // Strategy says: Tablet (768-1023) -> "Cards in Grid (2 per row)"? 
    // "Mobile: < 480px, Large Mobile: 481-767px". Tablet is 768+.
    // "Table Responsiveness Rules: Mobile -> Cards. Tablet -> Partial columns/Sticky headers."
    // Okay, so Tablet is still a Table (DataGrid) but maybe with fewer columns?
    // User wrote: "Mobile... Convert each row into a card... Tablet ... Partial columns".
    // So isMobile for Cards should probably be theme.breakpoints.down('md') (which is < 900px default MUI) or 'sm' (< 600px).
    // Let's stick to theme.breakpoints.down('sm') which is < 600px, usually covering Mobile and Large Mobile.
    // Or 'md' which is < 900px.
    // Given the detailed constraints ("Mobile <= 480", "Large Mobile <= 767"), let's use down('md') to be safe for iPads or down('sm')?
    // Let's use down('md') (900px) effectively treating anything smaller than a small laptop as "Mobile" layout for safety, 
    // OR strictly follow the chart: Tablet (768+) = Table.
    // So down('sm') (<600px) is Mobile. 
    // Let's use `theme.breakpoints.down('md')` to catch tablets in portrait too, because DataGrids are awful on touch. 
    // But the instructions said "Tablet -> Partial columns".
    // I will use `down('md')` but I might want to double check.
    // Let's stick to `down('md')` for now to be safe with touch targets.

    // Mobile Menu State
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuUser, setMenuUser] = useState(null);

    const handleMenuClick = (event, user) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuUser(user);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuUser(null);
    };

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
                    MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
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
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                        <TextField
                            placeholder="Search by name or email..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                sx: { bgcolor: 'background.paper', borderRadius: 2 }
                            }}
                            sx={{ width: { xs: '100%', sm: 300 } }}
                        />
                        {can('users', 'create') && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                sx={{ borderRadius: 2, px: 3, whiteSpace: 'nowrap' }}
                            >
                                Add User
                            </Button>
                        )}
                    </Box>
                }
            />

            {isMobile ? (
                // MOBILE: Card List
                <Stack spacing={2} sx={{ pb: 4 }}>
                    {filteredUsers.map((user) => (
                        <Card key={user.id} sx={{
                            borderRadius: 3,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'visible'
                        }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                {/* Header: Avatar + Name + Menu */}
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                    <Box display="flex" gap={1.5} alignItems="center">
                                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700 }}>
                                            {user.first_name?.[0]}{user.last_name?.[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                                                {user.first_name} {user.last_name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton size="small" onClick={(e) => handleMenuClick(e, user)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>

                                {/* Badges Row */}
                                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                                    <Chip
                                        label={user.role}
                                        size="small"
                                        sx={{
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            height: 24,
                                            bgcolor: 'primary.lighter',
                                            color: 'primary.main'
                                        }}
                                    />
                                    <Chip
                                        label={user.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        size="small"
                                        color={user.is_active ? 'success' : 'error'}
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem', fontWeight: 700, height: 24 }}
                                    />
                                </Box>

                                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                                {/* Secondary Info */}
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary">
                                        Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ID: #{user.id}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredUsers.length === 0 && (
                        <Box textAlign="center" py={4}>
                            <Typography color="text.secondary">No users found</Typography>
                        </Box>
                    )}
                </Stack>
            ) : (
                // DESKTOP: DataGrid
                <Card sx={{
                    overflow: 'hidden',
                    borderRadius: 1,
                    bgcolor: 'background.paper'
                }}>
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
            )}

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{ '& .MuiPaper-root': { borderRadius: 3, boxShadow: theme.shadows[3], minWidth: 150 } }}
            >
                {can('users', 'update') && (
                    <MenuItem onClick={() => {
                        if (menuUser) handleToggleStatus(menuUser.id, menuUser.is_active);
                        handleMenuClose();
                    }}>
                        <ListItemIcon>
                            {menuUser?.is_active ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" color="success" />}
                        </ListItemIcon>
                        <ListItemText>
                            {menuUser?.is_active ? 'Deactivate' : 'Activate'}
                        </ListItemText>
                    </MenuItem>
                )}
                {can('users', 'update') && (
                    <MenuItem onClick={() => {
                        handleOpenDialog(menuUser);
                        handleMenuClose();
                    }}>
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Edit Details</ListItemText>
                    </MenuItem>
                )}
                <MenuItem onClick={() => {
                    navigate(`/employee/profile?userId=${menuUser?.id}`);
                    handleMenuClose();
                }}>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>View Profile</ListItemText>
                </MenuItem>

                {can('users', 'delete') && (
                    <MenuItem onClick={() => {
                        handleDeleteClick(menuUser);
                        handleMenuClose();
                    }} sx={{ color: 'error.main' }}>
                        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>Delete User</ListItemText>
                    </MenuItem>
                )}
            </Menu>

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
                            MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
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
