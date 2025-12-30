import React from 'react';
import { Box, Typography, Paper, Link, List, ListItem, ListItemAvatar, ListItemText, Avatar } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const events = [
    {
        id: 1,
        title: 'Board meeting',
        date: '03 July',
        time: '10:00 am - 12:00 am',
        icon: <ChatBubbleOutlineIcon />,
        color: 'background.default', // Purple 200
        iconColor: 'primary.main' // Purple 700
    },
    {
        id: 2,
        title: 'Holiday - India',
        date: '17 July',
        time: 'Happy Onam',
        icon: <CalendarTodayIcon />,
        color: 'background.default',
        iconColor: 'primary.main'
    },
    {
        id: 3,
        title: 'New joinee meet',
        date: '13 July',
        time: '02:00 pm - 03:00 pm',
        icon: <PersonOutlineIcon />,
        color: 'background.default',
        iconColor: 'primary.main'
    }
];

const EventsWidget = () => {
    return (
        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Events</Typography>
                <Link href="#" underline="none" color="text.secondary" variant="body2">View all</Link>
            </Box>

            <List sx={{ width: '100%', p: 0 }}>
                {events.map((event) => (
                    <ListItem alignItems="center" key={event.id} sx={{ px: 0, py: 2 }}>
                        <ListItemAvatar sx={{ minWidth: 70 }}>
                            <Avatar
                                sx={{
                                    bgcolor: event.color,
                                    color: event.iconColor,
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%'
                                }}
                            >
                                {React.cloneElement(event.icon, { sx: { fontSize: 26 } })}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 0.5, fontSize: '1rem' }}>
                                    {event.title}
                                </Typography>
                            }
                            secondary={
                                <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ display: 'block', fontSize: '0.85rem' }}
                                >
                                    <span style={{ color: '#9ca3af' }}>{event.date}</span>
                                    &nbsp;&nbsp;&nbsp;
                                    <span style={{ color: '#6b7280' }}>{event.time}</span>
                                </Typography>
                            }
                        />
                        <MoreVertIcon sx={{ color: '#d1d5db', cursor: 'pointer' }} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default EventsWidget;
