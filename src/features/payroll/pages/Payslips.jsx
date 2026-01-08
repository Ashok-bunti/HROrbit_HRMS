import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Grid,
    useMediaQuery,
    Stack,
    InputAdornment,
    Chip,
    IconButton,
    Tooltip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import { DataGrid } from '@mui/x-data-grid';
import {
    Search,
    Visibility,
    Download,
    Receipt,
    TrendingUp,
    TrendingDown,
    CalendarToday,
    Person,
} from '@mui/icons-material';
import { useGetEmployeePayslipsQuery, useGetPayslipByIdQuery } from '../store/payrollApi';
import { useGetEmployeesQuery } from '../../employees/store/employeeApi';
import { format } from 'date-fns';
import PageHeader from '../../../components/common/PageHeader';

const Payslips = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    // State
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

    // API Hooks
    const { data: employeesData } = useGetEmployeesQuery();
    const { data: payslipsData, isLoading } = useGetEmployeePayslipsQuery(selectedEmployee, {
        skip: !selectedEmployee,
    });

    // Filter payslips
    const filteredPayslips = (payslipsData?.payslips || []).filter(payslip =>
        (payslip.month && payslip.month.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payslip.year && payslip.year.toString().includes(searchTerm))
    );

    // Handlers
    const handleViewDetails = (payslip) => {
        setSelectedPayslip(payslip);
        setDetailsDialogOpen(true);
    };

    // DataGrid columns
    const columns = [
        {
            field: 'period',
            headerName: 'PERIOD',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                        {params.row.month} {params.row.year}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.total_working_days || 0} working days
                    </Typography>
                </Box>
            )
        },
        {
            field: 'gross_salary',
            headerName: 'GROSS',
            width: 140,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600}>
                    ₹{Number(params.value || 0).toLocaleString('en-IN')}
                </Typography>
            )
        },
        {
            field: 'total_deductions',
            headerName: 'DEDUCTIONS',
            width: 140,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="error.main">
                    -₹{Number(params.value || 0).toLocaleString('en-IN')}
                </Typography>
            )
        },
        {
            field: 'net_salary',
            headerName: 'NET SALARY',
            width: 150,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={700} color="success.main">
                    ₹{Number(params.value || 0).toLocaleString('en-IN')}
                </Typography>
            )
        },
        {
            field: 'payment_status',
            headerName: 'STATUS',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value || 'Pending'}
                    color={params.value === 'Paid' ? 'success' : 'warning'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="View Details">
                        <IconButton
                            size="small"
                            onClick={() => handleViewDetails(params.row)}
                            sx={{ color: 'primary.main' }}
                        >
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Download PDF">
                        <IconButton
                            size="small"
                            sx={{ color: 'success.main' }}
                        >
                            <Download fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        },
    ];

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Employee Payslips"
                subtitle="View detailed salary breakdowns and download payslips"
            />

            {/* Filters */}
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], mb: 4 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Select Employee"
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                fullWidth
                                size="medium"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                    bgcolor: 'background.paper'
                                }}
                            >
                                <MenuItem value="">
                                    <em>Select an employee</em>
                                </MenuItem>
                                {employeesData?.employees?.map((emp) => (
                                    <MenuItem key={emp.id} value={emp.id}>
                                        {emp.first_name} {emp.last_name} ({emp.employee_code})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                placeholder="Search by month or year..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                fullWidth
                                size="medium"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2 }
                                }}
                                sx={{ bgcolor: 'background.paper' }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            {selectedEmployee && payslipsData?.payslips?.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            TOTAL PAYSLIPS
                                        </Typography>
                                        <Typography variant="h4" fontWeight={800} color="primary.main">
                                            {payslipsData.payslips.length}
                                        </Typography>
                                    </Box>
                                    <Receipt sx={{ fontSize: 48, color: 'primary.main', opacity: 0.2 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            AVG GROSS
                                        </Typography>
                                        <Typography variant="h4" fontWeight={800} color="info.main">
                                            ₹{Math.round(
                                                payslipsData.payslips.reduce((sum, p) => sum + parseFloat(p.gross_salary || 0), 0) / payslipsData.payslips.length
                                            ).toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                    <TrendingUp sx={{ fontSize: 48, color: 'info.main', opacity: 0.2 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            AVG DEDUCTIONS
                                        </Typography>
                                        <Typography variant="h4" fontWeight={800} color="error.main">
                                            ₹{Math.round(
                                                payslipsData.payslips.reduce((sum, p) => sum + parseFloat(p.total_deductions || 0), 0) / payslipsData.payslips.length
                                            ).toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                    <TrendingDown sx={{ fontSize: 48, color: 'error.main', opacity: 0.2 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            AVG NET
                                        </Typography>
                                        <Typography variant="h4" fontWeight={800} color="success.main">
                                            ₹{Math.round(
                                                payslipsData.payslips.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0) / payslipsData.payslips.length
                                            ).toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                    <CalendarToday sx={{ fontSize: 48, color: 'success.main', opacity: 0.2 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Payslips Table */}
            <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800}>Payslip History</Typography>
                    {selectedEmployee && (
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {filteredPayslips.length} PAYSLIPS
                        </Typography>
                    )}
                </Box>
                <CardContent sx={{ p: 0 }}>
                    {!selectedEmployee ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Receipt sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                Select an employee to view payslips
                            </Typography>
                        </Box>
                    ) : isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredPayslips.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="body1" color="text.secondary">
                                No payslips found for this employee
                            </Typography>
                        </Box>
                    ) : (
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
                                rows={filteredPayslips}
                                columns={columns}
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10 } },
                                }}
                                pageSizeOptions={[10, 25, 50]}
                                disableRowSelectionOnClick
                                density="comfortable"
                                rowHeight={70}
                                columnHeaderHeight={48}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Payslip Details Dialog */}
            <PayslipDetailsDialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                payslip={selectedPayslip}
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

// Payslip Details Dialog Component
const PayslipDetailsDialog = ({ open, onClose, payslip }) => {
    const theme = useTheme();

    if (!payslip) return null;

    const earnings = [
        { label: 'Basic Salary', value: payslip.basic_salary },
        { label: 'HRA', value: payslip.hra },
        { label: 'Other Allowances', value: payslip.allowances },
    ];

    const deductions = [
        { label: 'PF', value: payslip.pf_deduction },
        { label: 'ESI', value: payslip.esi_deduction },
        { label: 'Professional Tax', value: payslip.pt_deduction },
        { label: 'TDS', value: payslip.tds_deduction },
        { label: 'LOP', value: payslip.lop_deduction },
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800}>
                        Payslip Details
                    </Typography>
                    <Chip
                        label={`${payslip.month} ${payslip.year}`}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                    />
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {/* Attendance Summary */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                        Attendance Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Working Days</Typography>
                            <Typography variant="h6" fontWeight={700}>{payslip.total_working_days || 0}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Present</Typography>
                            <Typography variant="h6" fontWeight={700} color="success.main">{payslip.present_days || 0}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Paid Leaves</Typography>
                            <Typography variant="h6" fontWeight={700} color="info.main">{payslip.paid_leaves || 0}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Unpaid Leaves</Typography>
                            <Typography variant="h6" fontWeight={700} color="error.main">{payslip.unpaid_leaves || 0}</Typography>
                        </Grid>
                    </Grid>
                </Paper>

                <Grid container spacing={3}>
                    {/* Earnings */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2, height: '100%' }}>
                            <Typography variant="subtitle2" fontWeight={700} gutterBottom color="success.main">
                                Earnings
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableBody>
                                        {earnings.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.label}</TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600}>
                                                        ₹{Number(item.value || 0).toLocaleString('en-IN')}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell><strong>Gross Salary</strong></TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={800} color="success.main">
                                                    ₹{Number(payslip.gross_salary || 0).toLocaleString('en-IN')}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>

                    {/* Deductions */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 2, height: '100%' }}>
                            <Typography variant="subtitle2" fontWeight={700} gutterBottom color="error.main">
                                Deductions
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableBody>
                                        {deductions.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.label}</TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600}>
                                                        ₹{Number(item.value || 0).toLocaleString('en-IN')}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell><strong>Total Deductions</strong></TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={800} color="error.main">
                                                    ₹{Number(payslip.total_deductions || 0).toLocaleString('en-IN')}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Net Salary */}
                <Paper
                    sx={{
                        mt: 3,
                        p: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: 2,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={800}>
                            NET SALARY (Take Home)
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="primary.main">
                            ₹{Number(payslip.net_salary || 0).toLocaleString('en-IN')}
                        </Typography>
                    </Box>
                </Paper>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">Close</Button>
                <Button variant="contained" startIcon={<Download />}>
                    Download PDF
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default Payslips;