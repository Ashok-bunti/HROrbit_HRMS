import api from '../../../services/api';

export const employeeService = {
    getAll: async (params = {}) => {
        const response = await api.get('/employees', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/employees/${id}`);
        return response.data;
    },

    create: async (employeeData) => {
        console.log("employeeService.create payload:", employeeData);
        const response = await api.post('/employees', employeeData);
        return response.data;
    },

    update: async (id, employeeData) => {
        const response = await api.put(`/employees/${id}`, employeeData);
        return response.data;
    },

    delete: async (id, permanent = false) => {
        const response = await api.delete(`/employees/${id}`, { params: { permanent } });
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/employees/stats');
        return response.data;
    },
};

export default employeeService;
