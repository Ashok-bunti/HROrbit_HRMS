import React from 'react';
import { Box, Typography, Button, Divider, Paper } from '@mui/material';
import {
    Download,
    AccountBalanceWallet,
    HomeWork,
    Payments,
    IndeterminateCheckBox,
    Schedule
} from '@mui/icons-material';
import { format } from 'date-fns';

const SalaryWidget = ({ salary }) => {
    // Helper to format currency
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '₹0';
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    };

    const hasData = salary && Object.keys(salary).length > 2; // Basic check if its more than just default cycle info

    const data = {
        lastPaid: formatCurrency(salary?.net_salary || 0),
        payMonth: salary?.month && salary?.year ? `${salary.month} ${salary.year}` : 'No Record',
        nextPayDate: 'Next cycle pending',
        breakdown: [
            { label: 'Basic Salary', value: formatCurrency(salary?.basic_salary || 0), icon: <AccountBalanceWallet sx={{ fontSize: 16 }} /> },
            { label: 'HRA', value: formatCurrency(salary?.hra || 0), icon: <HomeWork sx={{ fontSize: 16 }} /> },
            { label: 'Allowances', value: formatCurrency(salary?.allowances || 0), icon: <Payments sx={{ fontSize: 16 }} /> },
            { label: 'Deductions', value: `-${formatCurrency(salary?.total_deductions || 0)}`, color: 'error.main', icon: <IndeterminateCheckBox sx={{ fontSize: 16 }} /> },
        ],
        netPay: formatCurrency(salary?.net_salary || 0),
        status: salary?.payment_status || 'Unpaid'
    };

    return (
        <Paper elevation={0} sx={{
            p: 2.5,
            bgcolor: 'background.paper',
            borderRadius: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            border: '1px solid',
            borderColor: 'divider',
        }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: 'text.primary', letterSpacing: '-0.2px' }}>
                    Salary Overview
                </Typography>
                <Button
                    size="small"
                    startIcon={<Download sx={{ fontSize: 16 }} />}
                    href="/employee/payslips"
                    sx={{
                        color: 'primary.main',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        bgcolor: 'primary.light',
                        px: 1.5,
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.12)' }
                    }}
                >
                    Payslips
                </Button>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Main Stats Area */}
                <Box sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'primary.light',
                    border: '1px solid rgba(79, 70, 229, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', mb: 0.5 }}>
                        Cycle: {data.payMonth}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1px' }}>
                            {data.lastPaid}
                        </Typography>
                        <Box sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: data.status === 'Paid' ? 'success.light' : 'warning.light',
                            color: 'text.primary',
                            fontSize: '0.65rem',
                            fontWeight: 800
                        }}>
                            {data.status.toUpperCase()}
                        </Box>
                    </Box>
                </Box>

                {/* Breakdown List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    {data.breakdown.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ color: 'text.disabled', display: 'flex' }}>
                                    {item.icon}
                                </Box>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.85rem' }}>
                                    {item.label}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: item.color || 'text.primary', fontSize: '0.85rem' }}>
                                {item.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Divider sx={{ borderStyle: 'dashed', opacity: 0.5 }} />

                {/* Net Payable Highlight */}
                <Box sx={{
                    p: 1.5,
                    px: 2,
                    borderRadius: 2.5,
                    bgcolor: 'background.default',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 'auto'
                }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem' }}>
                        Net Payable
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                        {data.netPay}
                    </Typography>
                </Box>
            </Box>

            {/* Footer / Next Delivery */}
            <Box sx={{
                mt: 2,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
            }}>
                <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'warning.main'
                }}>
                    <Schedule sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', fontWeight: 600, fontSize: '0.65rem' }}>
                        LAST UPDATED
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
                        {salary?.generated_at ? format(new Date(salary.generated_at), 'MMMM dd, yyyy') : 'No date'}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default SalaryWidget;
