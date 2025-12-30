import { apiSlice } from '../../../store/api/apiSlice';

export const payrollApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        runPayroll: builder.mutation({
            query: (data) => ({
                url: '/payroll/run',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Payroll'],
        }),
        getPayrollRuns: builder.query({
            query: () => '/payroll/runs',
            providesTags: ['Payroll'],
        }),
        getEmployeePayslips: builder.query({
            query: (employeeId) => `/payroll/employee/${employeeId}`,
            providesTags: ['Payslip'],
        }),
        getPayslipById: builder.query({
            query: (id) => `/payroll/payslip/${id}`,
            providesTags: ['Payslip'],
        }),
        updateSalaryStructure: builder.mutation({
            query: (data) => ({
                url: '/payroll/structure',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Payroll'],
        }),
        getStatutoryRules: builder.query({
            query: () => '/payroll/statutory',
            providesTags: ['Statutory'],
        }),
        updateStatutoryRule: builder.mutation({
            query: (data) => ({
                url: '/payroll/statutory',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Statutory'],
        }),
    }),
});

export const {
    useRunPayrollMutation,
    useGetPayrollRunsQuery,
    useGetEmployeePayslipsQuery,
    useGetPayslipByIdQuery,
    useUpdateSalaryStructureMutation,
    useGetStatutoryRulesQuery,
    useUpdateStatutoryRuleMutation,
} = payrollApi;
