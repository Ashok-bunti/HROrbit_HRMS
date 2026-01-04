/**
 * Permission Utilities for Frontend RBAC
 * 
 * Works with the backend permission structure:
 * {
 *   "moduleName": {
 *     "create": boolean,
 *     "read": boolean,
 *     "update": boolean,
 *     "delete": boolean,
 *     "manage": boolean
 *   }
 * }
 */

/**
 * Check if a user has a specific permission
 * @param {Object} permissions - The user's permission object
 * @param {string} module - The module name (e.g., 'employees')
 * @param {string} action - The action (e.g., 'create', 'read')
 * @returns {boolean}
 */
export const hasPermission = (permissions, module, action = 'read') => {
    if (!permissions) return false;

    // Check if module exists
    const modulePerms = permissions[module];
    if (!modulePerms) return false; // No access to this module

    // Admin override (manage permission grants everything for that module)
    if (modulePerms.manage === true) return true;

    // Check specific action
    return modulePerms[action] === true;
};

/**
 * Check if user has ANY of the required permissions
 * @param {Object} permissions - The user's permission object
 * @param {Array<string>} requiredPermissions - Array of strings in format "module:action"
 * @returns {boolean}
 */
export const hasAnyPermission = (permissions, requiredPermissions) => {
    if (!permissions || !requiredPermissions) return false;

    return requiredPermissions.some(permString => {
        const [module, action] = permString.split(':');
        return hasPermission(permissions, module, action || 'read');
    });
};

/**
 * Check if user has ALL of the required permissions
 * @param {Object} permissions - The user's permission object
 * @param {Array<string>} requiredPermissions - Array of strings in format "module:action"
 * @returns {boolean}
 */
export const hasAllPermissions = (permissions, requiredPermissions) => {
    if (!permissions || !requiredPermissions) return false;

    return requiredPermissions.every(permString => {
        const [module, action] = permString.split(':');
        return hasPermission(permissions, module, action || 'read');
    });
};

// Legacy helpers mapping to new permissions
// These keep existing code working while migrating
export const PERMISSIONS = {
    // User Management
    VIEW_USERS: 'users:read',
    CREATE_USER: 'users:create',
    UPDATE_USER: 'users:update',
    DELETE_USER: 'users:delete',

    // Employee Management
    VIEW_ALL_EMPLOYEES: 'employees:read',
    CREATE_EMPLOYEE: 'employees:create',
    UPDATE_EMPLOYEE: 'employees:update',
    DELETE_EMPLOYEE: 'employees:delete',

    // Departments
    VIEW_DEPARTMENTS: 'departments:read',
    MANAGE_DEPARTMENTS: 'departments:manage',

    // Leaves
    VIEW_ALL_LEAVES: 'leaves:read',
    APPROVE_LEAVE: 'leaves:update',

    // Attendance
    VIEW_ALL_ATTENDANCE: 'attendance:read',

    // New Roles
    VIEW_ROLES: 'roles:read',
    MANAGE_ROLES: 'roles:manage',

    // Teams
    VIEW_TEAMS: 'teams:read',
    MANAGE_TEAMS: 'teams:manage'
};
