import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Typography,
    Divider,
    Box,
    Alert,
    Tabs,
    Tab
} from '@mui/material';
import { useCreatePolicyMutation, useUpdatePolicyMutation } from '../store/policyApi';
import useSnackbar from '../../../hooks/useSnackbar';
import CustomSnackbar from '../../../components/common/CustomSnackbar';

const INITIAL_CONFIG = {
    credit_timing: 'monthly',
    credit_schedule: 'month_end',
    monthly_accrual_rate: '',
    yearly_quota: '',
    prorated_for_mid_year_joiners: true,
    max_balance: '',
    min_balance: 0,
    carry_forward_enabled: false,
    max_carry_forward: '',
    carry_forward_expiry_months: '',
    eligibility: {
        min_service_months: 0,
        gender_restriction: 'none',
        one_time_only: false,
        requires_approval: true,
        auto_approve: false,
        lock_until_eligible: false
    },
    lop_settings: {
        lop_allowed: true,
        lop_calculation_method: 'daily',
        payroll_impact: true
    },
    year_end_processing: {
        reset_to_zero: true,
        lapse_unused: true,
        encashment_allowed: false,
        encashment_rate: ''
    }
};

const INITIAL_STATE = {
    leave_type: '',
    display_name: '',
    description: '',
    is_active: true,
    category: 'PAID',
    policy_config: INITIAL_CONFIG
};

