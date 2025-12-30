import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, MenuItem, Button, Grid } from '@mui/material';

const days = [
    { num: '05', day: 'Mon', active: false },
    { num: '06', day: 'Tues', active: true },
    { num: '07', day: 'Wed', active: false },
    { num: '08', day: 'Thurs', active: false },
    { num: '09', day: 'Fri', active: false },
];

const TimeLogWidget = () => {
    const [project, setProject] = useState('');
    const [jobName, setJobName] = useState('');

    return (
        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Time log</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                {days.map((d, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            gap: 1
                        }}
                    >
                        <Box sx={{
                            color: d.active ? 'white' : 'text.primary',
                            bgcolor: d.active ? 'primary.main' : 'transparent',
                            borderRadius: 3,
                            width: 36,
                            height: 50, // Taller rectangle
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                        }}>
                            {d.num}
                        </Box>
                        <Typography variant="caption" color={d.active ? 'primary.main' : "text.secondary"} fontWeight={d.active ? "bold" : "normal"}>
                            {d.day}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block' }}>Project</Typography>
                    <TextField
                        select
                        fullWidth
                        value={project}
                        onChange={(e) => setProject(e.target.value)}
                        placeholder="Select"
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.default',
                                borderRadius: 3,
                                '& fieldset': { border: 'none' }, // Look like filled input
                            }
                        }}
                    >
                        <MenuItem value="project1">SyncWav</MenuItem>
                        <MenuItem value="project2">Blockchain</MenuItem>
                    </TextField>
                </Box>

                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block' }}>Job name</Typography>
                    <TextField
                        select
                        fullWidth
                        value={jobName}
                        onChange={(e) => setJobName(e.target.value)}
                        placeholder="Select"
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.default',
                                borderRadius: 3,
                                '& fieldset': { border: 'none' },
                            }
                        }}
                    >
                        <MenuItem value="job1">Development</MenuItem>
                        <MenuItem value="job2">Design</MenuItem>
                    </TextField>
                </Box>

                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block' }}>Description</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.default',
                                borderRadius: 3,
                                '& fieldset': { border: 'none' },
                            }
                        }}
                    />
                </Box>

                <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                        mt: 2,
                        py: 1.2,
                        borderRadius: 50,
                        color: '#a855f7',
                        borderColor: '#a855f7',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        '&:hover': {
                            borderColor: '#9333ea',
                            bgcolor: 'rgba(168, 85, 247, 0.04)'
                        }
                    }}
                >
                    Log time for today
                </Button>
            </Box>
        </Paper>
    );
};

export default TimeLogWidget;
