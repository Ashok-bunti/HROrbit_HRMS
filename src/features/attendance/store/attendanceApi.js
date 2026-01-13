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
            query: (data) => ({
                url: '/attendance/clock-in',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Attendance'],
        }),
        clockOut: builder.mutation({
            query: (data) => ({
                url: '/attendance/clock-out',
                method: 'POST',
                body: data,
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
        getOfficeLocations: builder.query({
            query: () => '/office-location',
            providesTags: ['OfficeLocation'],
        }),
        getActiveOfficeLocation: builder.query({
            query: () => '/office-location/active',
            providesTags: ['OfficeLocation'],
        }),
        createOfficeLocation: builder.mutation({
            query: (data) => ({
                url: '/office-location',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['OfficeLocation'],
        }),
        updateOfficeLocation: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/office-location/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['OfficeLocation'],
        }),
        deleteOfficeLocation: builder.mutation({
            query: (id) => ({
                url: `/office-location/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['OfficeLocation'],
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
    useGetOfficeLocationsQuery,
    useGetActiveOfficeLocationQuery,
    useCreateOfficeLocationMutation,
    useUpdateOfficeLocationMutation,
    useDeleteOfficeLocationMutation,
} = attendanceApi;
