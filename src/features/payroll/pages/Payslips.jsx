import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { Visibility, Download } from '@mui/icons-material';
import { useGetEmployeePayslipsQuery, useGetPayslipByIdQuery } from '../../payroll/store/payrollApi';
import { useAuth } from '../../../context/AuthContext';

const PayslipView = ({ payslipId, open, onClose }) => {
    const { data, isLoading } = useGetPayslipByIdQuery(payslipId, { skip: !payslipId });
    const payslip = data?.payslip;

    if (!open) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 1,
                    maxWidth: 650,
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{ pb: 2, pt: 3, px: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600}>
                    Payslip - {payslip?.month} {payslip?.year}
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ px: 4, py: 3, overflow: 'hidden', '&.MuiDialogContent-dividers': { borderTop: 'none', borderBottom: 'none' } }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : payslip ? (
                    <Box id="payslip-content">
                        <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
                                    Employee Name
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {payslip.first_name} {payslip.last_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mt: 2, display: 'block', mb: 0.5 }}>
                                    Designation
                                </Typography>
                                <Typography variant="body1">
                                    {payslip.designation}
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
                                    Employee Code
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {payslip.employee_code}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mt: 2, display: 'block', mb: 0.5 }}>
                                    Department
                                </Typography>
                                <Typography variant="body1">
                                    {payslip.department}
                                </Typography>
                            </Box>
                        </Box>



                        <Box sx={{ display: 'flex', gap: 4 , mt:4}}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" gutterBottom color="success.main" fontWeight={600} sx={{ mb: 2 }}>
                                    Earnings
                                </Typography>
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">Basic Salary</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            ₹{Number(payslip.basic_salary).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">HRA</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            ₹{Number(payslip.hra).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">Allowances</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            ₹{Number(payslip.allowances).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" fontWeight={600} color="text.secondary">Gross Salary</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            ₹{Number(payslip.gross_salary).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" gutterBottom color="error.main" fontWeight={600} sx={{ mb: 2 }}>
                                    Deductions
                                </Typography>
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">Provident Fund (PF)</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            ₹{Number(payslip.pf_deduction).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">ESI</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            ₹{Number(payslip.esi_deduction).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">Professional Tax</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            ₹{Number(payslip.pt_deduction).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">TDS</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            ₹{Number(payslip.tds_deduction).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" fontWeight={600} color="text.secondary">Total Deductions</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            ₹{Number(payslip.total_deductions).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                      <Box
  sx={{
    mt: 4,
    p: 1.5,
    bgcolor: 'primary.light',
    borderRadius: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.5,
  }}
>
  <Typography variant="body2" color="text.secondary" fontWeight={500}>
    Net Pay:
  </Typography>

  <Typography variant="h5" fontWeight={700} color="primary.main">
    ₹{Number(payslip.net_salary).toLocaleString()}
  </Typography>
</Box>

                    </Box>
                ) : (
                    <Typography>No details found</Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 4, py: 2.5, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                    onClick={onClose} 
                    sx={{ 
                        color: 'primary.main',
                        textTransform: 'none',
                        fontWeight: 500
                    }}
                >
                    Close
                </Button>
                <Button 
                    startIcon={<Download />} 
                    variant="contained" 
                    onClick={() => window.print()}
                    sx={{ 
                        bgcolor: 'primary.main',
                        textTransform: 'none',
                        borderRadius: 1,
                        px: 3,
                        fontWeight: 600,
                        '&:hover': {
                            bgcolor: 'primary.dark'
                        }
                    }}
                >
                    Print / Download
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const Payslips = () => {
    const { user } = useAuth();
    const { data, isLoading } = useGetEmployeePayslipsQuery(user?.employeeId || user?.id);
    const [selectedPayslipId, setSelectedPayslipId] = useState(null);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                My Payslips
            </Typography>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {data?.payslips?.map((payslip) => (
                        <Grid item xs={12} sm={6} md={4} key={payslip.id}>
                            <Card 
                                sx={{ 
                                    borderRadius: 1,
                                    boxShadow: 'none',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'box-shadow 0.3s ease',
                                    backgroundColor: 'background.default',
                                   
                                }}
                            >
                                <CardContent sx={{ p: 3.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1 }}>
                                        <Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.9rem' }} color="text.primary">
                                            {payslip.month} {payslip.year}
                                        </Typography>
                                        <Chip
                                            label={payslip.payment_status}
                                            size="small"
                                            color={payslip.payment_status === 'Paid' ? 'success' : 'warning'}
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '0.7rem',
                                                height: 22,
                                                borderRadius: 1.5,
                                                px: 1.2,
                                                minWidth: 'auto'
                                            }}
                                        />
                                    </Box>
                                    <Typography 
                                        variant="h4" 
                                        fontWeight={700} 
                                        color="primary.main" 
                                        sx={{ mb: 0.5, fontSize: '1.65rem' }}
                                    >
                                        ₹{Number(payslip.net_salary).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.85rem' }}>
                                        Gross: ₹{Number(payslip.gross_salary).toLocaleString()}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Visibility />}
                                        fullWidth
                                        onClick={() => setSelectedPayslipId(payslip.id)}
                                        sx={{ 
                                            borderColor: 'primary.main',
                                            color: 'primary.main',
                                            textTransform: 'none',
                                            borderRadius: 1,
                                            py: 0.75,
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                           
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    {data?.payslips?.length === 0 && (
                        <Grid item xs={12}>
                            <Alert severity="info">No payslips available yet.</Alert>
                        </Grid>
                    )}
                </Grid>
            )}

            <PayslipView
                payslipId={selectedPayslipId}
                open={!!selectedPayslipId}
                onClose={() => setSelectedPayslipId(null)}
            />
        </Box>
    );
};

export default Payslips;