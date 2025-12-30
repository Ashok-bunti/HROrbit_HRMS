import { apiSlice } from '../../../store/api/apiSlice';

export const mfaApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        setupMFA: builder.mutation({
            query: () => ({
                url: '/mfa/setup',
                method: 'POST',
            }),
        }),
        verifyAndEnableMFA: builder.mutation({
            query: (token) => ({
                url: '/mfa/verify',
                method: 'POST',
                body: { token },
            }),
            invalidatesTags: ['Auth'],
        }),
        disableMFA: builder.mutation({
            query: (password) => ({
                url: '/mfa/disable',
                method: 'POST',
                body: { password },
            }),
            invalidatesTags: ['Auth'],
        }),
        verifyMFALogin: builder.mutation({
            query: ({ userId, token, isBackupCode }) => ({
                url: '/mfa/verify-login',
                method: 'POST',
                body: { userId, token, isBackupCode },
            }),
        }),
        regenerateBackupCodes: builder.mutation({
            query: (password) => ({
                url: '/mfa/backup-codes',
                method: 'POST',
                body: { password },
            }),
        }),
    }),
});

export const {
    useSetupMFAMutation,
    useVerifyAndEnableMFAMutation,
    useDisableMFAMutation,
    useVerifyMFALoginMutation,
    useRegenerateBackupCodesMutation,
} = mfaApi;
