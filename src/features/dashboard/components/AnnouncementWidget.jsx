import React from 'react';
import { Box, Typography, Paper, Link, Avatar } from '@mui/material';
import image from '../../../../public/p1.png'
const AnnouncementWidget = () => {
    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            p: 3,
            borderRadius: 2
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Announcements</Typography>
                <Link href="#" underline="none" color="text.secondary" variant="body2">View all</Link>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    p: 3,
                    bgcolor: 'primary.light',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                }}
            >
                {/* Background Shape */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: -20,
                        top: '10%',
                        width: 200,
                        height: 200,
                        bgcolor: 'rgba(255,255,255,0.4)',
                        borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                        transform: 'rotate(45deg)',
                        zIndex: 0
                    }}
                />

                <Box sx={{ width: '60%', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#6b7280', letterSpacing: '-0.5px', mb: 0.5 }}>
                        Blockchain
                    </Typography>
                    <Typography variant="body1" fontWeight="500" color="text.primary" sx={{ mb: 2 }}>
                        Basics and development
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Webinar on 30th Jun
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            3:00pm - 4:30pm
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
                                    bgcolor: i === 1 ? '#a855f7' : '#e9d5ff'
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: '40%',
                        height: '100%',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: -24,
                            right: -24,
                            height: '200%',
                            width: '170%',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            pointerEvents: 'none'
                        }}
                    >
                        <Box
                            component="img"
                            src={image}
                            alt="Speaker"
                            sx={{
                                height: '100%',
                                maxHeight: 350,
                                width: 'auto',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                objectPosition: 'bottom center',
                            }}
                        />
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default AnnouncementWidget;