const LeavePolicyForm = ({ open, onClose, policy }) => {
    const [formData, setFormData] = useState(INITIAL_STATE);
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
    const [tabValue, setTabValue] = useState(0);

    const [createPolicy, { isLoading: isCreating }] = useCreatePolicyMutation();
    const [updatePolicy, { isLoading: isUpdating }] = useUpdatePolicyMutation();

    useEffect(() => {
        if (policy) {
            setFormData(JSON.parse(JSON.stringify(policy))); // Deep copy
        } else {
            setFormData(JSON.parse(JSON.stringify(INITIAL_STATE)));
        }
    }, [policy, open]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleConfigChange = (section, field, value) => {
        setFormData(prev => {
            const newConfig = { ...prev.policy_config };
            if (section) {
                newConfig[section] = {
                    ...newConfig[section],
                    [field]: value
                };
            } else {
                newConfig[field] = value;
            }
            return { ...prev, policy_config: newConfig };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.leave_type || !formData.display_name) {
            showSnackbar('Please fill in required fields', 'error');
            return;
        }

        try {
            const cleanConfig = { ...formData.policy_config };
            ['monthly_accrual_rate', 'yearly_quota', 'max_balance', 'min_balance', 'max_carry_forward', 'carry_forward_expiry_months'].forEach(field => {
                if (cleanConfig[field] === '') cleanConfig[field] = null;
                else if (cleanConfig[field] !== null) cleanConfig[field] = Number(cleanConfig[field]);
            });
            cleanConfig.eligibility.min_service_months = Number(cleanConfig.eligibility.min_service_months);

            if (cleanConfig.year_end_processing.encashment_rate === '') cleanConfig.year_end_processing.encashment_rate = null;
            else if (cleanConfig.year_end_processing.encashment_rate !== null) cleanConfig.year_end_processing.encashment_rate = Number(cleanConfig.year_end_processing.encashment_rate);

            const payload = {
                ...formData,
                policy_config: cleanConfig
            };

            if (payload.policy_config.eligibility.gender_restriction === 'none') {
                payload.policy_config.eligibility.gender_restriction = null;
            }

            if (policy) {
                await updatePolicy({ id: policy.id, ...payload }).unwrap();
                showSnackbar('Policy updated successfully', 'success');
            } else {
                await createPolicy(payload).unwrap();
                showSnackbar('Policy created successfully', 'success');
            }
            setTimeout(() => {
                onClose();
            }, 1000); // Wait for snackbar
        } catch (err) {
            console.error(err);
            showSnackbar(err.data?.error || 'Operation failed', 'error');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, pt: 2, pb: 0 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                        {policy ? 'Edit Leave Policy' : 'Create New Leave Policy'}
                    </Typography>
                </Box>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Basic Information" />
                    <Tab label="Credits & Accrual" />
                    <Tab label="Balance & Carry Forward" />
                    <Tab label="Eligibility" />
                    <Tab label="Year End Action" />
                </Tabs>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 3, minHeight: 400 }}>
                    {/* Basic Info Tab */}
                    {tabValue === 0 && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, animation: 'fadeIn 0.3s ease-in' }}>
                            <TextField
                                fullWidth
                                label="Leave Code"
                                name="leave_type"
                                value={formData.leave_type}
                                onChange={handleChange}
                                disabled={!!policy}
                                required
                                helperText="Unique code e.g. CL, SL, PL"
                                variant="outlined"
                            />
                            <TextField
                                fullWidth
                                label="Display Name"
                                name="display_name"
                                value={formData.display_name}
                                onChange={handleChange}
                                required
                                variant="outlined"
                            />
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="category"
                                    label="Category"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="PAID">Paid</MenuItem>
                                    <MenuItem value="UNPAID">Unpaid</MenuItem>
                                    <MenuItem value="SPECIAL">Special</MenuItem>
                                    <MenuItem value="INFORMATIONAL">Informational</MenuItem>
                                </Select>
                            </FormControl>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.is_active}
                                            onChange={(e) => handleChange({ target: { name: 'is_active', value: e.target.checked } })}
                                            name="is_active"
                                            color="success"
                                        />
                                    }
                                    label="Active Policy"
                                />
                            </Box>
                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={2}
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Credits & Accrual Tab */}
                    {tabValue === 1 && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2.5, animation: 'fadeIn 0.3s ease-in' }}>
                            <Box sx={{ gridColumn: { md: '1 / -1', lg: 'span 1' } }}>
                                <FormControl fullWidth>
                                    <InputLabel>Credit Timing</InputLabel>
                                    <Select
                                        value={formData.policy_config.credit_timing}
                                        label="Credit Timing"
                                        onChange={(e) => handleConfigChange(null, 'credit_timing', e.target.value)}
                                    >
                                        <MenuItem value="monthly">Monthly</MenuItem>
                                        <MenuItem value="annual">Annual</MenuItem>
                                        <MenuItem value="quarterly">Quarterly</MenuItem>
                                        <MenuItem value="on_demand">On Demand</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ gridColumn: { md: '1 / -1', lg: 'span 1' } }}>
                                <FormControl fullWidth>
                                    <InputLabel>Credit Schedule</InputLabel>
                                    <Select
                                        value={formData.policy_config.credit_schedule}
                                        label="Credit Schedule"
                                        onChange={(e) => handleConfigChange(null, 'credit_schedule', e.target.value)}
                                    >
                                        <MenuItem value="month_start">Month Start</MenuItem>
                                        <MenuItem value="month_end">Month End</MenuItem>
                                        <MenuItem value="year_start">Year Start</MenuItem>
                                        <MenuItem value="specific_date">Specific Date</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <TextField
                                fullWidth
                                label="Monthly Accrual"
                                type="number"
                                inputProps={{ step: "0.1" }}
                                value={formData.policy_config.monthly_accrual_rate}
                                onChange={(e) => handleConfigChange(null, 'monthly_accrual_rate', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="Yearly Quota"
                                type="number"
                                value={formData.policy_config.yearly_quota}
                                onChange={(e) => handleConfigChange(null, 'yearly_quota', e.target.value)}
                                helperText="Leave empty for unlimited"
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.policy_config.prorated_for_mid_year_joiners}
                                            onChange={(e) => handleConfigChange(null, 'prorated_for_mid_year_joiners', e.target.checked)}
                                        />
                                    }
                                    label="Prorate for New Joinees"
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Balance & Carry Forward Tab */}
                    {tabValue === 2 && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, animation: 'fadeIn 0.3s ease-in' }}>
                            <TextField
                                fullWidth
                                label="Max Balance Cap"
                                type="number"
                                value={formData.policy_config.max_balance}
                                onChange={(e) => handleConfigChange(null, 'max_balance', e.target.value)}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.policy_config.carry_forward_enabled}
                                            onChange={(e) => handleConfigChange(null, 'carry_forward_enabled', e.target.checked)}
                                        />
                                    }
                                    label="Enable Carry Forward"
                                />
                            </Box>
                            {formData.policy_config.carry_forward_enabled && (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Max Carry Forward Days"
                                        type="number"
                                        value={formData.policy_config.max_carry_forward}
                                        onChange={(e) => handleConfigChange(null, 'max_carry_forward', e.target.value)}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Expiry (Months)"
                                        type="number"
                                        value={formData.policy_config.carry_forward_expiry_months}
                                        onChange={(e) => handleConfigChange(null, 'carry_forward_expiry_months', e.target.value)}
                                        helperText="Months after year end when CF expires"
                                    />
                                </>
                            )}
                        </Box>
                    )}

                    {/* Eligibility Tab */}
                    {tabValue === 3 && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2.5, animation: 'fadeIn 0.3s ease-in' }}>
                            <TextField
                                fullWidth
                                label="Min Service (Months)"
                                type="number"
                                value={formData.policy_config.eligibility.min_service_months}
                                onChange={(e) => handleConfigChange('eligibility', 'min_service_months', e.target.value)}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Gender Restriction</InputLabel>
                                <Select
                                    value={formData.policy_config.eligibility.gender_restriction || 'none'}
                                    label="Gender Restriction"
                                    onChange={(e) => handleConfigChange('eligibility', 'gender_restriction', e.target.value)}
                                >
                                    <MenuItem value="none">None</MenuItem>
                                    <MenuItem value="male">Male Only</MenuItem>
                                    <MenuItem value="female">Female Only</MenuItem>
                                </Select>
                            </FormControl>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.policy_config.eligibility.requires_approval}
                                            onChange={(e) => handleConfigChange('eligibility', 'requires_approval', e.target.checked)}
                                        />
                                    }
                                    label="Requires Approval"
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Year End Tab */}
                    {tabValue === 4 && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, animation: 'fadeIn 0.3s ease-in' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.policy_config.year_end_processing.reset_to_zero}
                                            onChange={(e) => handleConfigChange('year_end_processing', 'reset_to_zero', e.target.checked)}
                                        />
                                    }
                                    label="Reset to Zero"
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.policy_config.year_end_processing.encashment_allowed}
                                            onChange={(e) => handleConfigChange('year_end_processing', 'encashment_allowed', e.target.checked)}
                                        />
                                    }
                                    label="Allow Encashment"
                                />
                            </Box>
                        </Box>
                    )}

                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isCreating || isUpdating}
                        sx={{ px: 4 }}
                    >
                        {policy ? 'Update Policy' : 'Create Policy'}
                    </Button>
                </DialogActions>
            </form>
            <CustomSnackbar
                open={snackbar.open}
                onClose={hideSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Dialog>
    );
};

export default LeavePolicyForm;
