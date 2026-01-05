import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Sidebar from './Sidebar';
import Header from './Header';

// Drawer width handled dynamically inside Layout

const Layout = () => {
    const theme = useTheme();
    // Tablet/Laptop check (Between 768px and 1200px)
    const isTabletOrLaptop = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
    // Desktop check (>= 1200px)
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Effect to auto-set sidebar state based on device
    // Strategy: Tablet = Mini (Collapsed), Desktop = Expanded
    // We use a specific effect to react to media query changes
    useEffect(() => {
        if (isTabletOrLaptop) {
            setIsSidebarCollapsed(true);
        } else if (isDesktop) {
            setIsSidebarCollapsed(false);
        }
    }, [isTabletOrLaptop, isDesktop]);

    // Dynamic drawer width based on collapse state
    // 80px for collapsed (icon only), 240px for expanded
    const currentDrawerWidth = isSidebarCollapsed ? 80 : 240;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Header onMenuClick={handleDrawerToggle} drawerWidth={currentDrawerWidth} />
            <Sidebar
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
                drawerWidth={currentDrawerWidth}
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
                    // The original code had margin logic in Header but Main just had width calculation.
                    // Let's check Main box styles.
                    // Original: width: { sm: `calc(100% - ${drawerWidth}px)` }
                    // It didn't have ml? It was flex container.
                    // Box sx={{ display: 'flex' }} wraps everything. Sidebar is in flow?
                    // Sidebar has Drawer variant="permanent".
                    // Drawer permanent usually takes up space if position is relative? No, default is fixed or something?
                    // Mui Drawer permanent adds CSS to separate?
                    // Let's trust the flex layout. The Box width change is correct.
                    // Transition for smooth effect
                    transition: (theme) => theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    backgroundColor: (theme) => theme.palette.background.default,
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
