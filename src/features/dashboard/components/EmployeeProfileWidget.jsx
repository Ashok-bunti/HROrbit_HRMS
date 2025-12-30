import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const EmployeeProfileWidget = ({ employee }) => {
    const data = { ...employee };

    // Fallback image from public folder
    const fallbackImage = '/indoor-picture-cheerful-handsome-young-man-having-folded-hands-looking-directly-smiling-sincerely-wearing-casual-clothes.jpg';
    const profileImageUrl = data.avatar || fallbackImage;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                bgcolor: 'primary.light',
                borderRadius: 2,
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Decorative Shape */}
            <Box
                sx={{
                    position: 'absolute',
                    right: -60,
                    top: 0,
                    width: 280,
                    height: '100%',
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderRadius: '100% 0 0 100% / 50% 0 0 50%',
                    transform: 'scaleY(1.2)',
                    zIndex: 0
                }}
            />

            {/* Content within relative box to stay above decorative shape */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* Centered Profile Section */}
                <Box sx={{ textAlign: 'center', pt: 1 }}>
                    <Box
                        sx={{
                            width: 110,
                            height: 110,
                            mx: 'auto',
                            mb: 2,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            borderColor: 'primary.light',
                            bgcolor: 'primary.lighter',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <img
                            src={profileImageUrl}
                            alt={data.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                e.target.src = fallbackImage;
                            }}
                        />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        {data.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mb: 3 }}>
                        {data.designation}
                    </Typography>
                </Box>

                {/* 2x2 Stats Grid */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    borderTop: '1px solid',
                    borderColor: 'primary.contrastText'
                }}>
                    <Box sx={{
                        py: 2,
                        textAlign: 'center',
                        borderRight: '1px solid',
                        borderBottom: '1px solid',
                        borderColor: 'primary.contrastText'
                    }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {data.id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Employee ID
                        </Typography>
                    </Box>
                    <Box sx={{
                        py: 2,
                        textAlign: 'center',
                        borderBottom: '1px solid',
                        borderColor: 'primary.contrastText'
                    }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {data.department}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Department
                        </Typography>
                    </Box>
                    <Box sx={{
                        py: 2,
                        textAlign: 'center',
                        borderRight: '1px solid',
                        borderColor: 'primary.contrastText'
                    }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {data.experience}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Experience
                        </Typography>
                    </Box>
                    <Box sx={{
                        py: 2,
                        textAlign: 'center'
                    }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {data.joiningDate}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Joined
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

export default EmployeeProfileWidget;
