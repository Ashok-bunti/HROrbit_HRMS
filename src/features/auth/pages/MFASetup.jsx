import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Button,
    Typography,
    Alert,
    Container,
    Grid,
    TextField,
    Divider,
    Paper,
    CircularProgress,
    alpha,
    IconButton,
    Tooltip,
    Fade,
    Zoom,
    InputAdornment
} from '@mui/material';
import { Security, ContentCopy, Smartphone, VerifiedUser, Shield, LockReset, Warning, Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
    useSetupMFAMutation,
    useVerifyAndEnableMFAMutation,
    useDisableMFAMutation,
    useRegenerateBackupCodesMutation
} from '../store/mfaApi';
import { useGetProfileQuery } from '../store/authApi';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';

const MFASetup = ({ embedded }) => {
    const theme = useTheme();
    const { data: profileData, refetch: refetchProfile } = useGetProfileQuery();
    const [setupMFA, { isLoading: isSettingUp }] = useSetupMFAMutation();
    const [verifyAndEnable, { isLoading: isVerifying }] = useVerifyAndEnableMFAMutation();
    const [disableMFA, { isLoading: isDisabling }] = useDisableMFAMutation();
    const [regenerateCodes, { isLoading: isRegenerating }] = useRegenerateBackupCodesMutation();

    const [step, setStep] = useState('initial'); // initial, scanning, backup
    const [secretData, setSecretData] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { showSnackbar, snackbar, hideSnackbar } = useSnackbar();

    const user = profileData?.user;
    const isMFAEnabled = user?.mfa_enabled;

    const handleStartSetup = async () => {
        try {
            const result = await setupMFA().unwrap();
            setSecretData(result);
            setStep('scanning');
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to start MFA setup', 'error');
        }
    };

    const handleVerify = async () => {
        try {
            const result = await verifyAndEnable(verificationCode).unwrap();
            setBackupCodes(result.backupCodes);
            setStep('backup');
            showSnackbar('Verified successfully and backup codes sent to registered email', 'success');
            refetchProfile();
        } catch (err) {
            showSnackbar(err.data?.error || 'Invalid code. Please try again.', 'error');
        }
    };

    const handleDisable = async () => {
        try {
            await disableMFA(password).unwrap();
            showSnackbar('MFA disabled successfully', 'success');
            setPassword('');
            refetchProfile();
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to disable MFA', 'error');
        }
    };

    const handleRegenerate = async () => {
        try {
            const result = await regenerateCodes(password).unwrap();
            setBackupCodes(result.backupCodes || result);
            setStep('backup');
            showSnackbar('Backup codes regenerated successfully', 'success');
            setPassword('');
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to regenerate codes', 'error');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showSnackbar('Codes copied to clipboard', 'success');
    };

    if (!user) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
        </Box>
    );

    const ContentWrapper = embedded ? Box : Container;
    const wrapperProps = embedded ? { sx: { py: 0 } } : { maxWidth: "md", sx: { py: 4 } };

    return (
        <ContentWrapper {...wrapperProps}>
            {!embedded && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: -0.5 }}>
                        Security Settings
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your account security and authentication methods.
                    </Typography>
                </Box>
            )}

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Box sx={{ p: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 3,
                                    bgcolor: alpha(isMFAEnabled ? theme.palette.success.main : theme.palette.primary.main, 0.1),
                                    color: isMFAEnabled ? 'success.main' : 'primary.main',
                                    mr: 2
                                }}
                            >
                                <Security fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Two-Factor Authentication (2FA)
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: isMFAEnabled ? 'success.main' : 'text.disabled',
                                            mr: 1
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: isMFAEnabled ? 'success.main' : 'text.disabled' }}>
                                        {isMFAEnabled ? 'ENABLED' : 'DISABLED'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 4, lineHeight: 1.6 }}>
                            Two-factor authentication adds an additional layer of security to your account.
                            Beyond your password, you'll need to provide a code from an authenticator app.
                        </Typography>

                        <Divider sx={{ mb: 4, opacity: 0.5 }} />

                        {!isMFAEnabled && step === 'initial' && (
                            <Fade in={true}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<Shield />}
                                    onClick={handleStartSetup}
                                    disabled={isSettingUp}
                                    sx={{
                                        py: 1.5,
                                        px: 4,
                                        borderRadius: 2.5,
                                        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`
                                    }}
                                >
                                    Setup Authenticator
                                </Button>
                            </Fade>
                        )}

                        {!isMFAEnabled && step === 'scanning' && secretData && (
                            <Fade in={true}>
                                <Box>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 4, alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'primary.main', fontWeight: 700, fontSize: '0.8rem' }}>
                                            <Smartphone sx={{ fontSize: 18 }} /> SCAN
                                        </Box>
                                        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.disabled', fontWeight: 700, fontSize: '0.8rem' }}>
                                            <VerifiedUser sx={{ fontSize: 18 }} /> VERIFY
                                        </Box>
                                    </Box>

                                    <Grid container spacing={4} alignItems="center">
                                        <Grid item xs={12} sm={5}>
                                            <Paper
                                                elevation={0}
                                            >
                                                <img src={secretData.qrCode} alt="MFA QR Code" style={{ width: '100%', maxWidth: '160px', borderRadius: '4px' }} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={7}>


                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                <TextField
                                                    size="small"
                                                    label="Code"
                                                    placeholder="000000"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    sx={{ width: '200px' }}
                                                    inputProps={{
                                                        maxLength: 6,
                                                        style: { textAlign: 'center', letterSpacing: '0.4em', fontWeight: 700, fontSize: '1.1rem' }
                                                    }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    onClick={handleVerify}
                                                    disabled={isVerifying || verificationCode.length !== 6}
                                                    sx={{ py: 1, borderRadius: 2, minWidth: '140px' }}
                                                >
                                                    {isVerifying ? <CircularProgress size={24} color="inherit" /> : 'Confirm Setup'}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Fade>
                        )}

                        {/* {step === 'backup' && (
                            <Fade in={true}>
                                <Box>
                                    <Grid container spacing={1.5}>
                                        {backupCodes.map((code, index) => (
                                            <Grid item xs={6} sm={4} key={index}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 1.5,
                                                        textAlign: 'center',
                                                        bgcolor: alpha(theme.palette.background.default, 0.5),
                                                        borderRadius: 2,
                                                        border: '1px solid',
                                                        borderColor: alpha(theme.palette.divider, 0.1)
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>
                                                        {code}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<ContentCopy />}
                                            onClick={() => copyToClipboard(backupCodes.join('\n'))}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Copy All
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={() => setStep('initial')}
                                            sx={{ borderRadius: 2, px: 4 }}
                                        >
                                            Done
                                        </Button>
                                    </Box>
                                </Box>
                            </Fade>
                        )} */}

                        {isMFAEnabled && (
                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <LockReset sx={{ color: 'primary.main', mr: 1 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        MFA Management
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    To disable MFA or regenerate backup codes, confirm your password.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                    <TextField
                                        size="small"
                                        type={showPassword ? 'text' : 'password'}
                                        label="Confirm Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        sx={{ width: '250px' }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        size="small"
                                                    >
                                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        onClick={handleRegenerate}
                                        disabled={isRegenerating || !password}
                                        sx={{ height: 40, whiteSpace: 'nowrap', borderRadius: 2 }}
                                    >
                                        {isRegenerating ? <CircularProgress size={20} color="inherit" /> : 'Regenerate Codes'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleDisable}
                                        disabled={isDisabling || !password}
                                        sx={{ height: 40, whiteSpace: 'nowrap', borderRadius: 2 }}
                                    >
                                        {isDisabling ? <CircularProgress size={20} color="inherit" /> : 'Disconnect'}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Box sx={{ py: 2, px: { xs: 0, md: 2 } }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Why use 2FA?
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Box sx={{ color: 'primary.main', mt: 0.5 }}><Shield fontSize="small" /></Box>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                <strong>Enhanced Protection:</strong> Even if someone steals your password, they can't access your account without your physical device.
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Box sx={{ color: 'primary.main', mt: 0.5 }}><VerifiedUser fontSize="small" /></Box>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                <strong>Official Compliance:</strong> MFA is a requirement for many security audits and corporate compliance standards.
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                p: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.1)
                            }}
                        >
                            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                                RECOMMENDED APPS:
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                • Microsoft Authenticator
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                • Google Authenticator
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                • Authy or 1Password
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={hideSnackbar}
            />
        </ContentWrapper >
    );
};

export default MFASetup;
