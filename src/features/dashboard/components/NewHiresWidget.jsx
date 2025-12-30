import React from 'react';
import { Box, Typography, Avatar, IconButton, Paper, Stack } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Mock data
const newHires = [
    { id: 1, name: 'John Doe', image: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
    { id: 2, name: 'Jane Smith', image: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { id: 3, name: 'Mike Ross', image: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
];

const NewHiresWidget = () => {
    return (
        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>New hires</Typography>
            <Stack spacing={2} alignItems="center" sx={{ mt: 2 }}>
                {newHires.map((hire) => (
                    <Avatar
                        key={hire.id}
                        src={hire.image}
                        alt={hire.name}
                        sx={{ width: 56, height: 56, border: '2px solid white' }}
                    />
                ))}
                <IconButton
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.main' }
                    }}
                >
                    <KeyboardArrowDownIcon />
                </IconButton>
            </Stack>
        </Paper>
    );
};

export default NewHiresWidget;
