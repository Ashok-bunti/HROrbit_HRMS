import { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
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
    InputAdornment,
    Checkbox,
    Stack,
    CardContent,
    Menu,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    People as PeopleIcon,
    Person as PersonIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
    CheckBox as CheckBoxIcon,
    MoreVert as MoreVertIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
    useGetTeamsQuery,
    useGetTeamByIdQuery,
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
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        member_ids: []
    });

    const { data, isLoading, error, refetch } = useGetTeamsQuery({
        is_active: statusFilter !== 'all' ? statusFilter : undefined,
        department_id: deptFilter !== 'all' ? deptFilter : undefined,
    });

    const { data: teamDetailsData, refetch: refetchTeamDetails } = useGetTeamByIdQuery(viewMembersTeam?.id, {
        skip: !viewMembersTeam,
    });
    const teamMembers = teamDetailsData?.team?.employees || [];

    // Fetch team details when editing to populate members
    const { data: teamEditDetails } = useGetTeamByIdQuery(selectedTeam?.id, {
        skip: !selectedTeam
    });

    useEffect(() => {
        if (teamEditDetails?.team && selectedTeam) {
            setFormData(prev => ({
                ...prev,
                member_ids: teamEditDetails.team.employees?.map(e => e.id) || []
            }));
        }
    }, [teamEditDetails, selectedTeam]);

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
            refetchTeamDetails();
            refetch(); // Refetch main list to update counts
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
                member_ids: [] // Will be populated by useEffect when details load
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
                member_ids: []
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



    // Mobile Menu State
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuTeam, setMenuTeam] = useState(null);

    const handleMenuClick = (event, team) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuTeam(team);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuTeam(null);
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
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                        <TextField
                            placeholder="Search teams..."
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
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <FormControl size="small" sx={{ minWidth: 150, borderRadius: 1 }}>
                                <InputLabel>Department</InputLabel>
                                <Select
                                    value={deptFilter}
                                    label="Department"
                                    onChange={(e) => setDeptFilter(e.target.value)}
                                    MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                                >
                                    <MenuItem value="all">All Departments</MenuItem>
                                    {departments.map(dept => (
                                        <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 150, borderRadius: 1 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="true">Active</MenuItem>
                                    <MenuItem value="false">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        {can('teams', 'create') && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                sx={{ borderRadius: 2, px: 3, whiteSpace: 'nowrap' }}
                            >
                                Add Team
                            </Button>
                        )}
                    </Box>
                }
            />

            <Card sx={{
                overflow: 'hidden',
                borderRadius: isMobile ? 0 : 1,
                bgcolor: isMobile ? 'transparent' : 'background.paper',
                border: isMobile ? 'none' : undefined
            }}>


                {isMobile ? (
                    // MOBILE: Card List View
                    <Stack spacing={2} sx={{ px: 0, pb: 4 }}>
                        {filteredTeams.map((team) => (
                            <Card key={team.id} sx={{
                                borderRadius: 3,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    {/* Header */}
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                        <Box display="flex" gap={1.5} alignItems="center">
                                            <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40, fontSize: '1rem', fontWeight: 700 }}>
                                                <PeopleIcon fontSize="small" />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                                                    {team.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {team.department_name}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <IconButton size="small" onClick={(e) => handleMenuClick(e, team)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>

                                    {/* Status Badge */}
                                    <Box mb={2}>
                                        <Chip
                                            label={team.is_active ? 'Active' : 'Inactive'}
                                            color={team.is_active ? 'success' : 'error'}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontWeight: 600, height: 24, fontSize: '0.7rem' }}
                                        />
                                    </Box>

                                    <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                                    {/* Details */}
                                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Manager</Typography>
                                            <Typography variant="body2" fontWeight={500}>{team.manager_name || 'N/A'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Team Lead</Typography>
                                            <Typography variant="body2" fontWeight={500}>{team.teamlead_name || 'N/A'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Members</Typography>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setViewMembersTeam(team);
                                                    setMemberListOpen(true);
                                                }}
                                                sx={{ minWidth: 0, p: 0, textDecoration: 'underline', height: 'auto', justifyContent: 'flex-start' }}
                                            >
                                                {team.employee_count || 0} Members
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                        {filteredTeams.length === 0 && (
                            <Box textAlign="center" py={4}>
                                <Typography color="text.secondary">No teams found</Typography>
                            </Box>
                        )}
                    </Stack>
                ) : (
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
                                    '&:focus': { outline: 'none' },
                                    '&:focus-within': { outline: 'none' },
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    '&:focus': { outline: 'none' },
                                    '&:focus-within': { outline: 'none' },
                                },
                            }}
                        />
                    </Box>
                )}
            </Card>

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{ '& .MuiPaper-root': { borderRadius: 3, boxShadow: theme.shadows[3], minWidth: 150 } }}
            >
                <MenuItem onClick={() => {
                    setViewMembersTeam(menuTeam);
                    setMemberListOpen(true);
                    handleMenuClose();
                }}>
                    <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>View Members</ListItemText>
                </MenuItem>

                {can('teams', 'update') && (
                    <MenuItem onClick={() => {
                        handleOpenDialog(menuTeam);
                        handleMenuClose();
                    }}>
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Edit Team</ListItemText>
                    </MenuItem>
                )}

                {can('teams', 'delete') && (
                    <MenuItem onClick={() => {
                        handleDeleteClick(menuTeam);
                        handleMenuClose();
                    }} sx={{ color: 'error.main' }}>
                        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>Delete Team</ListItemText>
                    </MenuItem>
                )}
            </Menu>

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
                                    MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                                >
                                    {departments.map(dept => (
                                        <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Autocomplete
                                options={employees.filter(e => e.role === 'manager')}
                                getOptionLabel={(option) => option.full_name || `${option.first_name} ${option.last_name}`}
                                value={employees.find(e => (e.user_id || e.id) === formData.manager_id) || null}
                                onChange={(event, newValue) => {
                                    setFormData({ ...formData, manager_id: newValue ? (newValue.user_id || newValue.id) : '' });
                                }}
                                renderInput={(params) => <TextField {...params} label="Team Manager" required />}
                            />

                            <Autocomplete
                                options={employees.filter(e => e.role === 'teamlead')}
                                getOptionLabel={(option) => option.full_name || `${option.first_name} ${option.last_name}`}
                                value={employees.find(e => (e.user_id || e.id) === formData.teamlead_id) || null}
                                onChange={(event, newValue) => {
                                    setFormData({ ...formData, teamlead_id: newValue ? (newValue.user_id || newValue.id) : '' });
                                }}
                                renderInput={(params) => <TextField {...params} label="Team Lead" required />}
                            />

                            <Autocomplete
                                multiple
                                options={employees.filter(e => e.role === 'employee')}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option.full_name || `${option.first_name} ${option.last_name}`}
                                value={employees.filter(e => formData.member_ids.includes(e.id || e.user_id))}
                                onChange={(event, newValue) => {
                                    setFormData({ ...formData, member_ids: newValue.map(v => v.id || v.user_id) });
                                }}
                                renderInput={(params) => <TextField {...params} label="Team Members" placeholder="Select employees" />}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                        <Checkbox
                                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option.full_name || `${option.first_name} ${option.last_name}`}
                                    </li>
                                )}
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
                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                Manager: <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{viewMembersTeam?.manager_name || 'N/A'}</Box>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                Team Lead: <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{viewMembersTeam?.teamlead_name || 'N/A'}</Box>
                            </Typography>
                        </Box>
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
                            rows={teamMembers.filter(emp => {
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
                                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {params.value || `${params.row.first_name} ${params.row.last_name}`}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                                                {params.row.employee_code}
                                            </Typography>
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
                                            sx={{ fontWeight: 600 }}
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
                                            icon={<Tooltip title="Remove from Team"><DeleteIcon fontSize="small" /></Tooltip>}
                                            label="Remove"
                                            onClick={() => handleRemoveMember(params.row)}
                                            disabled={isRemoving}
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
