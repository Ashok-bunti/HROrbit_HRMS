import {
    Box,
    Grid,
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { useGetAllAttendanceQuery, useClockInMutation, useClockOutMutation, useUpdateAttendanceMutation } from '../../attendance/store/attendanceApi';
import DashboardHeader from '../components/DashboardHeader';
import CheckInWidget from '../components/CheckInWidget';
import NewHiresWidget from '../components/NewHiresWidget';
import AchievementWidget from '../components/AchievementWidget';
import AnnouncementWidget from '../components/AnnouncementWidget';
import TimeLogWidget from '../components/TimeLogWidget';
import SocialsWidget from '../components/SocialsWidget';
import EventsWidget from '../components/EventsWidget';

import { useGetLeaveStatsQuery, useGetAllLeavesQuery } from '../../leaves/store/leaveApi';
import { useGetUpcomingHolidayQuery } from '../../holidays/store/holidayApi';
import { useGetPolicyStatsQuery } from '../../policies/store/policyApi';
import { format, isAfter, isSameDay, parseISO } from 'date-fns';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    console.log("user", user);

    const today = new Date().toISOString().split('T')[0];
    const todayDateObj = new Date(today); // For date comparisons

    // Fetch all attendance to ensure we get records with null employee_id
    const { data: attendanceData } = useGetAllAttendanceQuery({});

    const { data: leaveStats } = useGetLeaveStatsQuery();
    const { data: allLeavesData } = useGetAllLeavesQuery({});
    const { data: holidayData } = useGetUpcomingHolidayQuery();
    const { data: policyData } = useGetPolicyStatsQuery();
    console.log("holidayData", holidayData);
    console.log("allLeavesData", allLeavesData);
    console.log("policyData", policyData);
    console.log("leaveStats", leaveStats);
    // Logic to find upcoming approved leave
    const upcomingLeave = allLeavesData?.leaves
        ?.filter(leave =>
            leave.status === 'Approved' &&
            (isAfter(parseISO(leave.start_date), todayDateObj) || isSameDay(parseISO(leave.start_date), todayDateObj))
        )
        .sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime())
        .at(0); // Get the first upcoming leave

    // REVISING LOGIC based on "name and date i need to show"
    // If Approved Leave:
    // Show "Casual Leave" (Name) and "12 Oct" (Date).
    // DashboardHeader renders: Caption (name), then Date (date) + Span (day).
    // So:
    // name = "Upcoming Leave"
    // date = "12 Oct"
    // day = "Casual"

    const holidaysMapped = upcomingLeave ? {
        name: 'Upcoming Leave',
        date: format(parseISO(upcomingLeave.start_date), 'dd MMM'),
        day: upcomingLeave.leave_type
    } : {
        name: holidayData?.name || 'Upcoming holiday',
        date: holidayData?.date ? format(new Date(holidayData.date), 'dd MMM') : '--',
        day: holidayData?.date ? format(new Date(holidayData.date), 'EEE') : ''
    };

    // Format policy data if available
    const policies = {
        count: policyData?.total_duration ? `${policyData.total_duration} min` : '0 min',
        action: 'Read',
        name: 'Policies'
    };

    const [clockIn, { isLoading: isClockingIn }] = useClockInMutation();
    const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();
    const [updateAttendance] = useUpdateAttendanceMutation();
    console.log("attendanceData", attendanceData);

    const todayAttendance = attendanceData?.attendance?.find(
        record => !record.check_out_time && (
            record.employee_id === user?.employee?.id ||
            record.employee_id === user?.id ||
            record.employee_id === null
        )
    );

    const handleClockIn = async () => {
        try {
            await clockIn(user?.id).unwrap();
        } catch (err) {
            alert(err.data?.error || 'Failed to clock in');
        }
    };

    const handleClockOut = async () => {
        try {
            if (todayAttendance) {
                // Smart checkout: claim the record and close it
                await updateAttendance({
                    id: todayAttendance.id,
                    employee_id: user?.employee?.id || user?.id,
                    check_out_time: new Date().toISOString(),
                    status: 'Present'
                }).unwrap();
            } else {
                await clockOut(user?.id).unwrap();
            }
        } catch (err) {
            alert(err.data?.error || 'Failed to clock out');
        }
    };

    return (
        <Box sx={{ p: 2, mt: -3 }}>
            <DashboardHeader
                user={user}
                leaveStats={leaveStats}
                holidays={holidaysMapped}
                policies={policies}
                todayAttendance={todayAttendance}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
                isClockingIn={isClockingIn}
                isClockingOut={isClockingOut}
            />

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '9fr 3fr' },
                gap: 3,
                mt: 2
            }}>
                {/* Left Content */}
                <Box>
                    {/* First Row */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 5fr 5fr' },
                        gap: 3,
                        mb: 3
                    }}>
                        <NewHiresWidget />
                        <AchievementWidget />
                        <AnnouncementWidget />
                    </Box>

                    {/* Second Row */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '4fr 3fr',
                            },
                            gap: 3,
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <SocialsWidget />
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <EventsWidget />
                        </Box>
                    </Box>

                </Box>

                {/* Right Sidebar */}
                <TimeLogWidget />
            </Box>
        </Box>
    );
};

export default EmployeeDashboard;