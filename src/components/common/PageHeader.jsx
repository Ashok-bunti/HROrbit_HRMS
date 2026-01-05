import React from 'react';
import { Box, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, action }) => {
    return (
        <Box sx={{
            mb: { xs: 2, md: 4 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2
        }}>
            <Box>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: { xs: '0.875rem', md: '1rem' } }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {action && (
                <Box sx={{ width: { xs: '100%', md: 'auto' }, '& .MuiButton-root': { width: { xs: '100%', md: 'auto' } } }}>
                    {action}
                </Box>
            )}
        </Box>
    );
};

export default PageHeader;
