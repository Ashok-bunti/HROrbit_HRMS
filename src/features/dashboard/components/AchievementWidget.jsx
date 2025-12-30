import React from 'react';
import { Box, Typography, Paper, Link } from '@mui/material';

const AchievementWidget = () => {
    return (
        <Box sx={{
            height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', p: 3, borderRadius: 2,
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Achievement</Typography>
                <Link href="#" underline="none" color="text.secondary" variant="body2">View all</Link>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    p: 3,
                    bgcolor: 'primary.light', // Light purple background matches screenshot
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Box sx={{ width: '50%', zIndex: 1 }}>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#8b8bc4', letterSpacing: '-0.5px', mb: 0.5 }}>
                        SyncWav
                    </Typography>
                    <Typography variant="body1" fontWeight="500" color="text.primary" sx={{ mb: 2 }}>
                        Successful delivery
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Congratulations to
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            the entire team
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {[1, 2, 3, 4].map((i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: i === 1 ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: '50%',
                        height: '100%',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        component="img"
                        src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                        alt="Project Interface"
                        sx={{
                            width: '120%',
                            maxWidth: 200,
                            height: 'auto',
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)',
                            mr: -4
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default AchievementWidget;
