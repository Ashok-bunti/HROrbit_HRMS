import api from '../../../services/api';

/**
 * Get organization chart data
 */
export const getOrganizationChart = async () => {
    const response = await api.get('/organization/chart');
    return response.data;
};

/**
 * Get employee hierarchy (subordinates)
 */
export const getEmployeeHierarchy = async (employeeId) => {
    const response = await api.get(`/organization/hierarchy/${employeeId}`);
    return response.data;
};

/**
 * Update employee reporting manager
 */
export const updateReportingManager = async (employeeId, reportingManagerId) => {
    const response = await api.put(`/organization/reporting-manager/${employeeId}`, {
        reporting_manager_id: reportingManagerId
    });
    return response.data;
};

/**
 * Get organization statistics
 */
export const getOrganizationStats = async () => {
    const response = await api.get('/organization/stats');
    return response.data;
};
