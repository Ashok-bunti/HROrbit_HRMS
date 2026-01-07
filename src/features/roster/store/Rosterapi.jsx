import api from '../../../services/api';

const rosterService = {
    // Core CRUD
    getAllRosters: async (params) => {
        const response = await api.get('/roster', { params });
        return response.data;
    },
    getRosterById: async (id) => {
        const response = await api.get(`/roster/${id}`);
        return response.data;
    },
    getRosterByEmployeeId: async (employeeId, params) => {
        const response = await api.get(`/roster/employee/${employeeId}`, { params });
        return response.data;
    },
    createRoster: async (data) => {
        const response = await api.post('/roster', data);
        return response.data;
    },
    updateRoster: async (id, data) => {
        const response = await api.put(`/roster/${id}`, data);
        return response.data;
    },
    deleteRoster: async (id) => {
        const response = await api.delete(`/roster/${id}`);
        return response.data;
    },

    // Shift Management
    addShift: async (data) => {
        const response = await api.post('/roster/shift', data);
        return response.data;
    },
    repeatShift: async (data) => {
        const response = await api.post('/roster/repeat-shift', data);
        return response.data;
    },
    updateSchedule: async (scheduleId, data) => {
        const response = await api.put(`/roster/schedule/${scheduleId}`, data);
        return response.data;
    },
    deleteSchedule: async (scheduleId) => {
        const response = await api.delete(`/roster/schedule/${scheduleId}`);
        return response.data;
    },

    // Excel Upload
    uploadExcel: async (file, duration, startDate) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('duration', duration);
        if (startDate) formData.append('start_date', startDate);

        const response = await api.post('/roster/upload-excel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Bulk Operations
    bulkCreate: async (data) => {
        const response = await api.post('/roster/bulk', data);
        return response.data;
    },
    bulkUpdate: async (data) => {
        const response = await api.put('/roster/bulk', data);
        return response.data;
    },
    bulkDelete: async (ids) => {
        const response = await api.delete('/roster/bulk', { data: { ids } });
        return response.data;
    },
};

export default rosterService;
