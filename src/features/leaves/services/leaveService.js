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

    getPending: async () => {
        const response = await api.get('/leaves/pending');
        return response.data;
    },

    getMyBalances: async (year) => {
        const response = await api.get('/leaves/my-balances', { params: { year } });
        return response.data;
    },

    getAvailableTypes: async () => {
        const response = await api.get('/leaves/available-types');
        return response.data;
    },

    getMyManager: async () => {
        const response = await api.get('/leaves/my-manager');
        return response.data;
    },

    getHREmails: async () => {
        const response = await api.get('/leaves/hr-manager-emails');
        return response.data;
    },

    getApprovers: async () => {
        const response = await api.get('/leaves/approvers');
        return response.data;
    },

    getMyLeaves: async (params = {}) => {
        const response = await api.get('/leaves/my-leaves', { params });
        return response.data;
    },

    getMyRemaining: async (year) => {
        const response = await api.get('/leaves/my-remaining', { params: { year } });
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
