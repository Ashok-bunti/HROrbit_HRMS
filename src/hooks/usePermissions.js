import { useSelector } from 'react-redux';
import { selectUserRole, selectUserPermissions, selectIsAdmin } from '../features/auth/store/authSlice'; // Ensure selectIsAdmin is exported
import { hasPermission as checkPermission, hasAnyPermission as checkAny, hasAllPermissions as checkAll } from '../utils/permissions';

export const usePermissions = () => {
    const userRole = useSelector(selectUserRole);
    const permissions = useSelector(selectUserPermissions);
    const isAdminUser = useSelector(selectIsAdmin); // Helper from slice

    // Admin role override (if we want hardcoded admin superuser logic on frontend too)
    // Generally better to rely on permissions object, but 'admin' role name often implies superuser.
    // Our permissions.js logic handles module.manage = true, but if 'admin' role has { *: manage } that works.
    // For safety, let's trust the permissions object mostly, but ensure admin role usually has access.

    return {
        // Core check function: can('employees', 'create')
        can: (module, action) => {
            // Admin override loop hole just in case permissions aren't fully synced yet for 'admin' role
            if (isAdminUser) return true;
            return checkPermission(permissions, module, action);
        },

        // Helper for array of requirements: canAny(['employees:read', 'users:read'])
        canAny: (requirements) => {
            if (isAdminUser) return true;
            return checkAny(permissions, requirements);
        },

        canAll: (requirements) => {
            if (isAdminUser) return true;
            return checkAll(permissions, requirements);
        },

        permissions,
        userRole,
        isAdmin: userRole === 'admin',
        isHR: userRole === 'hr' || userRole === 'admin',
        isEmployee: userRole === 'employee',
    };
};

export default usePermissions;
