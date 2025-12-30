import api from '../../../services/api';

export const leaveService = {
    getAll: async (params = {}) => {
        const response = await api.get('/leaves', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/leaves/${id}`);
        return response.data;
    },

    create: async (leaveData) => {
        const response = await api.post('/leaves', leaveData);
        return response.data;
    },

    update: async (id, leaveData) => {
        const response = await api.put(`/leaves/${id}`, leaveData);
        return response.data;
    },

    approve: async (id) => {
        const response = await api.put(`/leaves/${id}/approve`);
        return response.data;
    },

    reject: async (id, reason) => {
        const response = await api.put(`/leaves/${id}/reject`, { rejection_reason: reason });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/leaves/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/leaves/stats');
        return response.data;
    },
};

export default leaveService;
