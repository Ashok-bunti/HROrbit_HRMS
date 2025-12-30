import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Link,
    Paper,
    Tooltip,
    Fade,
    Zoom,
    alpha,
    IconButton
} from '@mui/material';
import { Security, ContentCopy, Smartphone, QrCodeScanner, VerifiedUser, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '@mui/material/styles';

const MFAVerification = ({ userId, onVerificationSuccess, mfaData, onBack }) => {
    const theme = useTheme();
    const [token, setToken] = useState('');
    const [isBackupCode, setIsBackupCode] = useState(false);
    const { verifyMFALogin, loading } = useAuth();
    const [error, setError] = useState('');

    const qrCode = mfaData?.qrCode;
    const manualEntry = mfaData?.manualEntry || mfaData?.secret;

    const handleCopySecret = () => {
        navigator.clipboard.writeText(manualEntry);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const result = await verifyMFALogin({
                userId,
                token,
                isBackupCode
            });

            if (result.token || result.password_change_required) {
                onVerificationSuccess(result);
            } else {
                setError('Invalid code. Please try again.');
            }
        } catch (err) {
            setError(err.data?.error || 'Verification failed');
        }
    };

    return (
        <Box sx={{ width: '100%', pt: 0 }}>
            {qrCode && (
                <Zoom in={true}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, mt: -1 }}>
                        {/* Minimal QR Code Box */}
                        <Paper
                            elevation={0}>
                            <img
                                src={qrCode}
                                alt="MFA QR Code"
                                style={{ width: '150px', height: '150px', display: 'block' }}
                            />
                        </Paper>

                        {/* Configuration Key with Scroll and Copy */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                p: 0.5,
                                pl: 1.5,
                                borderRadius: 2,
                                border: '1px dashed',
                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                width: '100%',
                                maxWidth: '280px',
                            }}
                        >
                            <Box sx={{
                                flex: 1,
                                overflowX: 'auto',
                                whiteSpace: 'nowrap',
                                scrollbarWidth: 'none', // Firefox
                                '&::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari
                                display: 'flex',
                                alignItems: 'center',
                                mr: 1
                            }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 700,
                                        fontFamily: 'monospace',
                                        letterSpacing: 1.5,
                                        color: 'primary.main',
                                        fontSize: '0.85rem',
                                        py: 0.5
                                    }}
                                >
                                    {manualEntry}
                                </Typography>
                            </Box>

                            <Box sx={{ borderLeft: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), pl: 0.5 }}>
                                <Tooltip title="Copy Key">
                                    <IconButton size="small" onClick={handleCopySecret} sx={{ color: 'primary.main' }}>
                                        <ContentCopy sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>
                </Zoom>
            )
            }

            {
                !qrCode && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Security color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Security Check</Typography>
                    </Box>
                )
            }

            {
                error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )
            }

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label={isBackupCode ? "Backup Code" : "6-Digit Security Code"}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    margin="normal"
                    required
                    autoFocus
                    autoComplete="off"
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            height: 64,
                            bgcolor: alpha(theme.palette.background.paper, 0.8),
                            transition: 'all 0.3s ease',
                            '& fieldset': {
                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                borderWidth: '2px',
                            },
                            '&:hover fieldset': {
                                borderColor: alpha(theme.palette.primary.main, 0.4),
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.15)}`,
                            },
                        },
                        '& .MuiInputLabel-root': {
                            fontWeight: 500,
                        }
                    }}
                    inputProps={{
                        maxLength: isBackupCode ? 10 : 6,
                        style: {
                            letterSpacing: isBackupCode ? '0.1em' : '0.6em',
                            textAlign: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            fontFamily: '"Poppins", monospace',
                            paddingLeft: isBackupCode ? '14px' : '0.6em' // Balance the letter spacing
                        }
                    }}
                />

                <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                        mt: 3,
                        mb: 2,
                        py: 1.2,
                        borderRadius: 2,
                        boxShadow: 2,
                        '&:hover': {
                            boxShadow: 4
                        }
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : qrCode ? 'Verify & Enable' : 'Verify'}
                </Button>

                <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {!qrCode && (
                        <Link
                            component="button"
                            variant="body2"
                            type="button"
                            onClick={() => {
                                setIsBackupCode(!isBackupCode);
                                setToken('');
                                setError('');
                            }}
                            sx={{ textDecoration: 'none', fontWeight: 500 }}
                        >
                            {isBackupCode
                                ? 'Use Authenticator App'
                                : 'Use Backup Code'}
                        </Link>
                    )}

                    {onBack && (
                        <Link
                            component="button"
                            variant="body2"
                            type="button"
                            onClick={onBack}
                            sx={{
                                textDecoration: 'none',
                                fontWeight: 500,
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5,
                                mt: 1,
                                '&:hover': {
                                    color: 'primary.main',
                                    '& .MuiSvgIcon-root': {
                                        transform: 'translateX(-4px)'
                                    }
                                },
                                '& .MuiSvgIcon-root': {
                                    fontSize: '1rem',
                                    transition: 'transform 0.2s'
                                }
                            }}
                        >
                            <ArrowBack /> Back to Login
                        </Link>
                    )}
                </Box>
            </form>
        </Box >
    );
};

export default MFAVerification;
