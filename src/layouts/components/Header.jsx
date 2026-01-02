import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Box, Tooltip, InputBase, CircularProgress, ListItemIcon, Divider, Popover, Grid, alpha } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import { Palette, Brightness4, Brightness7, Security, Logout, Person, Check } from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useColorMode } from '../../context/ThemeContext';
import { useGetEmployeeByUserIdQuery } from '../../features/employees/store/employeeApi';
import logo_image from '../../../public/logo.png';
import NotificationDrawer from '../../features/notifications/components/NotificationDrawer';

const PRESET_COLORS = [
    { name: 'Deep Navy', primary: '#1A2A4F', secondary: '#60A5FA' },
    { name: 'Sunset Peach', primary: '#FFB76C', secondary: '#FFF57E' },
    { name: 'Creamy Gold', primary: '#FFF57E', secondary: '#FFB76C' },
    { name: 'Corporate Blue', primary: '#2563EB', secondary: '#60A5FA' },
    { name: 'Classic Indigo', primary: '#4F46E5', secondary: '#818CF8' },
    { name: 'Forest Teal', primary: '#0D9488', secondary: '#5EEAD4' },
];

const Header = ({ onMenuClick, drawerWidth }) => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode, toggleColorMode, primaryColor, setPrimaryColor, setSecondaryColor } = useColorMode();
    const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
    const [themeAnchor, setThemeAnchor] = useState(null);

    const { data: employeeData } = useGetEmployeeByUserIdQuery(user?.id, {
        skip: !user?.id
    });

    const profilePhoto = useMemo(() => {
        if (employeeData?.employee?.documents?.passport_photo) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            return `${baseUrl}/employees/${user.id}/documents/passport_photo/view?token=${token}`;
        }
        return null;
    }, [employeeData, user?.id, token]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
                bgcolor: 'background.default',
                color: 'text.primary',
                boxShadow: 'none',
                borderBottom: 'none'
            }}
        >
            <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: 64, px: 3 }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={onMenuClick}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box
                        component="img"
                        src={logo_image}
                        alt="HRMS Portal"
                        sx={{
                            height: 40,
                            objectFit: 'contain',
                            filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none'
                        }}
                    />
                </Box>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 2 },
                    bgcolor: 'background.paper',
                    px: 3,
                    height: 64,
                    borderRadius: '50px 0 0 50px',
                }}>
                    {/* Theme Customizer Icon */}


                    {/* Color Mode Toggle */}
                    <Box
                        onClick={toggleColorMode}
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            bgcolor: 'background.default',
                            borderRadius: 50,
                            p: 0.5,
                            cursor: 'pointer',
                            gap: 0.5,
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e0e0e0'
                            }
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                bgcolor: mode === 'light' ? 'white' : 'transparent',
                                boxShadow: mode === 'light' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                                transition: 'all 0.2s',
                                color: mode === 'light' ? 'warning.main' : 'text.secondary'
                            }}
                        >
                            <Brightness7 sx={{ fontSize: 18 }} />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                bgcolor: mode === 'dark' ? 'grey.800' : 'transparent',
                                boxShadow: mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                                transition: 'all 0.2s',
                                color: mode === 'dark' ? primaryColor : 'text.secondary'
                            }}
                        >
                            <Brightness4 sx={{ fontSize: 18 }} />
                        </Box>
                    </Box>
                    <Tooltip title="Customize Theme">
                        <IconButton
                            onClick={(e) => setThemeAnchor(e.currentTarget)}
                            sx={{
                                bgcolor: 'background.default',
                                '&:hover': { bgcolor: alpha(primaryColor, 0.1) },
                                transition: 'all 0.2s'
                            }}
                        >
                            <Palette sx={{ color: primaryColor }} />
                        </IconButton>
                    </Tooltip>
                    <IconButton
                        onClick={() => setNotificationDrawerOpen(true)}
                        sx={{
                            bgcolor: 'background.default',
                            '&:hover': { bgcolor: '#e0e0e0' },
                            display: { xs: 'flex', sm: 'flex' }
                        }}
                    >
                        <NotificationsNoneIcon color="action" />
                        <Box sx={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, bgcolor: 'error.main', borderRadius: '50%', border: '1px solid white' }} />
                    </IconButton>


                    <IconButton sx={{
                        bgcolor: 'background.default',
                        '&:hover': { bgcolor: '#e0e0e0' },
                        display: { xs: 'none', md: 'flex' }
                    }}>
                        <SearchIcon color="action" />
                    </IconButton>


                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            bgcolor: 'background.default',
                            borderRadius: 50,
                            p: 0.5,
                            pl: 2,
                            cursor: 'default',
                        }}
                    >
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="subtitle2" fontWeight="bold" lineHeight={1.2}>
                                {employeeData?.employee?.full_name || user?.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" lineHeight={1}>
                                {user?.role?.toUpperCase()}
                            </Typography>
                        </Box>
                        <Avatar
                            src={profilePhoto}
                            sx={{
                                width: 40,
                                height: 40,
                                border: '2px solid',
                                borderColor: 'primary.light'
                            }}
                        >
                            {user?.email?.charAt(0).toUpperCase()}
                        </Avatar>
                    </Box>
                </Box>
            </Toolbar>

            {/* Theme Settings Popover */}
            <Popover
                open={Boolean(themeAnchor)}
                anchorEl={themeAnchor}
                onClose={() => setThemeAnchor(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        width: 280,
                        p: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }
                }}
            >
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, px: 0.5 }}>
                    Preset Themes
                </Typography>
                <Grid container spacing={1}>
                    {PRESET_COLORS.map((preset) => (
                        <Grid item xs={12} key={preset.name}>
                            <Box
                                onClick={() => {
                                    setPrimaryColor(preset.primary);
                                    setSecondaryColor(preset.secondary);
                                    setThemeAnchor(null);
                                }}
                                sx={{
                                    p: 1.2,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    border: `1px solid ${primaryColor === preset.primary ? primaryColor : 'divider'}`,
                                    bgcolor: primaryColor === preset.primary ? alpha(preset.primary, 0.08) : 'transparent',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: alpha(preset.primary, 0.12),
                                        borderColor: preset.primary
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: -0.5 }}>
                                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: preset.primary, border: '2px solid white', zIndex: 2 }} />
                                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: preset.secondary, border: '2px solid white', marginLeft: -0.8, zIndex: 1 }} />
                                </Box>
                                <Typography variant="body2" fontWeight={primaryColor === preset.primary ? 700 : 500} color="text.primary">
                                    {preset.name}
                                </Typography>
                                {primaryColor === preset.primary && (
                                    <Check sx={{ ml: 'auto', fontSize: 16, color: preset.primary }} />
                                )}
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, px: 0.5 }}>
                    Custom Color
                </Typography>
                <Box sx={{ px: 0.5 }}>
                    <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        style={{
                            width: '100%',
                            height: 40,
                            padding: 0,
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            backgroundColor: 'transparent'
                        }}
                    />
                </Box>
            </Popover>

            {/* Notification Drawer */}
            <NotificationDrawer
                open={notificationDrawerOpen}
                onClose={() => setNotificationDrawerOpen(false)}
            />
        </AppBar >
    );
};

export default Header;
