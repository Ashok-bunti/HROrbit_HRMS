// ============================================
// PAYROLL MODULE - ROUTES CONFIGURATION
// ============================================
// Add these routes to your routing configuration

import PayrollManagement from '../features/payroll/pages/PayrollManagement';
import SalaryStructure from '../features/payroll/pages/SalaryStructure';
import StatutoryRules from '../features/payroll/pages/StatutoryRules';
import Payslips from '../features/payroll/pages/Payslips';

// Example route configuration (adjust based on your router setup)
const payrollRoutes = [
    {
        path: '/payroll',
        element: <PayrollManagement />,
        meta: {
            title: 'Payroll Management',
            requiresAuth: true,
            permission: 'payroll:read',
        }
    },
    {
        path: '/payroll/salary-structure',
        element: <SalaryStructure />,
        meta: {
            title: 'Salary Structure',
            requiresAuth: true,
            permission: 'payroll:manage',
        }
    },
    {
        path: '/payroll/statutory-rules',
        element: <StatutoryRules />,
        meta: {
            title: 'Statutory Rules',
            requiresAuth: true,
            permission: 'payroll:manage',
        }
    },
    {
        path: '/payroll/payslips',
        element: <Payslips />,
        meta: {
            title: 'Payslips',
            requiresAuth: true,
            permission: 'payroll:read',
        }
    },
];

export default payrollRoutes;

// ============================================
// NAVIGATION MENU ITEMS
// ============================================
// Add to your sidebar/navigation menu

import {
    Receipt,
    AccountBalance,
    Gavel,
    Description,
} from '@mui/icons-material';

const payrollMenuItems = {
    title: 'Payroll',
    icon: <Receipt />,
    path: '/payroll',
    permission: 'payroll:read',
    children: [
        {
            title: 'Payroll Management',
            path: '/payroll',
            icon: <Receipt />,
            permission: 'payroll:read',
        },
        {
            title: 'Salary Structure',
            path: '/payroll/salary-structure',
            icon: <AccountBalance />,
            permission: 'payroll:manage',
        },
        {
            title: 'Statutory Rules',
            path: '/payroll/statutory-rules',
            icon: <Gavel />,
            permission: 'payroll:manage',
        },
        {
            title: 'Payslips',
            path: '/payroll/payslips',
            icon: <Description />,
            permission: 'payroll:read',
        },
    ],
};

export { payrollMenuItems };
