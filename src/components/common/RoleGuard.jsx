import { usePermissions } from '../hooks/usePermissions';

const RoleGuard = ({ children, require, requireAny, requireAll, fallback = null }) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin, isHR, userRole } = usePermissions();

    // Check role-based requirements
    if (require) {
        if (Array.isArray(require)) {
            if (!require.includes(userRole)) return fallback;
        } else if (require === 'admin' && !isAdmin) {
            return fallback;
        } else if (require === 'hr' && !isHR) {
            return fallback;
        } else if (typeof require === 'string' && userRole !== require) {
            return fallback;
        }
    }

    // Check permission-based requirements
    if (requireAny && !hasAnyPermission(requireAny)) {
        return fallback;
    }

    if (requireAll && !hasAllPermissions(requireAll)) {
        return fallback;
    }

    return children;
};

export default RoleGuard;
