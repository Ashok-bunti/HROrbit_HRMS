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
        createLeave: builder.mutation({
            query: (leaveData) => ({
                url: '/leaves',
                method: 'POST',
                body: leaveData,
            }),
            invalidatesTags: ['Leave'],
        }),
        updateLeave: builder.mutation({
            query: ({ id, ...leaveData }) => ({
                url: `/leaves/${id}`,
                method: 'PUT',
                body: leaveData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Leave', id }, 'Leave'],
        }),
        approveLeave: builder.mutation({
            query: (id) => ({
                url: `/leaves/${id}/approve`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Leave', id }, 'Leave'],
        }),
        rejectLeave: builder.mutation({
            query: ({ id, reason }) => ({
                url: `/leaves/${id}/reject`,
                method: 'PUT',
                body: { rejection_reason: reason },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Leave', id }, 'Leave'],
        }),
        deleteLeave: builder.mutation({
            query: (id) => ({
                url: `/leaves/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Leave'],
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
    useCreateLeaveMutation,
    useUpdateLeaveMutation,
    useApproveLeaveMutation,
    useRejectLeaveMutation,
    useDeleteLeaveMutation,
    useGetLeaveStatsQuery,
} = leaveApi;
