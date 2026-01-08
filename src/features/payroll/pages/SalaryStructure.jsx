import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    InputAdornment,
    Alert,
    Chip,
    IconButton,
    Tooltip,
    Paper,
    alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import { DataGrid } from '@mui/x-data-grid';
import {
    Add,
    Edit,
    AccountBalance,
    Home,
    DirectionsCar,
    LocalHospital,
    CardGiftcard,
    TrendingUp,
} from '@mui/icons-material';
import { useUpdateSalaryStructureMutation } from '../store/payrollApi';
import { useGetEmployeesQuery } from '../../employees/store/employeeApi';
import { usePermissions } from '../../../hooks/usePermissions';
import PageHeader from '../../../components/common/PageHeader';
import { format } from 'date-fns';

const SalaryStructure = () => {
    const theme = useTheme();
    const { can } = usePermissions();
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    // API Hooks
    const { data: employeesData, isLoading } = useGetEmployeesQuery();
    const [updateSalaryStructure, { isLoading: isUpdating }] = useUpdateSalaryStructureMutation();

    // State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        basic_salary: '',
        hra: '',
        conveyance: '',
        medical_allowance: '',
        special_allowance: '',
        effective_from: format(new Date(), 'yyyy-MM-dd'),
    });

    // Calculate totals
    const calculateGross = () => {
        const basic = parseFloat(formData.basic_salary) || 0;
        const hra = parseFloat(formData.hra) || 0;
        const conveyance = parseFloat(formData.conveyance) || 0;
        const medical = parseFloat(formData.medical_allowance) || 0;
        const special = parseFloat(formData.special_allowance) || 0;
        return basic + hra + conveyance + medical + special;
    };

    // Handlers
    const handleOpenDialog = (employee = null) => {
        if (employee) {
            setSelectedEmployee(employee);
            setFormData({
                basic_salary: employee.salary_structures?.basic_salary || '',
                hra: employee.salary_structures?.hra || '',
                conveyance: employee.salary_structures?.conveyance || '',
                medical_allowance: employee.salary_structures?.medical_allowance || '',
                special_allowance: employee.salary_structures?.special_allowance || '',
                effective_from: employee.salary_structures?.effective_from
                    ? format(new Date(employee.salary_structures.effective_from), 'yyyy-MM-dd')
                    : format(new Date(), 'yyyy-MM-dd'),
            });
        } else {
            setSelectedEmployee(null);
            setFormData({
                basic_salary: '',
                hra: '',
                conveyance: '',
                medical_allowance: '',
                special_allowance: '',
                effective_from: format(new Date(), 'yyyy-MM-dd'),
            });
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!selectedEmployee) {
            showSnackbar('Please select an employee', 'error');
            return;
        }

        if (!formData.basic_salary || parseFloat(formData.basic_salary) <= 0) {
            showSnackbar('Basic salary is required and must be greater than 0', 'error');
            return;
        }

        try {
            await updateSalaryStructure({
                employee_id: selectedEmployee.id,
                ...formData,
            }).unwrap();
            showSnackbar('Salary structure updated successfully', 'success');
            setDialogOpen(false);
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to update salary structure', 'error');
        }
    };

    // DataGrid columns
    const columns = [
        {
            field: 'employee',
            headerName: 'EMPLOYEE',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={700}>
                        {params.row.first_name} {params.row.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.employee_code}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'basic_salary',
            headerName: 'BASIC',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600}>
                    ₹{Number(params.row.salary_structures?.basic_salary || 0).toLocaleString('en-IN')}
                </Typography>
            )
        },
        {
            field: 'hra',
            headerName: 'HRA',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Typography variant="body2">
                    ₹{Number(params.row.salary_structures?.hra || 0).toLocaleString('en-IN')}
                </Typography>
            )
        },
        {
            field: 'allowances',
            headerName: 'ALLOWANCES',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => {
                const conveyance = parseFloat(params.row.salary_structures?.conveyance || 0);
                const medical = parseFloat(params.row.salary_structures?.medical_allowance || 0);
                const special = parseFloat(params.row.salary_structures?.special_allowance || 0);
                const total = conveyance + medical + special;
                return (
                    <Typography variant="body2">
                        ₹{total.toLocaleString('en-IN')}
                    </Typography>
                );
            }
        },
        {
            field: 'gross',
            headerName: 'GROSS SALARY',
            width: 150,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => {
                const basic = parseFloat(params.row.salary_structures?.basic_salary || 0);
                const hra = parseFloat(params.row.salary_structures?.hra || 0);
                const conveyance = parseFloat(params.row.salary_structures?.conveyance || 0);
                const medical = parseFloat(params.row.salary_structures?.medical_allowance || 0);
                const special = parseFloat(params.row.salary_structures?.special_allowance || 0);
                const gross = basic + hra + conveyance + medical + special;
                return (
                    <Typography variant="body2" fontWeight={700} color="success.main">
                        ₹{gross.toLocaleString('en-IN')}
                    </Typography>
                );
            }
        },
        {
            field: 'effective_from',
            headerName: 'EFFECTIVE FROM',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Typography variant="caption" color="text.secondary">
                    {params.row.salary_structures?.effective_from
                        ? format(new Date(params.row.salary_structures.effective_from), 'dd MMM, yyyy')
                        : '-'}
                </Typography>
            )
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => (
                can('payroll', 'manage') && (
                    <Tooltip title="Edit Salary">
                        <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(params.row)}
                            sx={{ color: 'primary.main' }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )
            )
        },
    ];

    const grossSalary = calculateGross();

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Salary Structure Management"
                subtitle="Configure employee salary components and allowances"
            />

            {/* Salary Components Info */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <AccountBalance sx={{ fontSize: 24, color: 'primary.main', mr: 1 }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    BASIC SALARY
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Base pay component
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Home sx={{ fontSize: 24, color: 'info.main', mr: 1 }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    HRA
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                House Rent Allowance
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <DirectionsCar sx={{ fontSize: 24, color: 'warning.main', mr: 1 }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    CONVEYANCE
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Transport allowance
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocalHospital sx={{ fontSize: 24, color: 'error.main', mr: 1 }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    MEDICAL
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Medical allowance
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CardGiftcard sx={{ fontSize: 24, color: 'success.main', mr: 1 }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    SPECIAL
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Special allowance
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Employees Table */}
            <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800}>Employee Salary Structures</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {employeesData?.employees?.length || 0} EMPLOYEES
                    </Typography>
                </Box>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{
                        height: 600,
                        width: '100%',
                        '& .MuiDataGrid-root': {
                            border: 'none',
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                fontSize: '0.875rem',
                                '&:focus, &:focus-within': { outline: 'none' }
                            },
                            '& .MuiDataGrid-columnHeader': {
                                backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                                color: 'text.secondary',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                '&:focus, &:focus-within': { outline: 'none' }
                            },
                        }
                    }}>
                        <DataGrid
                            rows={employeesData?.employees || []}
                            columns={columns}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            pageSizeOptions={[10, 25, 50]}
                            disableRowSelectionOnClick
                            density="comfortable"
                            rowHeight={70}
                            columnHeaderHeight={48}
                            loading={isLoading}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={800}>
                            {selectedEmployee ? 'Edit Salary Structure' : 'Add Salary Structure'}
                        </Typography>
                        {selectedEmployee && (
                            <Chip
                                label={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                                color="primary"
                                size="small"
                            />
                        )}
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            Configure salary components. Gross Salary = Basic + HRA + Conveyance + Medical + Special
                        </Typography>
                    </Alert>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Basic Salary *"
                                type="number"
                                value={formData.basic_salary}
                                onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                                fullWidth
                                required
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="HRA (House Rent Allowance)"
                                type="number"
                                value={formData.hra}
                                onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Conveyance Allowance"
                                type="number"
                                value={formData.conveyance}
                                onChange={(e) => setFormData({ ...formData, conveyance: e.target.value })}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Medical Allowance"
                                type="number"
                                value={formData.medical_allowance}
                                onChange={(e) => setFormData({ ...formData, medical_allowance: e.target.value })}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Special Allowance"
                                type="number"
                                value={formData.special_allowance}
                                onChange={(e) => setFormData({ ...formData, special_allowance: e.target.value })}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Effective From"
                                type="date"
                                value={formData.effective_from}
                                onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>

                    {/* Gross Salary Display */}
                    <Paper
                        sx={{
                            mt: 3,
                            p: 3,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            borderRadius: 2,
                            border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TrendingUp sx={{ fontSize: 32, color: 'success.main', mr: 1 }} />
                                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                                    GROSS SALARY (MONTHLY)
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={800} color="success.main">
                                ₹{grossSalary.toLocaleString('en-IN')}
                            </Typography>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        disabled={isUpdating}
                        sx={{ textTransform: 'none' }}
                    >
                        {isUpdating ? 'Saving...' : 'Save Structure'}
                    </Button>
                </DialogActions>
            </Dialog>

            <CustomSnackbar
                open={snackbar.open}
                onClose={hideSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Box>
    );
};

export default SalaryStructure;
