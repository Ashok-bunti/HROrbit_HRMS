import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// VITE_API_URL already includes /api (e.g., http://localhost:5000/api)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const payrollApi = createApi({
    reducerPath: 'payrollApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/payroll`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['PayrollRuns', 'Payslips', 'StatutoryRules', 'SalaryStructure', 'PayrollProfile', 'TaxSummary'],
    endpoints: (builder) => ({
        // 1. Run Payroll (Create DRAFT)
        runPayroll: builder.mutation({
            query: (data) => ({
                url: '/run',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PayrollRuns'],
        }),

        // 2. Submit Payroll for Approval
        submitPayroll: builder.mutation({
            query: (runId) => ({
                url: `/submit/${runId}`,
                method: 'POST',
            }),
            invalidatesTags: ['PayrollRuns'],
        }),

        // 3. Approve Payroll
        approvePayroll: builder.mutation({
            query: ({ runId, ...data }) => ({
                url: `/approve/${runId}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PayrollRuns'],
        }),

        // 4. Reject Payroll
        rejectPayroll: builder.mutation({
            query: ({ runId, ...data }) => ({
                url: `/reject/${runId}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PayrollRuns'],
        }),

        // 5. Lock Payroll
        lockPayroll: builder.mutation({
            query: (runId) => ({
                url: `/lock/${runId}`,
                method: 'POST',
            }),
            invalidatesTags: ['PayrollRuns'],
        }),

        // 6. Unlock Payroll (Admin only)
        unlockPayroll: builder.mutation({
            query: ({ runId, ...data }) => ({
                url: `/unlock/${runId}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PayrollRuns'],
        }),

        // 7. Get Payroll Runs (History)
        getPayrollRuns: builder.query({
            query: (params) => ({
                url: '/runs',
                params,
            }),
            providesTags: ['PayrollRuns'],
        }),

        // 8. Get Payroll Preview
        getPayrollPreview: builder.query({
            query: (runId) => `/preview/${runId}`,
            providesTags: (result, error, runId) => [{ type: 'PayrollRuns', id: runId }],
        }),

        // 9. Get Employee Payslips
        getEmployeePayslips: builder.query({
            query: (employeeId) => `/employee/${employeeId}`,
            providesTags: (result, error, employeeId) => [{ type: 'Payslips', id: employeeId }],
        }),

        // 10. Get Payslip by ID
        getPayslipById: builder.query({
            query: (id) => `/payslip/${id}`,
            providesTags: (result, error, id) => [{ type: 'Payslips', id }],
        }),

        // 11. Update Salary Structure
        updateSalaryStructure: builder.mutation({
            query: (data) => ({
                url: '/structure',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['SalaryStructure'],
        }),

        // 12. Get Statutory Rules
        getStatutoryRules: builder.query({
            query: (params) => ({
                url: '/statutory',
                params,
            }),
            providesTags: ['StatutoryRules'],
        }),

        // 13. Update Statutory Rule
        updateStatutoryRule: builder.mutation({
            query: (data) => ({
                url: '/statutory',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['StatutoryRules'],
        }),

        // 14. Create/Update Employee Payroll Profile
        updateEmployeePayrollProfile: builder.mutation({
            query: (data) => ({
                url: '/profile',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PayrollProfile'],
        }),

        // 15. Get Employee Payroll Profile
        getEmployeePayrollProfile: builder.query({
            query: (employeeId) => `/profile/${employeeId}`,
            providesTags: (result, error, employeeId) => [{ type: 'PayrollProfile', id: employeeId }],
        }),

        // 16. Get Tax Summary (Form 16)
        getTaxSummary: builder.query({
            query: ({ employeeId, year }) => `/tax-summary/${employeeId}${year ? `/${year}` : ''}`,
            providesTags: (result, error, { employeeId, year }) => [
                { type: 'TaxSummary', id: `${employeeId}-${year}` },
            ],
        }),
    }),
});

export const {
    useRunPayrollMutation,
    useSubmitPayrollMutation,
    useApprovePayrollMutation,
    useRejectPayrollMutation,
    useLockPayrollMutation,
    useUnlockPayrollMutation,
    useGetPayrollRunsQuery,
    useGetPayrollPreviewQuery,
    useGetEmployeePayslipsQuery,
    useGetPayslipByIdQuery,
    useUpdateSalaryStructureMutation,
    useGetStatutoryRulesQuery,
    useUpdateStatutoryRuleMutation,
    useUpdateEmployeePayrollProfileMutation,
    useGetEmployeePayrollProfileQuery,
    useGetTaxSummaryQuery,
} = payrollApi;
