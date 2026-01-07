import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    IconButton,
    Card,
    Tooltip,
    FormControlLabel,
    Checkbox,
    Typography,
    Grid,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Switch,
    Paper,
    alpha,
    useMediaQuery,
    Stack,
    InputAdornment
} from '@mui/material';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import PageHeader from '../../../components/common/PageHeader';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import {
    useGetRolesQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useGetPermissionsMatrixQuery,
} from '../../roles/store/roleApi';

import { usePermissions } from '../../../hooks/usePermissions';

const Roles = () => {
    const theme = useTheme();
    const { can } = usePermissions();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [searchTerm, setSearchTerm] = useState('');
    const { data, isLoading } = useGetRolesQuery();
    const { data: matrixData } = useGetPermissionsMatrixQuery();
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
    const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true,
        permissions: {}
    });

    const roles = data?.data || [];
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const availablePermissions = matrixData?.data?.permissions || [];

    const filteredRoles = roles.filter(role =>
        role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const permissionsByModule = availablePermissions.reduce((acc, perm) => {
        if (!acc[perm.module]) {
            acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
    }, {});

    const handleOpenDialog = (role = null) => {
        if (role) {
            setSelectedRole(role);
            setFormData({
                name: role.name,
                description: role.description || '',
                is_active: role.is_active,
                permissions: role.permissions || {}
            });
        } else {
            setSelectedRole(null);
            // Initialize permissions for all modules
            const initialPermissions = {};
            availablePermissions.forEach(perm => {
                initialPermissions[perm.name] = {
                    create: false,
                    read: false,
                    update: false,
                    delete: false,
                    manage: false
                };
            });
            setFormData({
                name: '',
                description: '',
                is_active: true,
                permissions: initialPermissions
            });
        }
        setError('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedRole(null);
    };

    const handlePermissionChange = (module, action, checked) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [module]: {
                    ...prev.permissions[module],
                    [action]: checked
                }
            }
        }));
    };

    const handleDeleteClick = (role) => {
        setRoleToDelete(role);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (roleToDelete) {
            try {
                await deleteRole(roleToDelete.id).unwrap();
                setConfirmDeleteOpen(false);
                setRoleToDelete(null);
                showSnackbar('Role deleted successfully', 'success');
            } catch (err) {
                showSnackbar(err.data?.error || 'Failed to delete role', 'error');
            }
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError('Role name is required');
            return;
        }

        try {
            if (selectedRole) {
                await updateRole({ id: selectedRole.id, ...formData }).unwrap();
                showSnackbar('Role updated successfully', 'success');
            } else {
                await createRole(formData).unwrap();
                showSnackbar('Role created successfully', 'success');
            }
            handleCloseDialog();
        } catch (err) {
            setError(err.data?.error || 'Failed to save role');
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {params.value}
                </Box>
            )
        },
        {
            field: 'name',
            headerName: 'ROLE NAME',
            flex: 1,
            minWidth: 200,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={600} color="primary.main" sx={{ textTransform: 'uppercase' }}>
                        {params.value || '- -'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'description',
            headerName: 'DESCRIPTION',
            flex: 1.5,
            minWidth: 350,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'user_count',
            headerName: 'LINKED USERS',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Chip
                        size="small"
                        label={params.value ?? 0}
                        variant="outlined"
                        sx={{ fontWeight: 600, minWidth: 60, bgcolor: 'action.hover' }}
                    />
                </Box>
            )
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
                        color={params.value ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.65rem', minWidth: 80 }}
                    />
                </Box>
            ),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'ACTIONS',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            getActions: (params) => {
                const isSystemRole = ['admin', 'hr', 'employee'].includes(params.row.name?.toLowerCase());

                return [
                    can('roles', 'update') && <GridActionsCellItem
                        key="edit"
                        icon={<Tooltip title="Edit Permissions"><EditIcon fontSize="small" /></Tooltip>}
                        label="Edit"
                        onClick={() => handleOpenDialog(params.row)}
                        sx={{
                            color: 'primary.main',
                            border: 1,
                            borderColor: 'primary.main',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            mx: 0.5,
                            '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                        }}
                    />,
                    can('roles', 'delete') && !isSystemRole && <GridActionsCellItem
                        key="delete"
                        icon={<Tooltip title="Delete Role"><DeleteIcon fontSize="small" /></Tooltip>}
                        label="Delete"
                        onClick={() => handleDeleteClick(params.row)}
                        sx={{
                            color: 'error.main',
                            border: 1,
                            borderColor: 'error.main',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            mx: 0.5,
                            '&:hover': { backgroundColor: 'error.light', color: 'white' }
                        }}
                    />
                ].filter(Boolean);
            },
        },
    ];

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Role Management"
                subtitle="Define system roles and configure modular access permissions."
                action={
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                        <TextField
                            placeholder="Search roles by name or description..."
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
                        {can('roles', 'create') && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                sx={{ borderRadius: 2, px: 3, whiteSpace: 'nowrap' }}
                            >
                                Create Role
                            </Button>
                        )}
                    </Box>
                }
            />

            {isMobile ? (
                // MOBILE: Card List
                <Stack spacing={2}>
                    {filteredRoles.map((role) => {
                        const isSystemRole = ['admin', 'hr', 'employee'].includes(role.name?.toLowerCase());

                        return (
                            <Card key={role.id} sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[1] }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ textTransform: 'uppercase' }}>
                                        {role.name}
                                    </Typography>
                                    <Chip
                                        label={role.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        color={role.is_active ? 'success' : 'default'}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                                    {role.description || 'No description provided.'}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Chip
                                        size="small"
                                        icon={<ExpandMoreIcon sx={{ transform: 'rotate(-90deg)' }} />}  // Just a visual icon
                                        label={`${role.user_count || 0} Users Linked`}
                                        variant="outlined"
                                        sx={{ fontWeight: 600, bgcolor: 'action.hover' }}
                                    />

                                    <Box sx={{ display: 'flex' }}>
                                        {can('roles', 'update') && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(role)}
                                                sx={{ color: 'primary.main', border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.5), mr: 1, borderRadius: 1 }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                        {can('roles', 'delete') && !isSystemRole && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteClick(role)}
                                                sx={{ color: 'error.main', border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.5), borderRadius: 1 }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            </Card>
                        );
                    })}
                    {filteredRoles.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            <Typography>No roles found.</Typography>
                        </Box>
                    )}
                </Stack>
            ) : (
                // DESKTOP: DataGrid
                <Card sx={{ overflow: 'hidden', borderRadius: 1 }}>
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
                            rows={filteredRoles}
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

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="lg"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: { borderRadius: 2, minHeight: '80vh', display: 'flex', flexDirection: 'column' }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    px: 3,
                    py: 2,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Typography variant="h6" fontWeight={700}>
                        {selectedRole ? 'Edit Role Configuration' : 'Create New Role'}
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ p: 3, bgcolor: '#f8f9fa' }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Role Details Card */}
                    <Paper
                        elevation={0}
                        variant="outlined"
                        sx={{
                            mt: 3,
                            p: 3,
                            mb: 3,
                            borderRadius: 2,
                            bgcolor: 'white',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={5}>
                                <TextField
                                    fullWidth
                                    label="Role Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    disabled={selectedRole && ['admin', 'hr', 'employee'].includes(selectedRole.name)}
                                    placeholder="e.g. Senior Manager"
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the role..."
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            color="success"
                                        />
                                    }
                                    label={<Typography variant="body2" fontWeight={600}>Status: {formData.is_active ? 'Active' : 'Inactive'}</Typography>}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Permissions Table */}
                    <Paper
                        elevation={0}
                        variant="outlined"
                        sx={{
                            overflow: 'hidden',
                            borderRadius: 2,
                            bgcolor: 'white'
                        }}
                    >
                        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
                            <Typography variant="subtitle1" fontWeight={700}>System Permissions</Typography>
                            <Typography variant="caption" color="text.secondary">Define access levels for each module</Typography>
                        </Box>

                        <TableContainer sx={{ maxHeight: 'calc(80vh - 350px)' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa', width: '30%' }}>MODULE / RESOURCE</TableCell>
                                        {['Read', 'Create', 'Update', 'Delete', 'Manage'].map(action => (
                                            <TableCell key={action} align="center" sx={{ fontWeight: 700, bgcolor: '#f8f9fa', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                                {action}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(permissionsByModule).map(([module, permissions]) => (
                                        <React.Fragment key={module}>
                                            {/* Section Header */}
                                            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                                                <TableCell colSpan={6} sx={{ py: 1 }}>
                                                    <Typography variant="caption" color="primary.main" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                                        {module} Module
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>

                                            {/* Permission Rows */}
                                            {permissions.map(perm => (
                                                <TableRow key={perm.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell sx={{ pl: 4 }}>
                                                        <Typography variant="body2" fontWeight={500}>{perm.name}</Typography>
                                                    </TableCell>
                                                    {['read', 'create', 'update', 'delete', 'manage'].map(action => (
                                                        <TableCell key={action} align="center">
                                                            <Checkbox
                                                                size="small"
                                                                checked={formData.permissions[perm.name]?.[action] || false}
                                                                onChange={(e) => handlePermissionChange(perm.name, action, e.target.checked)}
                                                                sx={{
                                                                    p: 0.5,
                                                                    color: 'text.disabled',
                                                                    '&.Mui-checked': { color: 'primary.main' }
                                                                }}
                                                            />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                </DialogContent>
                <DialogActions sx={{ p: 2.5, px: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                    <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderRadius: 2, mr: 1 }}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isCreating || isUpdating}
                        disableElevation
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        {selectedRole ? 'Save Changes' : 'Create Role'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Role"
                message={`Are you sure you want to delete the role ${roleToDelete?.name}? This action cannot be undone.`}
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

export default Roles;
