import { apiSlice } from '../../../store/api/apiSlice';

export const passwordResetApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        requestPasswordReset: builder.mutation({
            query: (email) => ({
                url: '/password-reset/request',
                method: 'POST',
                body: { email },
            }),
        }),
        verifyResetToken: builder.query({
            query: (token) => `/password-reset/verify/${token}`,
        }),
        resetPassword: builder.mutation({
            query: ({ token, newPassword }) => ({
                url: '/password-reset/reset',
                method: 'POST',
                body: { token, newPassword },
            }),
        }),
    }),
});

export const {
    useRequestPasswordResetMutation,
    useVerifyResetTokenQuery,
    useResetPasswordMutation,
} = passwordResetApi;
