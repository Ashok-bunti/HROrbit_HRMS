import { apiSlice } from '../../../store/api/apiSlice';

export const leaveApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllLeaves: builder.query({
            query: (params) => ({
                url: '/leaves',
                params,
            }),
            providesTags: ['Leave'],
        }),
        getLeaveById: builder.query({
            query: (id) => `/leaves/${id}`,
            providesTags: (result, error, id) => [{ type: 'Leave', id }],
        }),
        getPendingLeaves: builder.query({
            query: (params) => ({
                url: '/leaves/pending',
                params,
            }),
            providesTags: ['Leave'],
        }),
        getMyBalances: builder.query({
            query: (params) => ({
                url: '/leaves/my-balances',
                params: typeof params === 'object' ? params : { year: params }
            }),
            providesTags: ['LeaveBalance'],
        }),
        getAvailableLeaveTypes: builder.query({
            query: (params) => ({
                url: '/leaves/available-types',
                params,
            }),
            providesTags: ['LeaveType'],
        }),
        getMyManager: builder.query({
            query: () => '/leaves/my-manager',
        }),
        getHRManagerEmails: builder.query({
            query: () => '/leaves/hr-manager-emails',
        }),
        getApprovers: builder.query({
            query: () => '/leaves/approvers',
        }),
        getMyLeaves: builder.query({
            query: (params) => ({
                url: '/leaves/my-leaves',
                params,
            }),
            providesTags: ['Leave'],
        }),
        getMyRemainingLeaves: builder.query({
            query: (year) => ({
                url: '/leaves/my-remaining',
                params: { year }
            }),
            providesTags: ['LeaveBalance'],
        }),
        createLeave: builder.mutation({
            query: (leaveData) => ({
                url: '/leaves',
                method: 'POST',
                body: leaveData,
            }),
            invalidatesTags: ['Leave', 'LeaveBalance', 'LeaveType'],
        }),
        updateLeave: builder.mutation({
            query: ({ id, ...leaveData }) => ({
                url: `/leaves/${id}`,
                method: 'PUT',
                body: leaveData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Leave', id }, 'Leave', 'LeaveBalance', 'LeaveType'],
        }),
        approveLeave: builder.mutation({
            query: (id) => ({
                url: `/leaves/${id}/approve`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Leave', id }, 'Leave', 'LeaveBalance'],
        }),
        rejectLeave: builder.mutation({
            query: ({ id, reason }) => ({
                url: `/leaves/${id}/reject`,
                method: 'PUT',
                body: { rejection_reason: reason },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Leave', id }, 'Leave', 'LeaveBalance'],
        }),
        deleteLeave: builder.mutation({
            query: (id) => ({
                url: `/leaves/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Leave', 'LeaveBalance', 'LeaveType'],
        }),
        getLeaveStats: builder.query({
            query: () => '/leaves/stats',
            providesTags: ['Leave'],
        }),
    }),
});

export const {
    useGetAllLeavesQuery,
    useGetLeaveByIdQuery,
    useGetPendingLeavesQuery,
    useGetMyBalancesQuery,
    useGetAvailableLeaveTypesQuery,
    useGetMyManagerQuery,
    useGetHRManagerEmailsQuery,
    useGetApproversQuery,
    useGetMyLeavesQuery,
    useGetMyRemainingLeavesQuery,
    useCreateLeaveMutation,
    useUpdateLeaveMutation,
    useApproveLeaveMutation,
    useRejectLeaveMutation,
    useDeleteLeaveMutation,
    useGetLeaveStatsQuery,
} = leaveApi;
