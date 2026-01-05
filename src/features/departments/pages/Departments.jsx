import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Alert,
    Chip,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    CircularProgress,
    Tooltip,
    FormControlLabel,
    Switch,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Avatar,
    Divider,
    alpha,
    Fade,
    useMediaQuery,
    Stack
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    PersonRemove as RemoveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    useGetDepartmentsQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation
} from '../store/departmentApi';
import { useGetTeamsQuery } from '../../teams/store/teamApi';
import {
    useGetEmployeesQuery,
    useUpdateEmployeeMutation
} from '../../employees/store/employeeApi'
import PageHeader from '../../../components/common/PageHeader';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { Card, Autocomplete, InputAdornment } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { usePermissions } from '../../../hooks/usePermissions';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';

const Departments = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { can, isAdmin } = usePermissions();
    const [statusFilter, setStatusFilter] = useState('all');
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

    const getSelectedEmployee = () => {
        if (!formData.head_id) return null;
        return employees.find(e => (e.user_id || e.id) === formData.head_id) || null;
    };

    const { showSnackbar, snackbar, hideSnackbar } = useSnackbar();

    const [openDialog, setOpenDialog] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [employeeToRemove, setEmployeeToRemove] = useState(null);
    const [employeeListOpen, setEmployeeListOpen] = useState(false);
    const [viewEmployees, setViewEmployees] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        head_id: null,
        is_active: true,
        employee_ids: [],
    });

    const [teamListOpen, setTeamListOpen] = useState(false);
    const [viewTeamsDepartment, setViewTeamsDepartment] = useState(null);
    const [teamSearchTerm, setTeamSearchTerm] = useState('');

    // Nested dialog for team members
    const [teamMembersOpen, setTeamMembersOpen] = useState(false);
    const [selectedTeamForMembers, setSelectedTeamForMembers] = useState(null);
    const [teamMemberSearchTerm, setTeamMemberSearchTerm] = useState('');

    const { data: teamsData, isFetching: isFetchingTeams } = useGetTeamsQuery({
        department_id: viewTeamsDepartment?.id
    }, {
        skip: !viewTeamsDepartment
    });

    const departmentTeams = teamsData?.teams || [];

    const { data, isLoading, error, refetch } = useGetDepartmentsQuery({
        search: searchTerm,
        is_active: statusFilter !== 'all' ? statusFilter : undefined,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
    });
    const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployeesQuery({
        limit: 1000,
        is_active: 'true'
    });
    const employees = employeesData?.employees || [];

    const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
    const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
    const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation();
    const [updateEmployee] = useUpdateEmployeeMutation();

    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemoveClick = (employee) => {
        setEmployeeToRemove(employee);
        setConfirmRemoveOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!employeeToRemove) return;

        setIsRemoving(true);
        try {
            await updateEmployee({ id: employeeToRemove.id, department_id: null }).unwrap();
            showSnackbar('Employee removed from department successfully', 'success');

            if (viewEmployees) {
                setViewEmployees({
                    ...viewEmployees,
                    employees: viewEmployees.employees.filter(emp => emp.id !== employeeToRemove.id)
                });
            }

            refetch();
            setConfirmRemoveOpen(false);
            setEmployeeToRemove(null);
        } catch (err) {
            showSnackbar(err.data?.error || 'Error removing employee', 'error');
        } finally {
            setIsRemoving(false);
        }
    };

    const handleOpenDialog = (department = null) => {
        if (department) {
            setSelectedDepartment(department);
            const currentEmployeeIds = department.employees ? department.employees.map(e => e.id) : [];
            setFormData({
                name: department.name,
                description: department.description || '',
                head_id: department.head_id || null,
                is_active: department.is_active !== undefined ? department.is_active : true,
                employee_ids: currentEmployeeIds,
            });
        } else {
            setSelectedDepartment(null);
            setFormData({
                name: '',
                description: '',
                head_id: null,
                is_active: true,
                employee_ids: [],
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedDepartment(null);
    };

    const handleDeleteClick = (department) => {
        setSelectedDepartment(department);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedDepartment) {
            try {
                await deleteDepartment(selectedDepartment.id).unwrap();
                showSnackbar('Department deleted successfully', 'success');
                setConfirmDeleteOpen(false);
                setSelectedDepartment(null);
            } catch (err) {
                console.error("Failed to delete department", err);
                showSnackbar(err.data?.error || 'Failed to delete department', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedDepartment) {
                await updateDepartment({ id: selectedDepartment.id, ...formData }).unwrap();
                showSnackbar('Department updated successfully', 'success');
            } else {
                await createDepartment(formData).unwrap();
                showSnackbar('Department created successfully', 'success');
            }
            handleCloseDialog();
        } catch (err) {
            console.error("Failed to save department", err);
            showSnackbar(err.data?.error || 'Failed to save department', 'error');
        }
    };

    const columns = [
        {
            field: 'name',
            headerName: 'DEPARTMENT NAME',
            flex: 1,
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
            field: 'head_email',
            headerName: 'HEAD OF DEPT',
            flex: 1,
            minWidth: 250,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'team_count',
            headerName: 'TEAMS',
            width: 130,
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Tooltip title="View Teams">
                        <Button
                            size="small"
                            variant="text"
                            onClick={() => {
                                setViewTeamsDepartment(params.row);
                                setTeamListOpen(true);
                            }}
                            sx={{ minWidth: 0, textDecoration: 'underline' }}
                        >
                            {params.value ?? 0}
                        </Button>
                    </Tooltip>
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
                        label={params.value ? 'Active' : 'Inactive'}
                        color={params.value ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, minWidth: 80 }}
                    />
                </Box>
            ),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'ACTIONS',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            getActions: (params) => [
                can('departments', 'update') && <GridActionsCellItem
                    key={`edit-${params.id}`}
                    icon={<Tooltip title="Edit Department"><EditIcon fontSize="small" /></Tooltip>}
                    label="Edit"
                    onClick={() => handleOpenDialog(params.row)}
                    showInMenu={false}
                    sx={{
                        color: 'primary.main',
                        border: 1,
                        borderColor: 'primary.main',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        mr: 1,
                        '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                    }}
                />,
                can('departments', 'delete') && <GridActionsCellItem
                    key={`delete-${params.id}`}
                    icon={<Tooltip title="Delete Department"><DeleteIcon fontSize="small" /></Tooltip>}
                    label="Delete"
                    onClick={() => handleDeleteClick(params.row)}
                    showInMenu={false}
                    sx={{
                        color: 'error.main',
                        border: 1,
                        borderColor: 'error.main',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        '&:hover': { backgroundColor: 'error.light', color: 'white' }
                    }}
                />,
            ].filter(Boolean),
        },
    ];

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Departments"
                subtitle="Manage department structure and hierarchy."
                action={
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                        <TextField
                            placeholder="Search departments..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                sx: { bgcolor: 'background.paper', borderRadius: 2 }
                            }}
                            sx={{ width: { xs: '100%', sm: 300 } }}
                        />
                        {can('departments', 'create') && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                sx={{ borderRadius: 2, px: 3, whiteSpace: 'nowrap' }}
                            >
                                Add Department
                            </Button>
                        )}
                    </Box>
                }
            />

            {isMobile ? (
                // MOBILE: Card List
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                        <FormControl size="small" fullWidth sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="true">Active</MenuItem>
                                <MenuItem value="false">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {(data?.departments || []).map((dept) => (
                        <Card key={dept.id} sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[1] }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                    {dept.name}
                                </Typography>
                                <Chip
                                    label={dept.is_active ? 'Active' : 'Inactive'}
                                    color={dept.is_active ? 'success' : 'error'}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 600, fontSize: '0.65rem' }}
                                />
                            </Box>

                            {dept.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.4 }}>
                                    {dept.description}
                                </Typography>
                            )}

                            {dept.head_email && (
                                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">Head:</Typography>
                                    <Typography variant="body2">{dept.head_email}</Typography>
                                </Box>
                            )}

                            <Divider sx={{ my: 1.5 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                        setViewTeamsDepartment(dept);
                                        setTeamListOpen(true);
                                    }}
                                    sx={{ fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
                                >
                                    {dept.team_count || 0} Teams
                                </Button>

                                <Box sx={{ display: 'flex' }}>
                                    {can('departments', 'update') && (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(dept)}
                                            sx={{ color: 'primary.main', border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.5), mr: 1, borderRadius: 1 }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    {can('departments', 'delete') && (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteClick(dept)}
                                            sx={{ color: 'error.main', border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.5), borderRadius: 1 }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>
                        </Card>
                    ))}
                    {(data?.departments || []).length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            <Typography>No departments found.</Typography>
                        </Box>
                    )}
                </Stack>
            ) : (
                // DESKTOP: DataGrid
                <Card sx={{ overflow: 'hidden', boxShadow: theme.shadows[2], borderRadius: 2 }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="true">Active</MenuItem>
                                    <MenuItem value="false">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
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
                            rows={data?.departments || []}
                            columns={columns}
                            loading={isLoading}
                            pageSizeOptions={[10, 25, 50]}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            paginationMode="server"
                            rowCount={data?.pagination?.total || 0}
                            disableRowSelectionOnClick
                            density="compact"
                            rowHeight={52}
                            columnHeaderHeight={48}
                        />
                    </Box>
                </Card>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth fullScreen={isMobile}>
                <DialogTitle>{selectedDepartment ? 'Edit Department' : 'Add Department'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField
                                fullWidth
                                label="Department Name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />

                            <Autocomplete
                                options={employees}
                                getOptionLabel={(option) => option.full_name || `${option.first_name} ${option.last_name}`}
                                value={getSelectedEmployee()}
                                onChange={(event, newValue) => {
                                    setFormData({
                                        ...formData,
                                        head_id: newValue ? (newValue.user_id || newValue.id) : null
                                    });
                                }}
                                loading={isLoadingEmployees}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Head of Department"
                                        placeholder="Select Head"
                                    />
                                )}
                                noOptionsText="No employees found"
                                isOptionEqualToValue={(option, value) => (option.user_id || option.id) === (value.user_id || value.id)}
                            />

                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />

                            <Divider />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="subtitle2">Department Status</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formData.is_active ? 'Department is active and visible' : 'Department is inactive'}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} variant='outlined' color='error'>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isCreating || isUpdating}
                        >
                            {isCreating || isUpdating ? <CircularProgress size={24} /> : 'Save'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Department"
                message={`Are you sure you want to delete the department ${selectedDepartment?.name}? This action cannot be undone.`}
                loading={isDeleting}
            />

            <ConfirmDialog
                open={confirmRemoveOpen}
                onClose={() => {
                    setConfirmRemoveOpen(false);
                    setEmployeeToRemove(null);
                }}
                onConfirm={handleConfirmRemove}
                title="Remove Employee from Department"
                message={`Are you sure you want to remove ${employeeToRemove ? `${employeeToRemove.first_name} ${employeeToRemove.last_name}` : 'this employee'} from ${viewEmployees?.name}?`}
                loading={isRemoving}
            />

            {/* ... Delete Dialog ... */}

            {/* Employee List Dialog */}
            <Dialog
                open={employeeListOpen}
                onClose={() => {
                    setEmployeeListOpen(false);
                    setEmployeeSearchTerm('');
                }}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Box>
                        Employees in {viewEmployees?.name}
                        <Typography variant="caption" display="block" color="text.secondary">
                            Total: {viewEmployees?.employees?.length || 0} employees
                        </Typography>
                    </Box>
                    <TextField
                        size="small"
                        placeholder="Search employees..."
                        value={employeeSearchTerm}
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2, bgcolor: 'action.hover', '& fieldset': { border: 'none' } }
                        }}
                    />
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <Box sx={{
                        height: 450,
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
                            rows={(viewEmployees?.employees || []).filter(emp => {
                                const full_name = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
                                const code = (emp.employee_code || '').toLowerCase();
                                const search = employeeSearchTerm.toLowerCase();
                                return full_name.includes(search) || code.includes(search);
                            })}
                            columns={[
                                {
                                    field: 'employee_code',
                                    headerName: 'EMP CODE',
                                    width: 130,
                                    align: 'center',
                                    headerAlign: 'center',
                                    renderCell: (params) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <Typography variant="body2" fontWeight={700} color="primary.main">
                                                {params.value}
                                            </Typography>
                                        </Box>
                                    )
                                },
                                {
                                    field: 'full_name',
                                    headerName: 'FULL NAME',
                                    flex: 1,
                                    minWidth: 200,
                                    renderCell: (params) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {`${params.row.first_name || ''} ${params.row.last_name || ''}`}
                                            </Typography>
                                        </Box>
                                    )
                                },
                                {
                                    field: 'email',
                                    headerName: 'EMAIL ADDRESS',
                                    flex: 1.5,
                                    minWidth: 250,
                                    renderCell: (params) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                            {params.value}
                                        </Box>
                                    )
                                },
                                {
                                    field: 'position',
                                    headerName: 'DESIGNATION',
                                    width: 180,
                                    align: 'center',
                                    headerAlign: 'center',
                                    renderCell: (params) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <Chip
                                                label={params.value || 'N/A'}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                            />
                                        </Box>
                                    )
                                },
                                isAdmin && {
                                    field: 'actions',
                                    type: 'actions',
                                    headerName: 'ACTIONS',
                                    width: 100,
                                    getActions: (params) => [
                                        <GridActionsCellItem
                                            key={`remove-${params.id}`}
                                            icon={
                                                <Tooltip title="Remove from Department">
                                                    <RemoveIcon fontSize="small" />
                                                </Tooltip>
                                            }
                                            label="Remove"
                                            onClick={() => handleRemoveClick(params.row)}
                                            sx={{
                                                color: 'error.main',
                                                border: 1,
                                                borderColor: 'error.main',
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32,
                                                '&:hover': { backgroundColor: 'error.light', color: 'white' }
                                            }}
                                        />,
                                    ],
                                },
                            ].filter(Boolean)}
                            density="compact"
                            disableRowSelectionOnClick
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            pageSizeOptions={[10, 25]}
                            rowHeight={52}
                            columnHeaderHeight={48}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => {
                            setEmployeeListOpen(false);
                            setEmployeeSearchTerm('');
                        }}
                        variant="contained"
                        sx={{ borderRadius: 2 }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={teamListOpen}
                onClose={() => {
                    setTeamListOpen(false);
                    setTeamSearchTerm('');
                    setViewTeamsDepartment(null);
                }}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Box>
                        Teams in {viewTeamsDepartment?.name}
                        <Typography variant="caption" display="block" color="text.secondary">
                            Total: {departmentTeams.length || 0} teams
                        </Typography>
                    </Box>
                    <TextField
                        size="small"
                        placeholder="Search teams..."
                        value={teamSearchTerm}
                        onChange={(e) => setTeamSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2, bgcolor: 'action.hover', '& fieldset': { border: 'none' } }
                        }}
                    />
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <Box sx={{
                        height: 450,
                        width: '100%',
                        '& .MuiDataGrid-root': {
                            border: 'none',
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:focus': { outline: 'none' },
                                '&:focus-within': { outline: 'none' }
                            },
                        }
                    }}>
                        <DataGrid
                            rows={departmentTeams.filter(team =>
                                team.name.toLowerCase().includes(teamSearchTerm.toLowerCase())
                            )}
                            loading={isFetchingTeams}
                            columns={[
                                {
                                    field: 'name',
                                    headerName: 'TEAM NAME',
                                    flex: 1,
                                    renderCell: (params) => (
                                        <Typography variant="body2" fontWeight={600} color="primary.main">
                                            {params.value}
                                        </Typography>
                                    )
                                },
                                {
                                    field: 'manager_name',
                                    headerName: 'MANAGER',
                                    flex: 1,
                                    renderCell: (params) => params.value || '-'
                                },
                                {
                                    field: 'teamlead_name',
                                    headerName: 'TEAM LEAD',
                                    flex: 1,
                                    renderCell: (params) => params.value || '-'
                                },
                                {
                                    field: 'employee_count',
                                    headerName: 'MEMBERS',
                                    width: 130,
                                    align: 'center',
                                    headerAlign: 'center',
                                    renderCell: (params) => (
                                        <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => {
                                                setSelectedTeamForMembers(params.row);
                                                setTeamMembersOpen(true);
                                            }}
                                            sx={{ minWidth: 0, textDecoration: 'underline' }}
                                        >
                                            {params.value ?? 0}
                                        </Button>
                                    )
                                },
                                {
                                    field: 'is_active',
                                    headerName: 'STATUS',
                                    width: 100,
                                    renderCell: (params) => (
                                        <Chip
                                            label={params.value ? 'Active' : 'Inactive'}
                                            color={params.value ? 'success' : 'error'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )
                                }
                            ]}
                            density="compact"
                            disableRowSelectionOnClick
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            pageSizeOptions={[10, 25]}
                            rowHeight={52}
                            columnHeaderHeight={48}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setTeamListOpen(false)} variant="contained" sx={{ borderRadius: 2 }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Nested Team Members Dialog */}
            <Dialog
                open={teamMembersOpen}
                onClose={() => {
                    setTeamMembersOpen(false);
                    setTeamMemberSearchTerm('');
                    setSelectedTeamForMembers(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Box>
                        Members in {selectedTeamForMembers?.name}
                        <Typography variant="caption" display="block" color="text.secondary">
                            Total: {selectedTeamForMembers?.employees?.length || 0} members
                        </Typography>
                    </Box>
                    <TextField
                        size="small"
                        placeholder="Search members..."
                        value={teamMemberSearchTerm}
                        onChange={(e) => setTeamMemberSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2, bgcolor: 'action.hover', '& fieldset': { border: 'none' } }
                        }}
                    />
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <Box sx={{
                        height: 450,
                        width: '100%',
                        '& .MuiDataGrid-root': {
                            border: 'none',
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:focus': { outline: 'none' },
                                '&:focus-within': { outline: 'none' }
                            },
                        }
                    }}>
                        <DataGrid
                            rows={(selectedTeamForMembers?.employees || []).filter(emp => {
                                const full_name = (emp.full_name || `${emp.first_name} ${emp.last_name}`).toLowerCase();
                                const code = (emp.employee_code || '').toLowerCase();
                                const search = teamMemberSearchTerm.toLowerCase();
                                return full_name.includes(search) || code.includes(search);
                            })}
                            columns={[
                                {
                                    field: 'employee_code',
                                    headerName: 'EMP CODE',
                                    width: 120,
                                    renderCell: (params) => (
                                        <Typography variant="body2" fontWeight={700} color="primary.main">
                                            {params.value}
                                        </Typography>
                                    )
                                },
                                {
                                    field: 'full_name',
                                    headerName: 'NAME',
                                    flex: 1,
                                    renderCell: (params) => (
                                        <Typography variant="body2" fontWeight={600}>
                                            {params.value || `${params.row.first_name} ${params.row.last_name}`}
                                        </Typography>
                                    )
                                },
                                { field: 'email', headerName: 'EMAIL', flex: 1 },
                                {
                                    field: 'position',
                                    headerName: 'POSITION',
                                    width: 150,
                                    renderCell: (params) => (
                                        <Chip label={params.value || 'N/A'} size="small" variant="outlined" />
                                    )
                                },
                                {
                                    field: 'is_active',
                                    headerName: 'STATUS',
                                    width: 100,
                                    renderCell: (params) => (
                                        <Chip
                                            label={params.value ? 'Active' : 'Inactive'}
                                            color={params.value ? 'success' : 'error'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )
                                }
                            ]}
                            density="compact"
                            disableRowSelectionOnClick
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            pageSizeOptions={[10, 25]}
                            rowHeight={52}
                            columnHeaderHeight={48}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setTeamMembersOpen(false)} variant="contained" sx={{ borderRadius: 2 }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={hideSnackbar}
            />

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Failed to load departments
                </Alert>
            )}
        </Box>
    );
};

export default Departments;
