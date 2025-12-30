import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

const StatCard = ({ title, value, icon, gradient, subtitle, trend }) => (
    <Card
        sx={{
            height: '100%',
            background: gradient || 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
            }
        }}
    >
        <CardContent sx={{ position: 'relative', overflow: 'hidden' }}>
            {icon && (
                <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.2 }}>
                    {React.cloneElement(icon, { sx: { fontSize: 120 } })}
                </Box>
            )}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {icon && (
                        <Box
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                p: 1,
                                mr: 2,
                                display: 'flex'
                            }}
                        >
                            {icon}
                        </Box>
                    )}
                    <Typography variant="subtitle1" fontWeight="500" sx={{ opacity: 0.9 }}>
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                    {value}
                </Typography>
                {(subtitle || trend) && (
                    <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                        {subtitle || trend}
                    </Typography>
                )}
            </Box>
        </CardContent>
    </Card>
);

export default StatCard;
