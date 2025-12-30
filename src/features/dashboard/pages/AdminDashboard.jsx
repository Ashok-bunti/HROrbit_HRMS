import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,

    Button,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    useTheme,

} from '@mui/material';
import {
    PeopleAlt,
    AttachMoney,
    EventNote,
    TrendingUp,



    NotificationsActive
} from '@mui/icons-material';
import {


    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { useGetEngagementStatsQuery } from '../../engagement/store/engagementApi';
import { useGetDepartmentsQuery } from '../../departments/store/departmentApi';
import { useGetPayrollRunsQuery } from '../../payroll/store/payrollApi';
import { useGetLeaveStatsQuery } from '../../leaves/store/leaveApi';



const StatCard = ({ title, value, icon, iconBgColor }) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                borderRadius: 1,
                overflow: 'hidden',

                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.12)'
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            bgcolor: iconBgColor,
                            borderRadius: 1,
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {React.cloneElement(icon, {
                            sx: { fontSize: 24, color: 'white' }
                        })}
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.text.primary, mb: 0.5 }}>
                            {value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {title}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

const AdminDashboard = () => {
    const theme = useTheme();

    //engagement api call
    const { data: engagementData, isLoading } = useGetEngagementStatsQuery();
    const recentFeedback = engagementData?.recent_feedback || [];

    //departemnt api call
    const { data: departmentResponse, isLoading: isDepartmentLoading, isError: isDepartmentError, } = useGetDepartmentsQuery();
    const departments = departmentResponse?.departments || [];
    const departmentChartData = departments.map((dept, index) => ({
        name: dept.name,
        value: dept.employee_count || 0,
        color: [
            theme.palette.primary.main,
            theme.palette.success.main,
            theme.palette.info.main,
            theme.palette.warning.main,
            theme.palette.error.main,
        ][index % 5],
    }));

    // Payroll API call
    const { data: payrollRunsResponse, isLoading: isPayrollLoading } = useGetPayrollRunsQuery();
    const payrollRuns = payrollRunsResponse?.runs || [];
    const payrollData = payrollRuns
        .slice()
        .reverse() // show oldest → newest
        .map(run => ({
            name: `${run.month.slice(0, 3)} ${run.year}`,
            amount: Number(run.total_payout || 0),
        }));


    // Mock data
    const empStats = { stats: { total_employees: 3 } };

    const usersData = { users: [{ is_active: true }, { is_active: true }, { is_active: true }] };

    const totalUsers = usersData?.users?.length || 0;
    const activeUsers = usersData?.users?.filter(u => u.is_active).length || 0;
    // const pendingLeaves = leaveStats?.stats?.pending || 0;

    //// Leave stats (Pending Leaves)
    const { data: leaveStatsData, isLoading: isLeaveStatsLoading } =
        useGetLeaveStatsQuery();
    const pendingLeaves = leaveStatsData?.stats?.pending ?? 0;


    // Payroll runs (Total Salary)

    const totalSalary = payrollRunsResponse?.runs
        ?.reduce((sum, run) => sum + Number(run.total_payout || 0), 0) || 0;
    const formattedTotalSalary = `₹${(totalSalary / 100000).toFixed(1)}L`;






    return (
        <Box sx={{ pb: 4 }}>
            {/* Header Section */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                        Dashboard Overview
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Welcome back, here's what's happening today.
                    </Typography>
                </Box>

            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap', }}>
                <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px', borderRadius: 2, overflow: 'hidden' }}>
                    <StatCard
                        title="Employees"
                        value={empStats?.stats?.total_employees || 0}
                        icon={<PeopleAlt />}
                        iconBgColor={theme.palette.primary.main}
                    />
                </Box>

                <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px', borderRadius: 2, overflow: 'hidden' }}>
                    <StatCard
                        title="Total Salary"
                        value={isPayrollLoading ? '—' : formattedTotalSalary}
                        icon={<AttachMoney />}
                        iconBgColor={theme.palette.primary.main}
                    />

                </Box>

                <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px', borderRadius: 2, overflow: 'hidden' }}>
                    <StatCard
                        title="Pending Leaves"
                        value={isLeaveStatsLoading ? '—' : pendingLeaves}
                        icon={<EventNote />}
                        iconBgColor={theme.palette.primary.main}
                    />
                </Box>

                <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px', borderRadius: 2, overflow: 'hidden' }}>
                    <StatCard
                        title="Active Projects"
                        value={activeUsers}
                        icon={<TrendingUp />}
                        iconBgColor={theme.palette.primary.main}
                    />
                </Box>
            </Box>


            {/* Charts Section */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <Box sx={{ flexGrow: 3, minWidth: 400 }}>
                    <Card sx={{ borderRadius: 2, height: '100%', boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                                <Typography variant="h6" fontWeight="bold">Payroll History</Typography>
                                <Button
                                    size="small"
                                    sx={{
                                        color: theme.palette.primary.main,
                                        textTransform: 'none'
                                    }}
                                >
                                    View Report →
                                </Button>
                            </Box>
                            <Box sx={{ height: 280, width: '100%' }}>
                                {isPayrollLoading ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Loading payroll data...
                                    </Typography>
                                ) : (
                                    <ResponsiveContainer>
                                        <AreaChart data={payrollData}>
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: theme.palette.text.secondary }}
                                            />
                                            <YAxis
                                                width={70}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: theme.palette.text.secondary }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: 7,
                                                    border: 'none',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    backgroundColor: theme.palette.background.paper,
                                                    color: theme.palette.text.primary
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="amount"
                                                stroke={theme.palette.primary.main}
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorAmount)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flexGrow: 0.5, minWidth: 260 }}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            height: '100%',
                            boxShadow:
                                theme.palette.mode === 'dark'
                                    ? 'none'
                                    : '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                                Department Distribution
                            </Typography>

                            <Box
                                sx={{
                                    height: 240,
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                {isDepartmentLoading ? (
                                    <Typography color="text.secondary">
                                        Loading departments...
                                    </Typography>
                                ) : (
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={departmentChartData}
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {departmentChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: theme.palette.background.paper,
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                    mt: 2,
                                }}
                            >
                                {!isDepartmentLoading &&
                                    departmentChartData.map((entry) => (
                                        <Box
                                            key={entry.name}
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    bgcolor: entry.color,
                                                }}
                                            />
                                            <Typography variant="caption" fontWeight="500">
                                                {entry.name}
                                            </Typography>
                                        </Box>
                                    ))}
                            </Box>
                        </CardContent>
                    </Card>

                </Box>
            </Box>

            {/* Bottom Section */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow:
                                theme.palette.mode === 'dark'
                                    ? 'none'
                                    : '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                Recent Feedbacks
                            </Typography>

                            <List
                                sx={{
                                    maxHeight: 265,
                                    overflowY: 'auto',
                                    pb: 1.5,
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': {
                                        display: 'none',
                                    },
                                }}
                            >
                                {recentFeedback.map((feedback, index) => {
                                    const employeeName = feedback.is_anonymous
                                        ? 'Anonymous'
                                        : `${feedback.employees?.first_name || ''} ${feedback.employees?.last_name || ''}`;

                                    return (
                                        <React.Fragment key={feedback.id}>
                                            <ListItem
                                                alignItems="flex-start"
                                                sx={{
                                                    px: 0.5,
                                                    py: 0.5,
                                                    minHeight: 48,
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: theme.palette.primary.main,
                                                            color: 'white',
                                                            width: 40,
                                                            height: 40,
                                                        }}
                                                    >
                                                        {employeeName.charAt(0)}
                                                    </Avatar>
                                                </ListItemAvatar>

                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {employeeName}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {feedback.category} Feedback
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.disabled"
                                                                sx={{ display: 'block', mt: 0.5 }}
                                                            >
                                                                {feedback.message}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>

                                            {index < recentFeedback.length - 1 && (
                                                <Divider sx={{ my: 1 }} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
                    <Card sx={{
                        borderRadius: 2,
                        height: '100%',
                        boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                        background: 'primary.light',
                        color: 'white'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <NotificationsActive sx={{ mr: 1.5, color: 'primary.main' }} />
                                <Typography variant="h6" fontWeight="bold">System Alerts</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    borderRadius: 2,
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                }}>
                                    <NotificationsActive sx={{ fontSize: 20, color: 'primary.main' }} />
                                    <Typography variant="body2">3 Leave Requests Pending Approval</Typography>
                                </Box>
                                <Box sx={{
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    borderRadius: 2,
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                }}>
                                    <NotificationsActive sx={{ fontSize: 20, color: 'primary.main' }} />
                                    <Typography variant="body2">Payroll for June is due in 5 days</Typography>
                                </Box>
                                <Box sx={{
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    borderRadius: 2,
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                }}>
                                    <NotificationsActive sx={{ fontSize: 20, color: 'primary.main' }} />
                                    <Typography variant="body2">Server Maintenance Scheduled for Sunday</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};

export default AdminDashboard;