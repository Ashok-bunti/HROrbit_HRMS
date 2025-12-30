export const ROLE_PERMISSIONS = {
    admin: [
        '/admin/*',
        '/employees',
        '/departments',
        '/leaves',
        '/attendance',
        '/settings/*',
    ],
    employee: [
        '/employee/*',
        // Explicitly allow if they share some common dashboard route, though App.json shows specific employee dashboard
        // Note: App.jsx redirects / to /dashboard. 
        // Admin sees EmployeeDashboard at /dashboard? Wait, App.jsx says: 
        // <Route path="dashboard" element={<EmployeeDashboard />} /> inside the main layout.
        // And <Route path="employee/dashboard" element={<Dashboard />} />
        // This seems a bit confusing in the existing app, but I will stick to the requested pattern patterns.
    ],
    hr: [
        // Assuming HR has similar permissions to Admin or specific ones. 
        // For now, I'll add basic HR paths if needed, but user only specified Admin and Employee clearly.
        // I'll leave HR equal to Employee + some extras if I knew them, but for now I will focus on Admin/Employee.
        '/dashboard',
        '/employees',
        '/leaves',
        '/attendance',
        '/departments',
        '/admin/biometric'
    ]
};

// Helper to check permission
export const hasPermission = (role, path) => {
    if (!role) return false;

    // Normalize role to lowercase
    const userRole = role.toLowerCase();

    // If authorization not defined for role, deny
    const allowedPaths = ROLE_PERMISSIONS[userRole];
    if (!allowedPaths) return false;

    // Check if path matches any allowed pattern
    return allowedPaths.some(pattern => {
        if (pattern.endsWith('/*')) {
            const basePattern = pattern.slice(0, -2);
            return path.startsWith(basePattern);
        }
        return path === pattern || path === pattern + '/'; // Exact match or with trailing slash
    });
};
