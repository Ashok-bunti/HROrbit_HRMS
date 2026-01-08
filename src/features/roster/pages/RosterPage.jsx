import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import { Add as AddIcon, CloudUpload as CloudUploadIcon, WbSunny as MorningIcon, WbTwilight as EveningIcon, NightsStay as NightIcon, Block as OffIcon } from '@mui/icons-material';
import RosterTableView from '../components/RosterTableView';
import RosterCalendar from '../components/RosterCalendar';
import ExcelUploadModal from '../components/ExcelUploadModal';
import AddRosterModal from '../components/AddRosterModal';
import RepeatShiftModal from '../components/RepeatShiftModal';
import { Autocomplete, TextField } from '@mui/material';
import { useGetEmployeesQuery } from '../../employees/store/employeeApi';

import PageHeader from '../../../components/common/PageHeader';

const RosterPage = () => {
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const theme = useTheme();
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openRepeatModal, setOpenRepeatModal] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [initialAddData, setInitialAddData] = useState(null);
    const ALL_EMPLOYEES_OPTION = { id: 'all', first_name: 'All', last_name: 'Employees', employee_code: 'ALL' };
    const { data: employeesData } = useGetEmployeesQuery();
    const employees = employeesData?.employees ? [ALL_EMPLOYEES_OPTION, ...employeesData.employees] : [ALL_EMPLOYEES_OPTION];

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const role = user.role || 'employee';
            setUserRole(role);

            // Set default view
            if (employees.length > 0 && !selectedEmployee) {
                if (role === 'admin' || role === 'manager' || role === 'hr') {
                    setSelectedEmployee(ALL_EMPLOYEES_OPTION);
                } else {
                    const self = employees.find(e => e.id === (user.employee?.id || user.employee_id));
                    if (self) setSelectedEmployee(self);
                }
            }
        }
    }, [employees]);

    const [searchTerm, setSearchTerm] = useState('');

    const isHrOrAdmin = userRole === 'admin' || userRole === 'manager' || userRole === 'hr';

    const shiftLegend = (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            overflowX: 'auto',
            maxWidth: '100%',
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 }
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 'max-content' }}>
                {[
                    { label: 'Morning', icon: MorningIcon, bg: alpha(theme.palette.primary.main, 0.08), border: alpha(theme.palette.primary.main, 0.3), color: theme.palette.primary.main },
                    { label: 'Afternoon', icon: EveningIcon, bg: alpha(theme.palette.primary.main, 0.18), border: alpha(theme.palette.primary.main, 0.5), color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark },
                    { label: 'Night', icon: NightIcon, bg: alpha(theme.palette.primary.main, 0.28), border: theme.palette.primary.main, color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark },
                    { label: 'Week Off', icon: OffIcon, bg: alpha(theme.palette.text.disabled, 0.06), border: alpha(theme.palette.text.disabled, 0.2), color: theme.palette.text.secondary },
                ].map((item, index, array) => (
                    <React.Fragment key={item.label}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8 }}>
                            <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                bgcolor: item.bg,
                                border: `1px solid ${item.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: item.color
                            }}>
                                <item.icon sx={{ fontSize: '1.2rem' }} />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'capitalize', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                {item.label}
                            </Typography>
                        </Box>
                        {index < array.length - 1 && (
                            <Divider orientation="vertical" flexItem sx={{ height: '20px', alignSelf: 'center' }} />
                        )}
                    </React.Fragment>
                ))}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title={isHrOrAdmin ? "Roster Management" : "My Roster"}
                subtitle={isHrOrAdmin ? "Manage employee shifts, work schedules and roster planning." : "View your upcoming shifts and work schedule."}
                action={
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                        {isHrOrAdmin && (
                            <>
                                <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => setOpenUploadModal(true)} sx={{ borderRadius: 2, px: 2, whiteSpace: 'nowrap' }}>Upload Excel</Button>
                                <Button variant="outlined" onClick={() => setOpenRepeatModal(true)} sx={{ borderRadius: 2, px: 2, whiteSpace: 'nowrap' }}>Repeat Shift</Button>
                                <Button variant="contained" startIcon={<AddIcon />} color="primary" onClick={() => setOpenAddModal(true)} sx={{ borderRadius: 2, px: 2, whiteSpace: 'nowrap' }}>Add Roster</Button>
                            </>
                        )}
                        {!isHrOrAdmin && shiftLegend}
                    </Box>
                }
            />

            <Box sx={{ p: { xs: 0, sm: 1, md: 0, lg: 0 } }}>
                {userRole === 'employee' ? (
                    <RosterCalendar
                        key={`cal-${refreshKey}`}
                        employee={selectedEmployee}
                        searchTerm={searchTerm}
                        canManage={false}
                    />
                ) : (
                    <RosterTableView
                        key={`table-${refreshKey}`}
                        employee={selectedEmployee}
                        allEmployees={employees}
                        searchTerm={searchTerm}
                        onEmployeeChange={setSelectedEmployee}
                        onSearchChange={setSearchTerm}
                        onAddRoster={(date, empId) => {
                            if (date && empId) {
                                setInitialAddData({ date, employee_id: empId });
                            } else {
                                setInitialAddData(null);
                            }
                            setOpenAddModal(true);
                        }}
                        onUpload={() => setOpenUploadModal(true)}
                        onRepeat={() => setOpenRepeatModal(true)}
                        canManage={userRole === 'admin' || userRole === 'manager' || userRole === 'hr'}
                    />
                )}
            </Box>

            <ExcelUploadModal
                open={openUploadModal}
                onClose={() => setOpenUploadModal(false)}
                onSuccess={handleRefresh}
            />

            <AddRosterModal
                open={openAddModal}
                onClose={() => {
                    setOpenAddModal(false);
                    setInitialAddData(null);
                }}
                onSuccess={handleRefresh}
                initialData={initialAddData}
            />

            <RepeatShiftModal
                open={openRepeatModal}
                onClose={() => setOpenRepeatModal(false)}
                onSuccess={handleRefresh}
            />
        </Box>
    );
};

export default RosterPage;
