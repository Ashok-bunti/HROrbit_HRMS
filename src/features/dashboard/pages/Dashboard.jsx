import React from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { useGetAllAttendanceQuery, useClockInMutation, useClockOutMutation, useUpdateAttendanceMutation } from '../../attendance/store/attendanceApi';
import { useGetLeaveStatsQuery, useGetAllLeavesQuery } from '../../leaves/store/leaveApi';
import { useGetEmployeeByIdQuery } from '../../employees/store/employeeApi';
import { useGetEmployeePayslipsQuery } from '../../payroll/store/payrollApi';
import { format } from 'date-fns';

// Widget Components
import EmployeeProfileWidget from '../components/EmployeeProfileWidget';
import AttendanceWidget from '../components/AttendanceWidget';
import LeaveBalanceWidget from '../components/LeaveBalanceWidget';
import SalaryWidget from '../components/SalaryWidget';
import AnnouncementWidget from '../components/AnnouncementWidget';

const Dashboard = () => {
    const { user, token } = useAuth();
    const today = new Date().toISOString().split('T')[0];

    // API Hooks
    const { data: employeeData } = useGetEmployeeByIdQuery(user?.employee?.id, { skip: !user?.employee?.id });
    console.log("employeeData", employeeData);
    const { data: attendanceData } = useGetAllAttendanceQuery({});
    const { data: leaveStats } = useGetLeaveStatsQuery();
    const { data: allLeavesData } = useGetAllLeavesQuery({});
    const { data: payslipsData } = useGetEmployeePayslipsQuery(user?.employee?.id, { skip: !user?.employee?.id });

    const [clockIn, { isLoading: isClockingIn }] = useClockInMutation();
    const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();
    const [updateAttendance] = useUpdateAttendanceMutation();

    // Find today's attendance record - use loose equality for IDs and check multiple date fields
    const todayAttendance = attendanceData?.attendance?.find(
        record => {
            const recordDate = record.date ? new Date(record.date).toISOString().split('T')[0] : null;
            const checkInDate = record.check_in_time ? new Date(record.check_in_time).toISOString().split('T')[0] : null;

            const matchesDay = recordDate === today || record.date === today || checkInDate === today;

            const matchesUser =
                String(record.employee_id) === String(user?.employee?.id) ||
                String(record.employee_id) === String(user?.id);

            return matchesDay && matchesUser;
        }
    );

    // Prepare Employee Data - Access nested employee object
    const emp = employeeData?.employee;

    // Calculate experience if date_of_joining is available
    const calculateExperience = (joiningDate) => {
        if (!joiningDate) return '0 Yrs';
        const start = new Date(joiningDate);
        const now = new Date();
        const diffInMs = now - start;
        const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
        if (diffInYears < 1) {
            const months = Math.floor(diffInYears * 12);
            return `${months} Mos`;
        }
        return `${Math.floor(diffInYears)} Yrs`;
    };

    const employee = {
        name: emp?.first_name
            ? `${emp.first_name} ${emp.last_name || ''}`.trim()
            : user?.name || 'John Doe',
        id: emp?.employee_code || user?.employee?.employee_code || 'EMP-2024-001',
        department: emp?.department_name || emp?.departments?.name || 'Banking',
        designation: emp?.position || 'Senior Developer',
        experience: calculateExperience(emp?.date_of_joining),
        joiningDate: emp?.date_of_joining
            ? format(new Date(emp.date_of_joining), 'MMM yyyy')
            : 'Jan 2023',
        avatar: emp?.documents?.passport_photo ? `/api/employees/${emp.user_id}/documents/passport_photo/view?token=${token}` : null
    };

    // Prepare Attendance Data
    const formatTime = (timeStr) => {
        if (!timeStr) return '--:--';
        try {
            return format(new Date(timeStr), 'hh:mm a');
        } catch {
            return '--:--';
        }
    };

    const calculateWorkingHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '0h 0m';
        try {
            const diff = new Date(checkOut) - new Date(checkIn);
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        } catch {
            return '0h 0m';
        }
    };

    const getAttendanceStatus = () => {
        if (todayAttendance?.check_out_time) return 'Checked Out';
        if (todayAttendance?.status) return todayAttendance.status;
        if (todayAttendance?.check_in_time) return 'Present';
        return 'Not Checked In';
    };

    const attendance = {
        date: format(new Date(), 'EEEE, MMMM dd, yyyy'),
        checkIn: formatTime(todayAttendance?.check_in_time),
        checkOut: formatTime(todayAttendance?.check_out_time),
        workingHours: calculateWorkingHours(todayAttendance?.check_in_time, todayAttendance?.check_out_time),
        status: getAttendanceStatus()
    };

    // Prepare Leave Data
    const pendingLeaves = allLeavesData?.leaves?.filter(l => l.status === 'Pending')?.length || 0;
    const leaveBalance = {
        casual: leaveStats?.casual_leave || 8,
        sick: leaveStats?.sick_leave || 5,
        earned: leaveStats?.earned_leave || 12,
        pending: pendingLeaves
    };

    // Prepare Salary Data
    const lastPayslip = payslipsData?.payslips?.[0];
    const salary = lastPayslip || {
        lastPaid: '₹0',
        payMonth: 'No data',
        nextPayDate: 'Pending'
    };

    // Handlers
    const handleClockIn = async () => {
        try {
            // Use employee.id if available, falling back to user.id
            const targetId = user?.employee?.id || user?.id;
            await clockIn(targetId).unwrap();
        } catch (err) {
            alert(err.data?.error || 'Failed to clock in');
        }
    };

    const handleClockOut = async () => {
        try {
            const targetId = user?.employee?.id || user?.id;
            await clockOut(targetId).unwrap();
        } catch (err) {
            alert(err.data?.error || 'Failed to clock out');
        }
    };

    return (
        <Box sx={{ p: 2, mt: -3 }}>
            {/* First Row: Employee Profile + Attendance */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                        md: '1fr 1fr 1fr 1fr',
                    },
                    gap: 3,
                    mb: 3,
                }}
            >
                <LeaveBalanceWidget leaveBalance={leaveBalance} />
            </Box>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '3fr 3fr 3fr' },
                gap: 3,
                mb: 3
            }}>
                <EmployeeProfileWidget employee={employee} />
                <AttendanceWidget
                    attendance={attendance}
                    onClockIn={handleClockIn}
                    onClockOut={handleClockOut}
                    isClockingIn={isClockingIn}
                    isClockingOut={isClockingOut}
                    todayAttendance={todayAttendance}
                />
                <SalaryWidget salary={salary} />

            </Box>

            {/* Second Row: Salary + Announcements */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
                gap: 3
            }}>
                <AnnouncementWidget />
            </Box>
        </Box>
    );
};

export default Dashboard;
