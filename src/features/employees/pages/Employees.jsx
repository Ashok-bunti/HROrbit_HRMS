import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Alert,
    Chip,
    TextField,
    Card,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    CircularProgress,
    Tooltip,
    Autocomplete,
    Divider,
    Tab,
    Tabs,
    IconButton
} from '@mui/material';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import { useNavigate, useLocation } from 'react-router-dom';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useGetEmployeesQuery, useCreateEmployeeMutation, useUpdateEmployeeMutation, useDeleteEmployeeMutation } from '../store/employeeApi';
import { useGetDepartmentsQuery } from '../../departments/store/departmentApi';
import { useGetRolesQuery } from '../../roles/store/roleApi';
import PageHeader from '../../../components/common/PageHeader';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useTheme } from '@mui/material/styles';

import { usePermissions } from '../../../hooks/usePermissions';

const Employees = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { can } = usePermissions();

    // Calculate maximum allowed date of birth (18 years ago from today)
    const maxDOB = new Date();
    maxDOB.setFullYear(maxDOB.getFullYear() - 18);
    const maxDOBString = maxDOB.toISOString().split('T')[0];

    const [searchTerm, setSearchTerm] = useState('');
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    // Modal State
    const [openDialog, setOpenDialog] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [dialogTab, setDialogTab] = useState(0);
    const [emailError, setEmailError] = useState('');
    console.log("selectedEmployee", selectedEmployee);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        emergency_contact: '',
        position: '',
        department_id: null,
        role: 'employee',
        gender: '',
        blood_group: '',
        marital_status: '',
        father_name: '',
        education_qualification: '',
        date_of_birth: '',
        date_of_joining: '',
        employment_type: '',
        employee_code: '',
        salary: '',
        user_id: '',
        current_address: '',
        permanent_address: '',
        city: '',
        state: '',
        country: 'India',
        postal_code: '',
        aadhaar_number: '',
        pan_number: '',
        uan_number: '',
        esi_number: '',
        bank_name: '',
        bank_account_number: '',
        bank_ifsc_code: '',
        biometric_id: ''
    });

    // Bank & IFSC Logic
    const [bankList, setBankList] = useState([]);
    const [branchName, setBranchName] = useState('');
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);

    useEffect(() => {
        const fetchBanks = async () => {
            setIsLoadingBanks(true);
            try {
                const response = await fetch('https://raw.githubusercontent.com/razorpay/ifsc/master/src/banknames.json');
                const data = await response.json();
                const banks = [...new Set(Object.values(data))].sort();
                setBankList(banks);
            } catch (error) {
                console.error('Failed to fetch bank list:', error);
            } finally {
                setIsLoadingBanks(false);
            }
        };
        fetchBanks();
    }, []);

    useEffect(() => {
        const fetchBranch = async () => {
            const ifsc = formData.bank_ifsc_code;
            if (ifsc && ifsc.length === 11) {
                try {
                    const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
                    if (response.ok) {
                        const data = await response.json();
                        setBranchName(data.BRANCH || '');
                        // Optionally auto-select bank name if not set
                        if (!formData.bank_name && data.BANK) {
                            setFormData(prev => ({ ...prev, bank_name: data.BANK }));
                        }
                    } else {
                        setBranchName('');
                    }
                } catch (error) {
                    console.error('Failed to fetch branch details:', error);
                    setBranchName('');
                }
            } else {
                setBranchName('');
            }
        };

        const timeoutId = setTimeout(() => {
            fetchBranch();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.bank_ifsc_code]);



    const { data, isLoading, error } = useGetEmployeesQuery({
        search: searchTerm,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
    });
    console.log("employee_data", data);

    const { data: departmentsData } = useGetDepartmentsQuery({ limit: 100 });
    const departments = departmentsData?.departments || [];

    const { data: rolesData } = useGetRolesQuery();
    const roles = rolesData?.data || [];

    const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
    const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
    const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

    // Handlers
    const handleOpenDialog = (employee = null) => {
        setDialogTab(0);
        if (employee) {
            setSelectedEmployee(employee);
            setFormData({
                first_name: employee.first_name || '',
                last_name: employee.last_name || '',
                email: employee.email || '',
                phone: employee.phone || '',
                emergency_contact: employee.emergency_contact || '',
                position: employee.position || '',
                department_id: employee.department_id || null,
                role: employee.role || 'employee',
                gender: employee.gender || '',
                blood_group: employee.blood_group || '',
                marital_status: employee.marital_status || '',
                father_name: employee.father_name || '',
                education_qualification: employee.education_qualification || '',
                date_of_joining: employee.date_of_joining ? employee.date_of_joining.split('T')[0] : '',
                employment_type: employee.employment_type || '',
                employee_code: employee.employee_code || '',
                salary: employee.salary || '',
                user_id: employee.user_id || '',
                date_of_birth: employee.date_of_birth ? employee.date_of_birth.split('T')[0] : '',
                current_address: employee.current_address || '',
                permanent_address: employee.permanent_address || '',
                city: employee.city || '',
                state: employee.state || '',
                country: employee.country || 'India',
                postal_code: employee.postal_code || '',
                aadhaar_number: employee.aadhaar_number || '',
                pan_number: employee.pan_number || '',
                uan_number: employee.uan_number || '',
                esi_number: employee.esi_number || '',
                bank_name: employee.bank_name || '',
                bank_account_number: employee.bank_account_number || '',
                bank_ifsc_code: employee.bank_ifsc_code || '',
                biometric_id: employee.biometric_id || ''
            });
        } else {
            setSelectedEmployee(null);
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                emergency_contact: '',
                position: '',
                department_id: null,
                role: 'employee',
                gender: '',
                blood_group: '',
                marital_status: '',
                father_name: '',
                education_qualification: '',
                date_of_joining: '',
                employment_type: '',
                employee_code: '',
                salary: '',
                user_id: '',
                date_of_birth: '',
                current_address: '',
                permanent_address: '',
                city: '',
                state: '',
                country: 'India',
                postal_code: '',
                aadhaar_number: '',
                pan_number: '',
                uan_number: '',
                esi_number: '',
                bank_name: '',
                bank_account_number: '',
                bank_ifsc_code: '',
                biometric_id: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedEmployee(null);
        setEmailError('');
    };

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

    const handleDeleteClick = (employee) => {
        setSelectedEmployee(employee);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedEmployee) {
            try {
                await deleteEmployee({ id: selectedEmployee.id }).unwrap();
                showSnackbar('Employee deleted successfully', 'success');
                setConfirmDeleteOpen(false);
                setSelectedEmployee(null);
            } catch (err) {
                console.error("Failed to delete employee", err);
                showSnackbar('Failed to delete employee', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email format
        if (!formData.email || !validateEmail(formData.email)) {
            setEmailError('Please enter a valid email address');
            showSnackbar('Please enter a valid email address', 'error');
            return;
        }

        // Construct payload
        const payload = { ...formData };

        // Convert types
        if (payload.salary) {
            payload.salary = parseFloat(payload.salary);
        }

        if (payload.date_of_joining) {
            // Keep as YYYY-MM-DD string as seen in successful SQL insert
            payload.date_of_joining = payload.date_of_joining;
        }

        if (payload.date_of_birth) {
            // Keep as YYYY-MM-DD string as seen in successful SQL insert
            payload.date_of_birth = payload.date_of_birth;
        }

        // Map fields for backend controller
        // Backend expects department_id directly, NOT nested departments object
        if (payload.department_id) {
            payload.department_id = parseInt(payload.department_id);
        }

        if (payload.user_id) {
            payload.user_id = parseInt(payload.user_id);
        }

        if (payload.biometric_id) {
            payload.biometric_id = parseInt(payload.biometric_id);
        } else {
            payload.biometric_id = null;
        }

        // Role will be handled in the update section below if it's an update
        // or ignored if it's a creation (as user creation handles roles)
        const roleToUpdate = payload.role;
        if ('role' in payload) delete payload.role;



        try {
            if (selectedEmployee) {
                // Prepare users relation update
                const userUpdates = {};
                if (roleToUpdate) {
                    userUpdates.role = roleToUpdate;
                }



                if (Object.keys(userUpdates).length > 0) {
                    payload.users = {
                        update: userUpdates
                    };
                }

                await updateEmployee({ id: parseInt(selectedEmployee.id), ...payload }).unwrap();
                showSnackbar('Employee updated successfully', 'success');
            } else {
                await createEmployee(payload).unwrap();
                showSnackbar('Employee created successfully', 'success');
            }
            handleCloseDialog();
        } catch (err) {
            console.error("CREATE_ERROR_DEBUG:", {
                status: err.status,
                data: err.data,
                message: err.data?.error
            });
            showSnackbar(err.data?.error || 'Failed to save employee', 'error');
        }
    };

    const columns = [
        {
            field: 'employee_code',
            headerName: 'EMP CODE',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={800} color="primary.main">
                        {params.value || '- -'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'biometric_id',
            headerName: 'BIO ID',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'first_name',
            headerName: 'FIRST NAME',
            flex: 1,
            minWidth: 160,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={600}>
                        {params.value || '- -'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'last_name',
            headerName: 'LAST NAME',
            flex: 1,
            minWidth: 160,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={600}>
                        {params.value || '- -'}
                    </Typography>
                </Box>
            )
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
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'phone',
            headerName: 'PHONE NUMBER',
            width: 160,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'department_name',
            headerName: 'DEPARTMENT',
            width: 180,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'position',
            headerName: 'DESIGNATION',
            flex: 1,
            minWidth: 200,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'gender',
            headerName: 'GENDER',
            width: 110,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'date_of_joining',
            headerName: 'JOINING DATE',
            width: 160,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const dateVal = params.value;
                const formattedDate = dateVal ? new Date(dateVal).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }) : '- -';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {formattedDate}
                    </Box>
                );
            }
        },
        {
            field: 'role',
            headerName: 'SYSTEM ROLE',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'employment_type',
            headerName: 'EMP TYPE',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'is_active',
            headerName: 'ACCOUNT STATUS',
            width: 160,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Chip
                        label={params.value !== undefined ? (params.value ? 'Active' : 'Inactive') : '- -'}
                        color={params.value !== undefined ? (params.value ? 'success' : 'error') : 'default'}
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
            width: 180,
            align: 'center',
            headerAlign: 'center',
            getActions: (params) => [
                <GridActionsCellItem
                    key={`view-${params.id}`}
                    icon={<Tooltip title="View Profile"><VisibilityIcon fontSize="small" /></Tooltip>}
                    label="View"
                    onClick={() => {
                        navigate(`/employee/profile?userId=${params.row.user_id}`);
                    }}
                    showInMenu={false}
                    sx={{
                        color: 'info.main',
                        border: 1,
                        borderColor: 'info.main',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        mr: 1,
                        '&:hover': { backgroundColor: 'info.light', color: 'white' }
                    }}
                />,
                can('employees', 'update') && <GridActionsCellItem
                    key={`edit-${params.id}`}
                    icon={<Tooltip title="Edit Employee"><EditIcon fontSize="small" /></Tooltip>}
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
                can('employees', 'delete') && <GridActionsCellItem
                    key={`delete-${params.id}`}
                    icon={<Tooltip title="Delete Employee"><DeleteIcon fontSize="small" /></Tooltip>}
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

    // ... (rest of component rendering)

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Employees"
                subtitle="Manage your organization's workforce."
            // action={
            //     can('employees', 'create') && (
            //         <Button
            //             variant="contained"
            //             startIcon={<AddIcon />}
            //             onClick={() => handleOpenDialog()}
            //             sx={{ borderRadius: 2 }}
            //         >
            //             Add Employee
            //         </Button>
            //     )
            // }
            />

            <Card sx={{ overflow: 'hidden', borderRadius: 2, boxShadow: (theme) => theme.shadows[2] }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
                    <TextField
                        placeholder="Search employees..."
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
                        rows={data?.employees || []}
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

            {/* Create/Edit Modal */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography variant="h6" component="div" fontWeight={700}>
                        {selectedEmployee ? 'Edit Employee Details' : 'Add New Employee'}
                    </Typography>
                </DialogTitle>
                <Tabs
                    value={dialogTab}
                    onChange={(e, v) => setDialogTab(v)}
                    variant="fullWidth"
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            py: 2,
                            minHeight: 48
                        }
                    }}
                >
                    <Tab label="Work Details" />
                    <Tab label="Personal Information" />
                    <Tab label="Identity & Banking" />
                </Tabs>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers sx={{ p: 3 }}>
                        {dialogTab === 0 && (
                            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>


                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="First Name *"
                                        required
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        size="small"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Last Name *"
                                        required
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        size="small"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Employee Code *"
                                        required
                                        value={formData.employee_code}
                                        onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                                        size="small"
                                    />
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Email *"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleEmailChange}
                                        size="small"
                                        error={!!emailError}
                                        helperText={emailError || 'Enter a valid email address (e.g., user@example.com)'}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Joining Date"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={formData.date_of_joining}
                                        onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                                        size="small"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Position"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        size="small"
                                    />
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                    <Autocomplete
                                        options={departments}
                                        getOptionLabel={(option) => option.name || ''}
                                        value={departments.find(d => d.id === formData.department_id) || null}
                                        onChange={(event, newValue) => setFormData({ ...formData, department_id: newValue ? newValue.id : null })}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Department"
                                                size="small"
                                            />
                                        )}
                                        size="small"
                                    />
                                    <TextField
                                        select
                                        fullWidth
                                        label="Employment Type"
                                        value={formData.employment_type}
                                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                        size="small"
                                        SelectProps={{ native: true }}
                                    >
                                        <option value=""></option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Intern">Intern</option>
                                    </TextField>
                                    <TextField
                                        select
                                        fullWidth
                                        label="System Role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        size="small"
                                        SelectProps={{ native: true }}
                                    >
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.name.toLowerCase()}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </TextField>
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Salary"
                                        type="number"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        size="small"
                                    />
                                    <Box />
                                    <Box />
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Biometric ID"
                                        type="number"
                                        value={formData.biometric_id}
                                        onChange={(e) => setFormData({ ...formData, biometric_id: e.target.value })}
                                        size="small"
                                        helperText="External biometric device mapping ID"
                                    />
                                    <Box />
                                    <Box />
                                </Box>
                            </Box>
                        )}

                        {dialogTab === 1 && (
                            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        size="small"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Emergency Contact"
                                        value={formData.emergency_contact}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                                        size="small"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Date of Birth"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ max: maxDOBString }}
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        size="small"
                                    />
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Gender"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        size="small"
                                        SelectProps={{ native: true }}
                                    >
                                        <option value=""></option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </TextField>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Blood Group"
                                        value={formData.blood_group}
                                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                        size="small"
                                        SelectProps={{ native: true }}
                                    >
                                        <option value=""></option>
                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </TextField>
                                    <TextField
                                        fullWidth
                                        label="Father's Name"
                                        value={formData.father_name}
                                        onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                                        size="small"
                                    />
                                </Box>

                                <TextField
                                    fullWidth
                                    label="Current Address"
                                    multiline
                                    rows={2}
                                    value={formData.current_address}
                                    onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
                                    size="small"
                                />

                                <TextField
                                    fullWidth
                                    label="Permanent Address"
                                    multiline
                                    rows={2}
                                    value={formData.permanent_address}
                                    onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                                    size="small"
                                />

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="City"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        size="small"
                                    />
                                    <TextField
                                        fullWidth
                                        label="State"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        size="small"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Postal Code"
                                        value={formData.postal_code}
                                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                        )}

                        {dialogTab === 2 && (
                            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Aadhaar Number"
                                        value={formData.aadhaar_number}
                                        onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value })}
                                        size="small"
                                        placeholder="XXXX-XXXX-XXXX"
                                    />
                                    <TextField
                                        fullWidth
                                        label="PAN Number"
                                        value={formData.pan_number}
                                        onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                                        size="small"
                                        placeholder="ABCDE1234F"
                                    />
                                    <TextField
                                        fullWidth
                                        label="UAN Number"
                                        value={formData.uan_number}
                                        onChange={(e) => setFormData({ ...formData, uan_number: e.target.value })}
                                        size="small"
                                    />
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="ESI Number"
                                        value={formData.esi_number}
                                        onChange={(e) => setFormData({ ...formData, esi_number: e.target.value })}
                                        size="small"
                                    />
                                    <Box />
                                    <Box />
                                </Box>

                                <Box sx={{ mt: 1, p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'primary.dark', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        Bank Account Information
                                    </Typography>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                        <Autocomplete
                                            fullWidth
                                            options={bankList}
                                            value={formData.bank_name || ''}
                                            onChange={(e, newValue) => {
                                                setFormData({
                                                    ...formData,
                                                    bank_name: newValue || ''
                                                });
                                            }}
                                            loading={isLoadingBanks}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Bank Name"
                                                    size="small"
                                                />
                                            )}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Account Number"
                                            value={formData.bank_account_number}
                                            onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                                            size="small"
                                        />
                                        <TextField
                                            fullWidth
                                            label="IFSC Code"
                                            value={formData.bank_ifsc_code}
                                            onChange={(e) => {
                                                const val = e.target.value.toUpperCase();
                                                setFormData({ ...formData, bank_ifsc_code: val });
                                            }}
                                            size="small"
                                            inputProps={{ maxLength: 11 }}
                                            helperText={branchName ? `Branch: ${branchName}` : ""}
                                            FormHelperTextProps={{ sx: { color: 'success.main', fontWeight: 600 } }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Button
                            onClick={handleCloseDialog}
                            variant="outlined"
                            color="inherit"
                            sx={{ borderRadius: 1 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isCreating || isUpdating}
                            sx={{ minWidth: 100, borderRadius: 1 }}
                        >
                            {isCreating || isUpdating ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                selectedEmployee ? 'Update Employee' : 'Create Employee'
                            )}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Employee"
                message={`Are you sure you want to delete employee ${selectedEmployee?.first_name} ${selectedEmployee?.last_name || ''}? This action cannot be undone.`}
                loading={isDeleting}
            />

            <CustomSnackbar
                open={snackbar.open}
                onClose={hideSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />

            {
                error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Failed to load employees
                    </Alert>
                )
            }
        </Box >
    );
};

export default Employees;
