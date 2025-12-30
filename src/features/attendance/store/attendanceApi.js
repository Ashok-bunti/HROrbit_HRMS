import { apiSlice } from '../../../store/api/apiSlice';

export const attendanceApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllAttendance: builder.query({
            query: (params) => ({
                url: '/attendance',
                params,
            }),
            providesTags: ['Attendance'],
        }),
        getAttendanceById: builder.query({
            query: (id) => `/attendance/${id}`,
            providesTags: (result, error, id) => [{ type: 'Attendance', id }],
        }),
        clockIn: builder.mutation({
            query: (employeeId) => ({
                url: '/attendance/clock-in',
                method: 'POST',
                body: { employee_id: employeeId },
            }),
            invalidatesTags: ['Attendance'],
        }),
        clockOut: builder.mutation({
            query: (employeeId) => ({
                url: '/attendance/clock-out',
                method: 'POST',
                body: { employee_id: employeeId },
            }),
            invalidatesTags: ['Attendance'],
        }),
        markAttendance: builder.mutation({
            query: (attendanceData) => ({
                url: '/attendance/mark',
                method: 'POST',
                body: attendanceData,
            }),
            invalidatesTags: ['Attendance'],
        }),
        updateAttendance: builder.mutation({
            query: ({ id, ...attendanceData }) => ({
                url: `/attendance/${id}`,
                method: 'PUT',
                body: attendanceData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Attendance', id }, 'Attendance'],
        }),
        deleteAttendance: builder.mutation({
            query: (id) => ({
                url: `/attendance/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Attendance'],
        }),
        getAttendanceStats: builder.query({
            query: () => '/attendance/stats',
            providesTags: ['Attendance'],
        }),
    }),
});

export const {
    useGetAllAttendanceQuery,
    useGetAttendanceByIdQuery,
    useClockInMutation,
    useClockOutMutation,
    useMarkAttendanceMutation,
    useUpdateAttendanceMutation,
    useDeleteAttendanceMutation,
    useGetAttendanceStatsQuery,
} = attendanceApi;
