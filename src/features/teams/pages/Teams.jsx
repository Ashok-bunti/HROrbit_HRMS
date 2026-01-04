import { useState, useEffect } from 'react';
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
    Fade,
    Card,
    Autocomplete,
    InputAdornment
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    People as PeopleIcon,
    Person as PersonIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import {
    useGetTeamsQuery,
    useCreateTeamMutation,
    useUpdateTeamMutation,
    useDeleteTeamMutation
} from '../store/teamApi';
import { useGetDepartmentsQuery } from '../../departments/store/departmentApi';
import { useGetEmployeesQuery, useUpdateEmployeeMutation } from '../../employees/store/employeeApi';
import PageHeader from '../../../components/common/PageHeader';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useTheme } from '@mui/material/styles';
import { usePermissions } from '../../../hooks/usePermissions';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import { useSearchParams } from 'react-router-dom';

const Teams = () => {
    const theme = useTheme();
    const { can, isAdmin } = usePermissions();
    const { showSnackbar, snackbar, hideSnackbar } = useSnackbar();
    const [searchParams] = useSearchParams();

    const [statusFilter, setStatusFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('all');

    useEffect(() => {
        const deptId = searchParams.get('department_id');
        if (deptId) {
            setDeptFilter(parseInt(deptId));
        }
    }, [searchParams]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [memberSearchTerm, setMemberSearchTerm] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [memberListOpen, setMemberListOpen] = useState(false);
    const [viewMembersTeam, setViewMembersTeam] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        department_id: '',
        manager_id: '',
        teamlead_id: '',
        is_active: true,
    });

    const { data, isLoading, error, refetch } = useGetTeamsQuery({
        is_active: statusFilter !== 'all' ? statusFilter : undefined,
        department_id: deptFilter !== 'all' ? deptFilter : undefined,
    });

    const { data: departmentsData } = useGetDepartmentsQuery({ is_active: 'true' });
    const departments = departmentsData?.departments || [];

    const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployeesQuery({
        limit: 1000,
        is_active: 'true'
    });
    const employees = employeesData?.employees || [];

    const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
    const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();
    const [deleteTeam, { isLoading: isDeleting }] = useDeleteTeamMutation();
    const [updateEmployee, { isLoading: isRemoving }] = useUpdateEmployeeMutation();

    const handleRemoveMember = async (employee) => {
        try {
            await updateEmployee({ id: employee.id, team_id: null }).unwrap();
            showSnackbar(`${employee.first_name} removed from team`, 'success');
            // Update local view if needed, or rely on refetch
            if (viewMembersTeam) {
                const updatedEmployees = viewMembersTeam.employees.filter(e => e.id !== employee.id);
                setViewMembersTeam({ ...viewMembersTeam, employees: updatedEmployees });
            }
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to remove member', 'error');
        }
    };

    const handleOpenDialog = (team = null) => {
        if (team) {
            setSelectedTeam(team);
            setFormData({
                name: team.name,
                description: team.description || '',
                department_id: team.department_id || '',
                manager_id: team.manager_id || '',
                teamlead_id: team.teamlead_id || '',
                is_active: team.is_active !== undefined ? team.is_active : true,
            });
        } else {
            setSelectedTeam(null);
            setFormData({
                name: '',
                description: '',
                department_id: '',
                manager_id: '',
                teamlead_id: '',
                is_active: true,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedTeam(null);
    };

    const handleDeleteClick = (team) => {
        setSelectedTeam(team);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedTeam) {
            try {
                await deleteTeam(selectedTeam.id).unwrap();
                showSnackbar('Team deleted successfully', 'success');
                setConfirmDeleteOpen(false);
                setSelectedTeam(null);
            } catch (err) {
                showSnackbar(err.data?.error || 'Failed to delete team', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedTeam) {
                await updateTeam({ id: selectedTeam.id, ...formData }).unwrap();
                showSnackbar('Team updated successfully', 'success');
            } else {
                await createTeam(formData).unwrap();
                showSnackbar('Team created successfully', 'success');
            }
            handleCloseDialog();
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to save team', 'error');
        }
    };

    const columns = [
        {
            field: 'name',
            headerName: 'TEAM NAME',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                        {params.value}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'department_name',
            headerName: 'DEPARTMENT',
            flex: 1,
            minWidth: 150,
        },
        {
            field: 'manager_name',
            headerName: 'MANAGER',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2">{params.value || 'N/A'}</Typography>
                </Box>
            )
        },
        {
            field: 'teamlead_name',
            headerName: 'TEAM LEAD',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2">{params.value || 'N/A'}</Typography>
                </Box>
            )
        },
        {
            field: 'employee_count',
            headerName: 'MEMBERS',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Tooltip title="View Members">
                    <Button
                        size="small"
                        onClick={() => {
                            setViewMembersTeam(params.row);
                            setMemberListOpen(true);
                        }}
                        sx={{ minWidth: 0, textDecoration: 'underline' }}
                    >
                        {params.value || 0}
                    </Button>
                </Tooltip>
            )
        },
        {
            field: 'is_active',
            headerName: 'STATUS',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Active' : 'Inactive'}
                    color={params.value ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                />
            ),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'ACTIONS',
            width: 120,
            getActions: (params) => [
                can('teams', 'update') && <GridActionsCellItem
                    key={`edit-${params.id}`}
                    icon={<Tooltip title="Edit Team"><EditIcon fontSize="small" /></Tooltip>}
                    label="Edit"
                    onClick={() => handleOpenDialog(params.row)}
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
                can('teams', 'delete') && <GridActionsCellItem
                    key={`delete-${params.id}`}
                    icon={<Tooltip title="Delete Team"><DeleteIcon fontSize="small" /></Tooltip>}
                    label="Delete"
                    onClick={() => handleDeleteClick(params.row)}
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

    const filteredTeams = (data?.teams || []).filter(team => {
        const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Teams"
                subtitle="Manage organizational teams within departments."
                action={
                    can('teams', 'create') && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ borderRadius: 2 }}
                        >
                            Add Team
                        </Button>
                    )
                }
            />

            <Card sx={{ overflow: 'hidden', boxShadow: theme.shadows[2], borderRadius: 2 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Search teams..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ minWidth: 250 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={deptFilter}
                                label="Department"
                                onChange={(e) => setDeptFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Departments</MenuItem>
                                {departments.map(dept => (
                                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
                <Box sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={filteredTeams}
                        columns={columns}
                        loading={isLoading}
                        pageSizeOptions={[10, 25, 50]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        disableRowSelectionOnClick
                        density="compact"
                        rowHeight={52}
                        columnHeaderHeight={48}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeader': {
                                backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                                color: 'text.secondary',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            },
                        }}
                    />
                </Box>
            </Card>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedTeam ? 'Edit Team' : 'Add Team'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField
                                fullWidth
                                label="Team Name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />

                            <FormControl fullWidth required>
                                <InputLabel>Department</InputLabel>
                                <Select
                                    value={formData.department_id}
                                    label="Department"
                                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                >
                                    {departments.map(dept => (
                                        <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Autocomplete
                                options={employees}
                                getOptionLabel={(option) => option.full_name || `${option.first_name} ${option.last_name}`}
                                value={employees.find(e => (e.user_id || e.id) === formData.manager_id) || null}
                                onChange={(event, newValue) => {
                                    setFormData({ ...formData, manager_id: newValue ? (newValue.user_id || newValue.id) : '' });
                                }}
                                renderInput={(params) => <TextField {...params} label="Team Manager" required />}
                            />

                            <Autocomplete
                                options={employees}
                                getOptionLabel={(option) => option.full_name || `${option.first_name} ${option.last_name}`}
                                value={employees.find(e => (e.user_id || e.id) === formData.teamlead_id) || null}
                                onChange={(event, newValue) => {
                                    setFormData({ ...formData, teamlead_id: newValue ? (newValue.user_id || newValue.id) : '' });
                                }}
                                renderInput={(params) => <TextField {...params} label="Team Lead" required />}
                            />

                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        color="primary"
                                    />
                                }
                                label="Active Status"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} variant="outlined" color="error">Cancel</Button>
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

            <ConfirmDialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Team"
                message={`Are you sure you want to delete the team ${selectedTeam?.name}? This action cannot be undone.`}
                loading={isDeleting}
            />

            {/* Members List Dialog */}
            <Dialog
                open={memberListOpen}
                onClose={() => setMemberListOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        Members in {viewMembersTeam?.name}
                        <Typography variant="caption" display="block" color="text.secondary">
                            Team Manager: {viewMembersTeam?.manager_name} | Team Lead: {viewMembersTeam?.teamlead_name}
                        </Typography>
                    </Box>
                    <TextField
                        size="small"
                        placeholder="Search members..."
                        value={memberSearchTerm}
                        onChange={(e) => setMemberSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={(viewMembersTeam?.employees || []).filter(emp => {
                                const full_name = (emp.full_name || `${emp.first_name} ${emp.last_name}`).toLowerCase();
                                return full_name.includes(memberSearchTerm.toLowerCase()) ||
                                    (emp.employee_code && emp.employee_code.toLowerCase().includes(memberSearchTerm.toLowerCase()));
                            })}
                            columns={[
                                {
                                    field: 'full_name',
                                    headerName: 'NAME',
                                    flex: 1.5,
                                    renderCell: (params) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem' }}>
                                                {params.row.first_name?.[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {params.value || `${params.row.first_name} ${params.row.last_name}`}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {params.row.employee_code}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )
                                },
                                { field: 'email', headerName: 'EMAIL', flex: 1.5 },
                                { field: 'position', headerName: 'POSITION', flex: 1 },
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
                                },
                                {
                                    field: 'actions',
                                    type: 'actions',
                                    headerName: 'ACTIONS',
                                    width: 80,
                                    getActions: (params) => [
                                        <GridActionsCellItem
                                            key={`remove-${params.id}`}
                                            icon={<Tooltip title="Remove from Team"><DeleteIcon color="error" fontSize="small" /></Tooltip>}
                                            label="Remove"
                                            onClick={() => handleRemoveMember(params.row)}
                                            disabled={isRemoving}
                                        />
                                    ]
                                }
                            ]}
                            density="compact"
                            rowHeight={52}
                            columnHeaderHeight={48}
                            disableRowSelectionOnClick
                            hideFooter={viewMembersTeam?.employees?.length <= 10}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeader': {
                                    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                                    color: 'text.secondary',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    '&:focus': { outline: 'none' },
                                    '&:focus-within': { outline: 'none' },
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    '&:focus': { outline: 'none' },
                                    '&:focus-within': { outline: 'none' },
                                },
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                },
                                '& .MuiDataGrid-columnSeparator': {
                                    display: 'none'
                                }
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setMemberListOpen(false)} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>

            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={hideSnackbar}
            />
        </Box>
    );
};

export default Teams;
