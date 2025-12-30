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
    Tooltip
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    PersonRemove as RemoveIcon
} from '@mui/icons-material';
import {
    useGetDepartmentsQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation
} from '../store/departmentApi';
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
    const { can, isAdmin } = usePermissions();
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
        employee_ids: [],
    });

    const { data, isLoading, error, refetch } = useGetDepartmentsQuery({
        search: searchTerm,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
    });
    const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployeesQuery({
        page: paginationModel.page + 1, // Dynamic based on pagination
        limit: paginationModel.pageSize // Dynamic based on pagination
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
                employee_ids: currentEmployeeIds,
            });
        } else {
            setSelectedDepartment(null);
            setFormData({
                name: '',
                description: '',
                head_id: null,
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
                showSnackbar('Failed to delete department', 'error');
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
            showSnackbar('Failed to save department', 'error');
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
            field: 'employee_count',
            headerName: 'EMP COUNT',
            width: 130,
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Tooltip title="View Employees">
                        <Button
                            size="small"
                            variant="text"
                            onClick={() => {
                                setViewEmployees(params.row);
                                setEmployeeListOpen(true);
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
                    can('departments', 'create') && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ borderRadius: 2 }}
                        >
                            Add Department
                        </Button>
                    )
                }
            />

            <Card sx={{ overflow: 'hidden', boxShadow: theme.shadows[2], borderRadius: 2 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        placeholder="Search departments..."
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

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
                                getOptionLabel={(option) => option.first_name || ''}
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
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />

                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                            '& .MuiDataGrid-cell:focus': { outline: 'none' },
                            '& .MuiDataGrid-cell:focus-within': { outline: 'none' },
                            '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
                            '& .MuiDataGrid-columnHeader:focus-within': { outline: 'none' }
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
