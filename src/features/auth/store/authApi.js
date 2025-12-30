import { apiSlice } from '../../../store/api/apiSlice';

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
        }),
        getProfile: builder.query({
            query: () => '/auth/profile',
            providesTags: ['Auth'],
        }),
        updatePassword: builder.mutation({
            query: (passwords) => ({
                url: '/auth/password',
                method: 'PUT',
                body: passwords,
            }),
        }),
        forceChangePassword: builder.mutation({
            query: ({ token, ...data }) => ({
                url: '/auth/force-change-password',
                method: 'POST',
                body: data,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetProfileQuery,
    useUpdatePasswordMutation,
    useForceChangePasswordMutation,
} = authApi;
