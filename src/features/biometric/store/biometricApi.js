import { apiSlice } from '../../../store/api/apiSlice';

export const biometricApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTodayBiometricAttendance: builder.query({
            query: () => '/biometric/attendance/today',
            providesTags: ['Biometric', 'Attendance'],
        }),
        getAllBiometricAttendance: builder.query({
            query: (params) => ({
                url: '/biometric/attendance/all',
                params: params,
            }),
            providesTags: ['Biometric'],
        }),
        getCurrentBiometricSession: builder.query({
            query: (employeeId) => `/biometric/attendance/current/${employeeId}`,
            providesTags: (result, error, id) => [{ type: 'Biometric', id }],
        }),
        getBiometricUserHistory: builder.query({
            query: (params) => ({
                url: `/biometric/attendance/all`,
                params: params,
            }),
            providesTags: ['Biometric'],
        }),
        getBiometricOvertimeStatus: builder.query({
            query: (employeeId) => `/biometric/overtime/status/${employeeId}`,
            providesTags: ['Biometric'],
        }),
        getBiometricSystemStatus: builder.query({
            query: () => '/biometric/system/status',
            providesTags: ['Biometric'],
        }),
        runBiometricCleanup: builder.mutation({
            query: () => ({
                url: '/biometric/system/cleanup',
                method: 'POST',
            }),
            invalidatesTags: ['Biometric', 'Attendance'],
        }),
    }),
});

export const {
    useGetTodayBiometricAttendanceQuery,
    useGetAllBiometricAttendanceQuery,
    useGetCurrentBiometricSessionQuery,
    useGetBiometricUserHistoryQuery,
    useGetBiometricOvertimeStatusQuery,
    useGetBiometricSystemStatusQuery,
    useRunBiometricCleanupMutation,
} = biometricApi;
