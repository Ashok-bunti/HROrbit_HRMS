import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = ({ children, requiredRole, requiredPermission }) => {
    const { user, loading } = useAuth();
    const { can, userRole, isAdmin } = usePermissions();
    const location = useLocation();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // 1. Check strict role requirement if provided
    if (requiredRole) {
        if (requiredRole === 'admin' && !isAdmin) {
            return <Navigate to="/unauthorized" replace />;
        }
        if (requiredRole !== 'admin' && userRole !== requiredRole && !isAdmin) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // 2. Check granular permission if provided (e.g., 'users:read')
    if (requiredPermission) {
        const [module, action] = requiredPermission.split(':');
        if (!can(module, action || 'read')) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default PrivateRoute;
