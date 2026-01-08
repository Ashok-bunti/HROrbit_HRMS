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
    Alert,
    IconButton,
    Tooltip,
    Paper,
    alpha,
    Chip,
    Tabs,
    Tab,
    CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import {
    Edit,
    AccountBalance,
    LocalHospital,
    Gavel,
    Receipt,
    Info,
} from '@mui/icons-material';
import {
    useGetStatutoryRulesQuery,
    useUpdateStatutoryRuleMutation,
} from '../store/payrollApi';
import { usePermissions } from '../../../hooks/usePermissions';
import PageHeader from '../../../components/common/PageHeader';

const StatutoryRules = () => {
    const theme = useTheme();
    const { can } = usePermissions();
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    // API Hooks
    const { data: rulesData, isLoading } = useGetStatutoryRulesQuery();
    const [updateRule, { isLoading: isUpdating }] = useUpdateStatutoryRuleMutation();

    // State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState(null);
    const [newValue, setNewValue] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    // Filter rules by type
    const pfRules = rulesData?.rules?.filter(r => r.rule_type === 'PF') || [];
    const esiRules = rulesData?.rules?.filter(r => r.rule_type === 'ESI') || [];
    const ptRules = rulesData?.rules?.filter(r => r.rule_type === 'PT') || [];
    const tdsRules = rulesData?.rules?.filter(r => r.rule_type === 'TDS') || [];

    // Handlers
    const handleOpenDialog = (rule) => {
        setSelectedRule(rule);
        setNewValue(rule.value || '');
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!newValue || parseFloat(newValue) < 0) {
            showSnackbar('Please enter a valid value', 'error');
            return;
        }

        try {
            await updateRule({
                rule_name: selectedRule.rule_name,
                value: parseFloat(newValue),
            }).unwrap();
            showSnackbar('Statutory rule updated successfully', 'success');
            setDialogOpen(false);
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to update rule', 'error');
        }
    };

    // Rule Card Component
    const RuleCard = ({ rule, icon: Icon, color }) => (
        <Card
            sx={{
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                height: '100%',
                border: `1px solid ${alpha(color, 0.2)}`,
                transition: 'all 0.3s',
                '&:hover': {
                    boxShadow: theme.shadows[6],
                    transform: 'translateY(-2px)',
                },
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Icon sx={{ fontSize: 28, color, mr: 1 }} />
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                {rule.rule_name.replace(/_/g, ' ')}
                            </Typography>
                            <Typography variant="h5" fontWeight={800} color={color}>
                                {rule.value ? `${rule.value}%` : 'Not Set'}
                            </Typography>
                        </Box>
                    </Box>
                    {can('payroll', 'manage') && (
                        <Tooltip title="Edit Rule">
                            <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(rule)}
                                sx={{
                                    color,
                                    bgcolor: alpha(color, 0.1),
                                    '&:hover': { bgcolor: alpha(color, 0.2) },
                                }}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                {rule.description && (
                    <Typography variant="caption" color="text.secondary">
                        {rule.description}
                    </Typography>
                )}
                {rule.state && (
                    <Chip
                        label={rule.state}
                        size="small"
                        sx={{ mt: 1, fontSize: '0.65rem' }}
                    />
                )}
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Statutory Rules Configuration"
                subtitle="Configure PF, ESI, Professional Tax, and TDS calculation rules"
            />

            <Alert severity="info" sx={{ mb: 4 }}>
                <Typography variant="body2">
                    <strong>Important:</strong> All payroll calculations are data-driven. Changes to these rules will affect all future payroll runs.
                </Typography>
            </Alert>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                            <Tab label={`PF Rules (${pfRules.length})`} />
                            <Tab label={`ESI Rules (${esiRules.length})`} />
                            <Tab label={`PT Rules (${ptRules.length})`} />
                            <Tab label={`TDS Rules (${tdsRules.length})`} />
                        </Tabs>
                    </Box>

                    {/* PF Rules */}
                    {activeTab === 0 && (
                        <Box>
                            <Paper sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <AccountBalance sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" fontWeight={800}>
                                            Provident Fund (PF)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Employee and employer contribution rates
                                        </Typography>
                                    </Box>
                                </Box>
                                <Alert severity="info" variant="outlined">
                                    <Typography variant="caption">
                                        PF is calculated on Basic Salary with a maximum wage limit of ₹15,000 (configurable)
                                    </Typography>
                                </Alert>
                            </Paper>

                            <Grid container spacing={3}>
                                {pfRules.map((rule) => (
                                    <Grid item xs={12} sm={6} md={4} key={rule.id}>
                                        <RuleCard
                                            rule={rule}
                                            icon={AccountBalance}
                                            color={theme.palette.primary.main}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* ESI Rules */}
                    {activeTab === 1 && (
                        <Box>
                            <Paper sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <LocalHospital sx={{ fontSize: 32, color: 'info.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" fontWeight={800}>
                                            Employee State Insurance (ESI)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Health insurance contribution rates
                                        </Typography>
                                    </Box>
                                </Box>
                                <Alert severity="info" variant="outlined">
                                    <Typography variant="caption">
                                        ESI applies only if Gross Salary ≤ ₹21,000 (configurable)
                                    </Typography>
                                </Alert>
                            </Paper>

                            <Grid container spacing={3}>
                                {esiRules.map((rule) => (
                                    <Grid item xs={12} sm={6} md={4} key={rule.id}>
                                        <RuleCard
                                            rule={rule}
                                            icon={LocalHospital}
                                            color={theme.palette.info.main}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* PT Rules */}
                    {activeTab === 2 && (
                        <Box>
                            <Paper sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Gavel sx={{ fontSize: 32, color: 'warning.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" fontWeight={800}>
                                            Professional Tax (PT)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            State-specific professional tax slabs
                                        </Typography>
                                    </Box>
                                </Box>
                                <Alert severity="warning" variant="outlined">
                                    <Typography variant="caption">
                                        PT varies by state. Configuration stored in JSON format with salary slabs.
                                    </Typography>
                                </Alert>
                            </Paper>

                            <Grid container spacing={3}>
                                {ptRules.map((rule) => (
                                    <Grid item xs={12} sm={6} md={4} key={rule.id}>
                                        <RuleCard
                                            rule={rule}
                                            icon={Gavel}
                                            color={theme.palette.warning.main}
                                        />
                                    </Grid>
                                ))}
                                {ptRules.length === 0 && (
                                    <Grid item xs={12}>
                                        <Alert severity="info">
                                            No Professional Tax rules configured. PT rules are typically stored in JSON configuration format.
                                        </Alert>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}

                    {/* TDS Rules */}
                    {activeTab === 3 && (
                        <Box>
                            <Paper sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Receipt sx={{ fontSize: 32, color: 'success.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" fontWeight={800}>
                                            Tax Deducted at Source (TDS)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Income tax calculation rules (OLD & NEW regime)
                                        </Typography>
                                    </Box>
                                </Box>
                                <Alert severity="success" variant="outlined">
                                    <Typography variant="caption">
                                        TDS calculation includes standard deduction, exemptions (80C, 80D, HRA), and progressive tax slabs.
                                    </Typography>
                                </Alert>
                            </Paper>

                            <Grid container spacing={3}>
                                {tdsRules.map((rule) => (
                                    <Grid item xs={12} sm={6} md={4} key={rule.id}>
                                        <RuleCard
                                            rule={rule}
                                            icon={Receipt}
                                            color={theme.palette.success.main}
                                        />
                                    </Grid>
                                ))}
                                {tdsRules.length === 0 && (
                                    <Grid item xs={12}>
                                        <Alert severity="info">
                                            No TDS rules configured. TDS rules are typically stored in JSON configuration format with tax slabs.
                                        </Alert>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </>
            )}

            {/* Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Info sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography variant="h6" fontWeight={800}>
                            Edit Statutory Rule
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedRule && (
                        <>
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                <Typography variant="body2">
                                    <strong>Warning:</strong> Changing this rule will affect all future payroll calculations.
                                </Typography>
                            </Alert>

                            <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    RULE NAME
                                </Typography>
                                <Typography variant="body1" fontWeight={700}>
                                    {selectedRule.rule_name.replace(/_/g, ' ')}
                                </Typography>
                                {selectedRule.description && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        {selectedRule.description}
                                    </Typography>
                                )}
                            </Paper>

                            <TextField
                                label="Value (%)"
                                type="number"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                fullWidth
                                autoFocus
                                inputProps={{
                                    step: '0.01',
                                    min: '0',
                                    max: '100',
                                }}
                                helperText="Enter the percentage value (e.g., 12 for 12%)"
                            />

                            <Paper sx={{ p: 2, mt: 3, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    PREVIEW
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color="success.main">
                                    {newValue ? `${newValue}%` : 'Not Set'}
                                </Typography>
                            </Paper>
                        </>
                    )}
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
                        {isUpdating ? 'Saving...' : 'Save Rule'}
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

export default StatutoryRules;
