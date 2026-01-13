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
    CircularProgress
} from '@mui/material';
import {
    CameraAlt as CameraAltIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import Webcam from 'react-webcam';

const FaceVerificationDialog = ({
    open,
    onClose,
    onVerify,
    isVerifying,
    message = "Please verify your face to complete the clock-in process."
}) => {
    const [capturedImage, setCapturedImage] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const webcamRef = useRef(null);

    const handleCapture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                setCapturedImage(imageSrc);
            } else {
                setCameraError("Could not capture image. Please ensure camera is on.");
            }
        }
    }, [webcamRef]);

    const handleRetake = () => {
        setCapturedImage(null);
        setCameraError(null);
    };

    const handleVerify = () => {
        if (capturedImage) {
            onVerify(capturedImage);
        }
    };

    const handleClose = () => {
        if (!isVerifying) {
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
        >
            <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
                <Typography variant="h6" fontWeight={700}>Face Verification</Typography>
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ borderBottom: 'none' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, gap: 2 }}>
                    {cameraError && (
                        <Typography color="error" variant="body2" fontWeight={600}>
                            {cameraError}
                        </Typography>
                    )}
                    {!capturedImage ? (
                        <Box sx={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: 400,
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: 'black',
                            aspectRatio: '4/3',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
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
                                style={{ borderRadius: '8px' }}
                            />
                            <Box sx={{
                                position: 'absolute',
                                bottom: 16,
                                left: '50%',
                                transform: 'translateX(-50%)'
                            }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<CameraAltIcon />}
                                    onClick={handleCapture}
                                    disabled={!!cameraError}
                                    sx={{ borderRadius: 5, px: 4, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
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
                            borderRadius: 2,
                            overflow: 'hidden',
                            aspectRatio: '4/3',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
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
                                disabled={isVerifying}
                                sx={{ borderRadius: 2 }}
                            >
                                Retake Photo
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleVerify}
                                disabled={isVerifying}
                                startIcon={isVerifying ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                                sx={{ borderRadius: 2, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                            >
                                {isVerifying ? 'Verifying...' : 'Verify & Clock In'}
                            </Button>
                        </Stack>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                    onClick={handleClose}
                    disabled={isVerifying}
                    color="inherit"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FaceVerificationDialog;
