import React, { useState, useRef } from 'react';
import { Box, Typography, alpha, useTheme, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileDropZone = ({
    onFileSelect,
    accept = '.pdf,.png,.jpg,.jpeg',
    maxSize = 5 * 1024 * 1024,
    label = 'Drag and drop or click to upload',
    subLabel = 'PDF, PNG, JPG (MAX. 5MB)',
    isLoading = false,
    height = 150,
    variant = 'standard', // 'standard' or 'mini'
    showIcon = true
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const theme = useTheme();

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            validateAndSelect(files[0]);
        }
    };

    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            validateAndSelect(files[0]);
        }
    };

    const validateAndSelect = (file) => {
        if (file.size > maxSize) {
            alert('File is too large. Maximum size is 5MB.');
            return;
        }

        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (accept !== '*' && !accept.split(',').some(ext => ext.trim().toLowerCase() === extension)) {
            alert(`Invalid file type. Supported: ${accept}`);
            return;
        }

        onFileSelect(file);
    };

    const handleClick = () => {
        if (!isLoading) {
            fileInputRef.current.click();
        }
    };

    if (variant === 'mini') {
        return (
            <Box
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept={accept}
                    style={{ display: 'none' }}
                />
                {isLoading ? (
                    <CircularProgress size={24} />
                ) : (
                    showIcon && (
                        <CloudUploadIcon
                            color={isDragging ? 'primary' : 'inherit'}
                            sx={{ fontSize: 28, color: isDragging ? 'primary.main' : 'text.disabled' }}
                        />
                    )
                )}
            </Box>
        );
    }

    return (
        <Box
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
                width: '100%',
                height: height,
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'divider',
                borderRadius: 3,
                bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLoading ? 'default' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
                }
            }}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept={accept}
                style={{ display: 'none' }}
            />

            {isLoading ? (
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={40} thickness={4} sx={{ mb: 2 }} />
                    <Typography variant="body2" fontWeight="600" color="text.secondary">
                        Uploading...
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1.5,
                            transition: 'transform 0.2s',
                            transform: isDragging ? 'scale(1.1)' : 'scale(1)'
                        }}
                    >
                        <CloudUploadIcon color="primary" />
                    </Box>
                    <Typography variant="body2" fontWeight="700" color="text.primary">
                        {label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {subLabel}
                    </Typography>
                </>
            )}

            {isDragging && (
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 4,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        pointerEvents: 'none',
                        zIndex: 10
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                        Drop to Upload
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default FileDropZone;
