// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid
} from '@mui/material';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import { DataGrid } from '@mui/x-data-grid';
import { PlayArrow, Receipt, Edit } from '@mui/icons-material';
import {
    useRunPayrollMutation,
    useGetPayrollRunsQuery,
    useGetStatutoryRulesQuery,
    useUpdateStatutoryRuleMutation
} from '../../payroll/store/payrollApi';
import { format } from 'date-fns';

import { usePermissions } from '../../../hooks/usePermissions';
import PageHeader from '../../../components/common/PageHeader';

const Payroll = () => {
    const { can } = usePermissions();
    const { data: runsData, isLoading } = useGetPayrollRunsQuery();
    const { data: rulesData, isLoading: isLoadingRules } = useGetStatutoryRulesQuery();
    const [runPayroll, { isLoading: isRunning }] = useRunPayrollMutation();
    const [updateRule, { isLoading: isUpdatingRule }] = useUpdateStatutoryRuleMutation();

    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMMM'));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [newValue, setNewValue] = useState('');

    const handleRunPayroll = async () => {
        try {
            await runPayroll({ month: selectedMonth, year: selectedYear }).unwrap();
            showSnackbar('Payroll processed successfully!', 'success');
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to run payroll', 'error');
        }
    };

    const handleEditRule = (rule) => {
        setEditingRule(rule);
        setNewValue(rule.value);
        setOpenDialog(true);
    };

    const handleSaveRule = async () => {
        try {
            await updateRule({ rule_name: editingRule.rule_name, value: newValue }).unwrap();
            setOpenDialog(false);
            showSnackbar('Statutory rule updated successfully', 'success');
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to update rule', 'error');
        }
    };

    const columns = [
        {
            field: 'month',
            headerName: 'MONTH',
            flex: 1,
            minWidth: 150,
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
            field: 'year',
            headerName: 'YEAR',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {params.value || '- -'}
                </Box>
            )
        },
        {
            field: 'total_payout',
            headerName: 'TOTAL PAYOUT',
            flex: 1.5,
            minWidth: 200,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <Typography variant="body2" fontWeight={700}>
                        ₹{Number(params.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Chip
                        label={params.value?.toUpperCase() || 'UNKNOWN'}
                        color={params.value === 'Processed' ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.65rem', minWidth: 100 }}
                    />
                </Box>
            )
        },
        {
            field: 'created_at',
            headerName: 'PROCESSED ON',
            width: 250,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const dateStr = params.value ? format(new Date(params.value), 'dd MMM, yyyy • hh:mm a') : '- -';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {dateStr}
                    </Box>
                );
            }
        }
    ];

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Payroll Management"
                subtitle="Process monthly salaries, manage statutory rules, and track payout history."
            />



            <Grid container spacing={3} sx={{ mb: 4 }}>
                {can('payroll', 'create') && (
                    <Grid item xs={12} md={8}>
                        <Card sx={{ borderRadius: 2, boxShadow: (theme) => theme.shadows[2], height: '100%' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h6" fontWeight="800" gutterBottom sx={{ mb: 3 }}>
                                    Process New Payroll
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                                    <TextField
                                        select
                                        label="Selection Month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        fullWidth
                                        size="medium"
                                        sx={{
                                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                            bgcolor: 'background.paper'
                                        }}
                                    >
                                        {months.map((m) => (
                                            <MenuItem key={m} value={m}>{m}</MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        select
                                        label="Financial Year"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        fullWidth
                                        size="medium"
                                        sx={{
                                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                            bgcolor: 'background.paper'
                                        }}
                                    >
                                        {[2024, 2025, 2026].map((y) => (
                                            <MenuItem key={y} value={y}>{y}</MenuItem>
                                        ))}
                                    </TextField>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    startIcon={<PlayArrow />}
                                    onClick={handleRunPayroll}
                                    disabled={isRunning}
                                    sx={{
                                        textTransform: 'uppercase',
                                        px: 6,
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 800,
                                        letterSpacing: 1,
                                        boxShadow: (theme) => theme.shadows[4]
                                    }}
                                >
                                    {isRunning ? 'Processing...' : 'Execute Payroll'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                <Grid item xs={12} md={4}>
                    <Card sx={{
                        borderRadius: 2,
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        boxShadow: (theme) => theme.shadows[10],
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            opacity: 0.1,
                            transform: 'rotate(-20deg)'
                        }}>
                            <Receipt sx={{ fontSize: 180 }} />
                        </Box>
                        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight="800" sx={{ color: 'white', textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Statutory Rules
                                </Typography>
                            </Box>

                            {isLoadingRules ? (
                                <CircularProgress color="inherit" size={30} />
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {rulesData?.rules?.map((rule) => (
                                        <Box
                                            key={rule.id}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                p: 2,
                                                borderRadius: 2,
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase' }}>
                                                    {rule.rule_name.replace(/_/g, ' ')}
                                                </Typography>
                                                <Typography variant="h6" fontWeight="800" sx={{ color: 'white' }}>
                                                    {rule.value}%
                                                </Typography>
                                            </Box>
                                            {can('payroll', 'update') && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditRule(rule)}
                                                    sx={{
                                                        color: 'white',
                                                        bgcolor: 'rgba(255,255,255,0.2)',
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                                    }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    ))}
                                    {!rulesData?.rules?.length && (
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                            No statutory rules found.
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Card sx={{ borderRadius: 2, boxShadow: (theme) => theme.shadows[2], overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="800">Payout History</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>ARCHIVED PAYROLL RUNS</Typography>
                </Box>
                <CardContent sx={{ p: 0 }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{
                            height: 500,
                            width: '100%',
                            '& .MuiDataGrid-root': {
                                border: 'none',
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
                                rows={runsData?.runs || []}
                                columns={columns}
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10 } },
                                }}
                                pageSizeOptions={[10, 25]}
                                disableRowSelectionOnClick
                                density="compact"
                                rowHeight={52}
                                columnHeaderHeight={48}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Edit Rule Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Edit Statutory Value</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        {editingRule?.description || editingRule?.rule_name}
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Value"
                        type="number"
                        fullWidth
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveRule}
                        variant="contained"
                        color="primary"
                        disabled={isUpdatingRule}
                        sx={{ textTransform: 'none' }}
                    >
                        Save
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

export default Payroll;