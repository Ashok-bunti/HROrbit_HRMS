import { Drawer, Box, Typography, IconButton, List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider, Button, Chip, Badge } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useTheme, alpha } from '@mui/material/styles';

const NotificationDrawer = ({ open, onClose }) => {
    const theme = useTheme();

    // Sample notification data
    const notifications = [
        {
            id: 1,
            type: 'success',
            title: 'Leave Request Approved',
            message: 'Your leave request for Dec 20-22 has been approved by your manager',
            time: '2 hours ago',
            unread: true
        },
        {
            id: 2,
            type: 'info',
            title: 'New Policy Update',
            message: 'Company holiday policy has been updated for 2024. Please review the changes',
            time: '5 hours ago',
            unread: true
        },
        {
            id: 3,
            type: 'warning',
            title: 'Timesheet Reminder',
            message: 'Please submit your timesheet for this week by Friday EOD',
            time: '1 day ago',
            unread: false
        },
        {
            id: 4,
            type: 'info',
            title: 'Team Meeting Scheduled',
            message: 'Weekly team sync scheduled for tomorrow at 10 AM in Conference Room A',
            time: '2 days ago',
            unread: false
        },
        {
            id: 5,
            type: 'success',
            title: 'Performance Review Complete',
            message: 'Your Q4 performance review has been completed and is available to view',
            time: '3 days ago',
            unread: false
        }
    ];

    const getNotificationConfig = (type) => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />,
                    color: theme.palette.success.main,
                    bgColor: alpha(theme.palette.success.main, 0.1)
                };
            case 'warning':
                return {
                    icon: <WarningAmberIcon sx={{ fontSize: 20 }} />,
                    color: theme.palette.warning.main,
                    bgColor: alpha(theme.palette.warning.main, 0.1)
                };
            default:
                return {
                    icon: <InfoOutlinedIcon sx={{ fontSize: 20 }} />,
                    color: theme.palette.info.main,
                    bgColor: alpha(theme.palette.info.main, 0.1)
                };
        }
    };

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 380 },
                    bgcolor: 'background.default',
                    backgroundImage: 'none'
                }
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box
                    sx={{
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main'
                            }}
                        >
                            <NotificationsIcon />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                                Notifications
                            </Typography>
                            {unreadCount > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                    {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1)
                            }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Notifications List */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                    {unreadCount > 0 && (
                        <Typography
                            variant="caption"
                            fontWeight={600}
                            color="text.secondary"
                            sx={{ px: 2, py: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}
                        >
                            New
                        </Typography>
                    )}
                    <List sx={{ p: 0 }}>
                        {notifications.filter(n => n.unread).map((notification, index) => {
                            const config = getNotificationConfig(notification.type);
                            return (
                                <Box key={notification.id} sx={{ mb: 1 }}>
                                    <ListItem
                                        alignItems="flex-start"
                                        sx={{
                                            py: 2,
                                            px: 2,
                                            bgcolor: 'background.paper',
                                            borderRadius: 2,
                                            border: `1px solid ${theme.palette.divider}`,
                                            boxShadow: `0 1px 3px ${alpha(theme.palette.primary.main, 0.05)}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                                                borderColor: alpha(theme.palette.primary.main, 0.3)
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                sx={{
                                                    bgcolor: config.bgColor,
                                                    color: config.color,
                                                    width: 44,
                                                    height: 44
                                                }}
                                            >
                                                {config.icon}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ flex: 1, pr: 1 }}>
                                                        {notification.title}
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: 'primary.main',
                                                            flexShrink: 0,
                                                            mt: 0.5
                                                        }}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
                                                        {notification.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                                                        {notification.time}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                </Box>
                            );
                        })}
                    </List>

                    {notifications.filter(n => !n.unread).length > 0 && (
                        <>
                            <Typography
                                variant="caption"
                                fontWeight={600}
                                color="text.secondary"
                                sx={{ px: 2, py: 1, mt: 2, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}
                            >
                                Earlier
                            </Typography>
                            <List sx={{ p: 0 }}>
                                {notifications.filter(n => !n.unread).map((notification) => {
                                    const config = getNotificationConfig(notification.type);
                                    return (
                                        <Box key={notification.id} sx={{ mb: 1 }}>
                                            <ListItem
                                                alignItems="flex-start"
                                                sx={{
                                                    py: 2,
                                                    px: 2,
                                                    bgcolor: 'background.paper',
                                                    borderRadius: 2,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                                                        borderColor: alpha(theme.palette.primary.main, 0.2)
                                                    }
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: config.bgColor,
                                                            color: config.color,
                                                            width: 44,
                                                            height: 44,
                                                            opacity: 0.7
                                                        }}
                                                    >
                                                        {config.icon}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle2" fontWeight={500} color="text.primary" sx={{ mb: 0.5 }}>
                                                            {notification.title}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
                                                                {notification.message}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                                                                {notification.time}
                                                            </Typography>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                        </Box>
                                    );
                                })}
                            </List>
                        </>
                    )}
                </Box>

                {/* Footer */}
                <Box
                    sx={{
                        p: 2,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                        boxShadow: `0 -4px 12px ${alpha(theme.palette.common.black, 0.05)}`
                    }}
                >
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<MarkEmailReadIcon />}
                        sx={{
                            py: 1.2,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                            }
                        }}
                    >
                        Mark all as read
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default NotificationDrawer;
