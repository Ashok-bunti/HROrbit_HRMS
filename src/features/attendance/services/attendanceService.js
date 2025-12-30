import api from '../../../services/api';

export const attendanceService = {
    getAll: async (params = {}) => {
        const response = await api.get('/attendance', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/attendance/${id}`);
        return response.data;
    },

    clockIn: async (employeeId) => {
        const response = await api.post('/attendance/clock-in', { employee_id: employeeId });
        return response.data;
    },

    clockOut: async (employeeId) => {
        const response = await api.post('/attendance/clock-out', { employee_id: employeeId });
        return response.data;
    },

    mark: async (attendanceData) => {
        const response = await api.post('/attendance/mark', attendanceData);
        return response.data;
    },

    update: async (id, attendanceData) => {
        const response = await api.put(`/attendance/${id}`, attendanceData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/attendance/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/attendance/stats');
        return response.data;
    },
};

export default attendanceService;
