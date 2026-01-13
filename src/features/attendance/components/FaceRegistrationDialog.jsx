import React, { useState, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Stack,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    CameraAlt as CameraAltIcon,
    CheckCircle as CheckCircleIcon,
    Face as FaceIcon
} from '@mui/icons-material';
import Webcam from 'react-webcam';

const FaceRegistrationDialog = ({
    open,
    onClose,
    onRegister,
    isRegistering,
    message = "Please capture a clear photo of your face for registration. This will be used for future clock-ins."
}) => {
    const [capturedImage, setCapturedImage] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const webcamRef = useRef(null);

    const handleCapture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                setCapturedImage(imageSrc);
                setCameraError(null);
            } else {
                setCameraError("Could not capture image. Please ensure camera is on and try again.");
            }
        }
    }, [webcamRef]);

    const handleRetake = () => {
        setCapturedImage(null);
        setCameraError(null);
    };

    const handleRegister = () => {
        if (capturedImage) {
            onRegister(capturedImage);
        }
    };

    const handleClose = () => {
        if (!isRegistering) {
            setCapturedImage(null);
            setCameraError(null);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pb: 0, pt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <FaceIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h5" fontWeight={800}>Face Registration</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '80%', mx: 'auto' }}>
                        {message}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ borderBottom: 'none', px: 3, py: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <Alert severity="info" sx={{ width: '100%', borderRadius: 2 }}>
                        Ensure you are in a well-lit area and your face is fully visible without masks or sunglasses.
                    </Alert>

                    {cameraError && (
                        <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>
                            {cameraError}
                        </Alert>
                    )}

                    {!capturedImage ? (
                        <Box sx={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: 400,
                            borderRadius: 4,
                            overflow: 'hidden',
                            bgcolor: 'black',
                            aspectRatio: '4/3',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                            border: '4px solid',
                            borderColor: cameraError ? 'error.main' : 'primary.main'
                        }}>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width="100%"
                                videoConstraints={{
                                    facingMode: "user"
                                }}
                                onUserMediaError={() => setCameraError("Camera access denied or device not found.")}
                                style={{ borderRadius: '12px' }}
                            />
                            <Box sx={{
                                position: 'absolute',
                                bottom: 20,
                                left: '50%',
                                transform: 'translateX(-50%)'
                            }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<CameraAltIcon />}
                                    onClick={handleCapture}
                                    disabled={!!cameraError}
                                    sx={{
                                        borderRadius: 8,
                                        px: 4,
                                        py: 1.5,
                                        fontWeight: 700,
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                                        '&:hover': { transform: 'scale(1.05)' },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Capture Photo
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: 400,
                            borderRadius: 4,
                            overflow: 'hidden',
                            aspectRatio: '4/3',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            border: '4px solid',
                            borderColor: 'success.main'
                        }}>
                            <img
                                src={capturedImage}
                                alt="Captured"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </Box>
                    )}

                    {capturedImage && (
                        <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={handleRetake}
                                disabled={isRegistering}
                                sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
                            >
                                Retake Photo
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleRegister}
                                disabled={isRegistering}
                                startIcon={isRegistering ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                                sx={{
                                    borderRadius: 2,
                                    px: 4,
                                    fontWeight: 700,
                                    bgcolor: 'success.main',
                                    '&:hover': { bgcolor: 'success.dark', transform: 'scale(1.02)' },
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isRegistering ? 'Registering...' : 'Register Face'}
                            </Button>
                        </Stack>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 4, px: 3 }}>
                <Button
                    onClick={handleClose}
                    disabled={isRegistering}
                    color="inherit"
                    sx={{ fontWeight: 600 }}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FaceRegistrationDialog;
