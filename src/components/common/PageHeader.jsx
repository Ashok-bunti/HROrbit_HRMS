import React from 'react';
import { Box, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, action }) => {
    return (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {action && (
                <Box>
                    {action}
                </Box>
            )}
        </Box>
    );
};

export default PageHeader;
