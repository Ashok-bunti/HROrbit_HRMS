import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Layout from '../layouts/components/Layout';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import ResetPassword from '../features/auth/pages/ResetPassword';
import MFASetup from '../features/auth/pages/MFASetup';
import Dashboard from '../features/dashboard/pages/Dashboard';
import Employees from '../features/employees/pages/Employees';
import Departments from '../features/departments/pages/Departments';
import Leaves from '../features/leaves/pages/Leaves';
import Attendance from '../features/attendance/pages/Attendance';
import Teams from '../features/teams/pages/Teams';
import Unauthorized from '../features/auth/pages/Unauthorized';
import ForcePasswordChange from '../features/auth/pages/ForcePasswordChange';

// Admin pages
import AdminDashboard from '../features/dashboard/pages/AdminDashboard';
import UserManagement from '../features/users/pages/UserManagement';
import Payroll from '../features/payroll/pages/Payroll';
import EngagementDashboard from '../features/dashboard/pages/EngagementDashboard';
import Biometric from '../features/attendance/pages/Biometric';
import Roles from '../features/roles/pages/Roles';
import Payslips from '../features/payroll/pages/Payslips';
import LeavePolicies from '../features/policies/pages/LeavePolicies';

// Employee pages
import EmployeeDashboard from '../features/dashboard/pages/EmployeeDashboard';
import EmployeeEngagement from '../features/engagement/pages/EmployeeEngagement';
import EmployeeProfile from '../features/employees/pages/EmployeeProfile';
import CompanyCalendar from '../features/calendar/pages/CompanyCalendar';
import HolidayCalendar from '../features/calendar/pages/HolidayCalendar';


const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/force-password-change" element={<ForcePasswordChange />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Admin routes */}
                <Route
                    path="admin/dashboard"
                    element={
                        <PrivateRoute requiredRole="admin">
                            <AdminDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="admin/users"
                    element={
                        <PrivateRoute requiredPermission="users:read">
                            <UserManagement />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="admin/payroll"
                    element={
                        <PrivateRoute requiredPermission="payroll:read">
                            <Payroll />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="admin/engagement"
                    element={
                        <PrivateRoute requiredPermission="surveys:read">
                            <EngagementDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="admin/biometric"
                    element={
                        <PrivateRoute requiredPermission="biometric:read">
                            <Biometric />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="admin/roles"
                    element={
                        <PrivateRoute requiredPermission="roles:read">
                            <Roles />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="admin/policies"
                    element={
                        <PrivateRoute requiredPermission="leave_policies:read">
                            <LeavePolicies />
                        </PrivateRoute>
                    }
                />

                {/* HR/Admin routes */}
                <Route path="dashboard" element={<EmployeeDashboard />} />

                <Route
                    path="employees"
                    element={
                        <PrivateRoute requiredPermission="employees:read">
                            <Employees />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="departments"
                    element={
                        <PrivateRoute requiredPermission="departments:read">
                            <Departments />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="teams"
                    element={
                        <PrivateRoute requiredPermission="teams:read">
                            <Teams />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="leaves"
                    element={
                        <PrivateRoute requiredPermission="leaves:read">
                            <Leaves />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="attendance"
                    element={
                        <PrivateRoute requiredPermission="attendance:read">
                            <Attendance />
                        </PrivateRoute>
                    }
                />

                <Route path="calendar" element={<CompanyCalendar />} />
                <Route path="holidays" element={<HolidayCalendar />} />

                <Route path="settings/security" element={<MFASetup />} />

                {/* Employee routes */}
                <Route path="employee/dashboard" element={<Dashboard />} />
                <Route path="employee/profile" element={<EmployeeProfile />} />
                <Route path="employee/leaves" element={<Leaves />} />
                <Route path="employee/attendance" element={<Attendance />} />
                <Route path="employee/payslips" element={<Payslips />} />
                <Route path="employee/engagement" element={<EmployeeEngagement />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default AppRoutes;
