import React, { useState } from 'react';
import {
    Drawer,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    IconButton,
    Tooltip,
    Collapse
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CampaignIcon from '@mui/icons-material/Campaign';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import SecurityIcon from '@mui/icons-material/Security';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useNavigate, useLocation } from 'react-router-dom';
import logo_image from '../../../public/logo.png';
import { usePermissions } from '../../hooks/usePermissions';
import { useTheme } from '@mui/material/styles';
import GroupsIcon from '@mui/icons-material/Groups';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth, isCollapsed, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { can, userRole, isEmployee } = usePermissions();
    const theme = useTheme();

    // State for expandable menu items
    const [expandedMenus, setExpandedMenus] = useState({});

    const menuItems = [];

    // 1. Dashboard Logic
    if (userRole === 'admin') {
        menuItems.push({ text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' });
    } else if (userRole === 'hr') {
        menuItems.push({ text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' });
    } else {
        menuItems.push({ text: 'Dashboard', icon: <DashboardIcon />, path: '/employee/dashboard' });
    }

    // 2. Management Modules (RBAC Protected)
    // Only add these if the user has specific read permissions
    if (can('users', 'read')) {
        menuItems.push({ text: 'User Management', icon: <ManageAccountsIcon />, path: '/admin/users' });
    }

    if (can('roles', 'read')) {
        menuItems.push({ text: 'Role Management', icon: <SecurityIcon />, path: '/admin/roles' });
    }

    if (can('employees', 'read') && !isEmployee) {
        menuItems.push({ text: 'Employee Management', icon: <PeopleIcon />, path: '/employees' });
    }

    if (can('departments', 'read') && !isEmployee) {
        menuItems.push({ text: 'Department', icon: <BusinessIcon />, path: '/departments' });
    }

    if (can('teams', 'read') && !isEmployee) {
        menuItems.push({ text: 'Teams', icon: <GroupsIcon />, path: '/teams' });
    }




    if (can('leave_policies', 'read') && !isEmployee) {
        menuItems.push({ text: 'Leave Policies', icon: <FactCheckIcon />, path: '/admin/policies' });
    }


    if (can('leaves', 'read')) { // Can view all leaves
        menuItems.push({ text: 'Leaves Management', icon: <EventNoteIcon />, path: '/leaves' });
    }

    // Available to all users

    menuItems.push({ text: 'Company Calendar', icon: <EventAvailableIcon />, path: '/holidays' });
    menuItems.push({ text: 'Roster', icon: <CalendarMonthIcon />, path: '/roster' });

    // Payroll Management with submenu
    if (can('payroll', 'read')) {
        const payrollChildren = [
            {
                text: 'Payroll Management',
                icon: <ReceiptIcon />,
                path: '/payroll',
                permission: 'payroll:read',
            },
            {
                text: 'Salary Structure',
                icon: <AccountBalanceIcon />,
                path: '/payroll/salary-structure',
                permission: 'payroll:manage',
            },
            {
                text: 'Statutory Rules',
                icon: <GavelIcon />,
                path: '/payroll/statutory-rules',
                permission: 'payroll:manage',
            },
            {
                text: 'Payslips',
                icon: <DescriptionIcon />,
                path: '/payroll/payslips',
                permission: 'payroll:read',
            },
        ].filter(child => !child.permission || can(child.permission.split(':')[0], child.permission.split(':')[1]));

        menuItems.push({
            text: 'Payroll',
            icon: <ReceiptIcon />,
            path: '/payroll',
            children: payrollChildren,
        });
    }

    // Attendance Logic
    if (can('attendance', 'read')) {
        const attendanceChildren = [
            {
                text: 'General Attendance',
                icon: <AccessTimeIcon />,
                path: '/attendance',
                permission: 'attendance:read',
            }
        ].filter(child => !child.permission || can(child.permission.split(':')[0], child.permission.split(':')[1]));

        menuItems.push({
            text: 'Attendance',
            icon: <AccessTimeIcon />,
            path: '/attendance',
            children: attendanceChildren.length > 1 ? attendanceChildren : null
        });

        // If it only has one child and it's general attendance, we might not want it as a dropdown
        // But the above logic handles it. If children is null, it displays as a single item.
        if (attendanceChildren.length === 1 && attendanceChildren[0].path === '/attendance') {
            // Keep as is, it's already pushed above but with children: null
        }
    }

    if (can('biometric', 'read')) {
        menuItems.push({ text: 'Biometric', icon: <FingerprintIcon />, path: '/biometric' });
    }

    /*
    if (can('surveys', 'read') || can('feedback', 'read')) {
        menuItems.push({ text: 'Engagement', icon: <CampaignIcon />, path: '/admin/engagement' });
    }
    */

    // Settings (Admin usually)
    // if (can('users', 'manage') || userRole === 'admin') {
    //     menuItems.push({ text: 'Settings', icon: <AdminPanelSettingsIcon />, path: '/settings' });
    // }

    // 3. Employee Self-Service (Fallback or Additional)
    // If the user is NOT a manager (doesn't have broad read access), show self-service items.
    // Or if they are strictly in the 'employee' role.
    const isManager = can('employees', 'read') || can('users', 'read');

    // 3. Employee Self-Service (Available to all)
    if (!menuItems.find(i => i.text === 'Employee Profile')) {
        menuItems.push({ text: 'Employee Profile', icon: <PersonIcon />, path: '/employee/profile' });
    }



    /*
    // fallback Self-Service items for those without management access
    if (!isManager || userRole === 'employee') {
        if (!can('leaves', 'read')) {
            menuItems.push({ text: 'Leaves', icon: <EventNoteIcon />, path: '/employee/leaves' });
        }

        if (!can('attendance', 'read')) {
            menuItems.push({ text: 'Attendance', icon: <AccessTimeIcon />, path: '/employee/attendance' });
        }

        if (!can('payroll', 'read')) {
            menuItems.push({ text: 'Payslips', icon: <ReceiptIcon />, path: '/employee/payslips' });
        }

        if (!can('surveys', 'read')) {
            menuItems.push({ text: 'Engagement', icon: <CampaignIcon />, path: '/employee/engagement' });
        }
    }
    */

    // Helper for active styles
    const getListItemStyles = (path) => {
        const isActive = location.pathname === path;
        return {
            justifyContent: isCollapsed ? 'center' : 'initial',
            px: 2.5,
            py: 1.5,
            minHeight: 48,
            position: 'relative',
            my: 0.5,
            borderRadius: isCollapsed ? '12px' : '0 24px 24px 0',
            mr: isCollapsed ? 1 : 2,
            ml: isCollapsed ? 1 : 0,
            '&:before': isActive && !isCollapsed ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                backgroundColor: 'primary.main',
                borderTopRightRadius: 4,
                borderBottomRightRadius: 4,
            } : {},
            bgcolor: isActive ? (isCollapsed ? 'primary.main' : 'alpha(primary.main, 0.1)') : 'transparent',
            '&:hover': {
                bgcolor: isActive ? (isCollapsed ? 'primary.main' : 'alpha(primary.main, 0.2)') : 'action.hover',
            }
        };
    };

    const getIconStyles = (path) => {
        const isActive = location.pathname === path;
        return {
            minWidth: 0,
            mr: isCollapsed ? 0 : 3,
            justifyContent: 'center',
            color: isActive ? (isCollapsed ? 'white' : 'primary.main') : 'text.secondary',
        };
    };

    const handleLogout = () => {
        // Clear auth and redirect
        // Assuming logout logic is handled elsewhere or simple redirect
        // In real app, call logout from context
        localStorage.removeItem('token'); // Basic cleanup
        navigate('/login');
    };

    const drawer = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
        }}>
            {/* Header / Toggle (Sticky) */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                p: 2,
                height: 64,
                flexShrink: 0
            }}>
                {!isCollapsed && (
                    <Box
                        component="img"
                        src={logo_image}
                        alt="HRMS"
                        sx={{
                            height: 32,
                            objectFit: 'contain',
                            filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none'
                        }}
                    />
                )}
                <IconButton onClick={toggleSidebar}>
                    {isCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
                </IconButton>
            </Box>
            <Divider />

            {/* Middle Scrollable Section */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                pt: 1,
                pb: 1,
                /* Custom Thin Scrollbar */
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.divider,
                    borderRadius: '10px'
                },
                '&:hover::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.action.selected
                }
            }}>
                <List sx={{ px: 0 }}>
                    {menuItems.map((item) => (
                        <React.Fragment key={item.text}>
                            <ListItem disablePadding sx={{ display: 'block' }}>
                                <Tooltip title={isCollapsed ? item.text : ''} placement="right">
                                    <ListItemButton
                                        onClick={() => {
                                            if (item.children && item.children.length > 0) {
                                                // Toggle expand/collapse
                                                setExpandedMenus(prev => ({
                                                    ...prev,
                                                    [item.text]: !prev[item.text]
                                                }));
                                            } else {
                                                // Navigate to path
                                                navigate(item.path);
                                            }
                                        }}
                                        sx={getListItemStyles(item.path)}
                                    >
                                        <ListItemIcon sx={getIconStyles(item.path)}>
                                            {item.icon}
                                        </ListItemIcon>
                                        {!isCollapsed && (
                                            <>
                                                <ListItemText
                                                    primary={item.text}
                                                    primaryTypographyProps={{
                                                        fontWeight: location.pathname.startsWith(item.path) ? 600 : 400,
                                                        color: location.pathname.startsWith(item.path) ? 'primary.main' : 'text.primary',
                                                        fontSize: '0.875rem'
                                                    }}
                                                />
                                                {item.children && item.children.length > 0 && (
                                                    expandedMenus[item.text] ? <ExpandLessIcon /> : <ExpandMoreIcon />
                                                )}
                                            </>
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>

                            {/* Render children if exists */}
                            {item.children && item.children.length > 0 && !isCollapsed && (
                                <Collapse in={expandedMenus[item.text]} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.children.map((child) => (
                                            <ListItem key={child.text} disablePadding sx={{ display: 'block' }}>
                                                <ListItemButton
                                                    onClick={() => navigate(child.path)}
                                                    sx={{
                                                        pl: 4,
                                                        py: 1,
                                                        minHeight: 40,
                                                        borderRadius: '0 20px 20px 0',
                                                        mr: 2,
                                                        bgcolor: location.pathname === child.path
                                                            ? 'rgba(249, 115, 22, 0.08)'
                                                            : 'transparent',
                                                        '&:hover': {
                                                            bgcolor: location.pathname === child.path
                                                                ? 'rgba(249, 115, 22, 0.12)'
                                                                : 'action.hover',
                                                        }
                                                    }}
                                                >
                                                    <ListItemIcon sx={{
                                                        minWidth: 0,
                                                        mr: 2,
                                                        justifyContent: 'center',
                                                        color: location.pathname === child.path ? 'primary.main' : 'text.secondary',
                                                    }}>
                                                        {child.icon}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={child.text}
                                                        primaryTypographyProps={{
                                                            fontWeight: location.pathname === child.path ? 600 : 400,
                                                            color: location.pathname === child.path ? 'primary.main' : 'text.primary',
                                                            fontSize: '0.8125rem'
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </Box>

            {/* Bottom/Logout (Sticky) */}
            <Box sx={{ p: 2, flexShrink: 0 }}>
                <Divider sx={{ mb: 2 }} />
                <Tooltip title="Logout" placement="right">
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            justifyContent: isCollapsed ? 'center' : 'initial',
                            borderRadius: 2,
                            color: 'error.main',
                            '&:hover': { bgcolor: 'error.lighter' }
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: 0,
                            mr: isCollapsed ? 0 : 3,
                            justifyContent: 'center',
                            color: 'error.main'
                        }}>
                            <PowerSettingsNewIcon />
                        </ListItemIcon>
                        {!isCollapsed && (
                            <ListItemText primary="Logout" />
                        )}
                    </ListItemButton>
                </Tooltip>
            </Box>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                }}
            >
                {/* On mobile, force correct drawer content. 
                    Note: If we pass 'drawer' directly, it might use 'isCollapsed' from desktop state. 
                    Ideally, mobile drawer should always be expanded. 
                    But 'drawer' depends on closure variables 'isCollapsed'.
                    Refactoring 'drawer' render function would be cleaner, but for now assuming mobile users 
                    don't trigger 'isCollapsed' state or I accept the state. 
                    Better: Pass props to a child or just render inline.
                    Since I am rewriting, I will make 'drawer' content function-based or just assume 'isCollapsed' is false for mobile?
                    Check Layout.jsx: 'isSidebarCollapsed' default true.
                    If mobile user opens drawer, it will be collapsed? That's bad.
                    I should ensure Sidebar handles mobile non-collapsed view.
                */}
                {/* Rendering logic adjusted for mobile: always show full text */}
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
                    {/* Simplified Mobile Content - Header */}
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Box
                            component="img"
                            src={logo_image}
                            alt="HRMS"
                            sx={{
                                height: 40,
                                objectFit: 'contain',
                                filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none'
                            }}
                        />
                    </Box>
                    <Divider />

                    {/* Mobile Scrollable List */}
                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        <List>
                            {menuItems.map((item) => (
                                <ListItemButton key={item.text} onClick={() => { navigate(item.path); handleDrawerToggle(); }}>
                                    <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>

                    {/* Mobile Logout - Footer */}
                    <Box sx={{ p: 1, flexShrink: 0 }}>
                        <Divider />
                        <ListItemButton onClick={handleLogout} sx={{ color: 'error.main', borderRadius: 2, mt: 1 }}>
                            <ListItemIcon sx={{ color: 'error.main' }}><PowerSettingsNewIcon /></ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    </Box>
                </Box>
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        border: 'none',
                        transition: (theme) => theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        overflowX: 'hidden'
                    },
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
