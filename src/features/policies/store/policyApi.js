import { apiSlice } from '../../../store/api/apiSlice';

export const policyApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPolicies: builder.query({
            queryFn: async () => {
                return { data: [] };
            },
            providesTags: ['Policy'],
        }),
        getPolicyStats: builder.query({
            queryFn: async () => {
                // Mock data until backend endpoint is available
                return { data: { total_duration: 120 } };
            },
            providesTags: ['Policy'],
        }),
    }),
});

export const {
    useGetPoliciesQuery,
    useGetPolicyStatsQuery,
} = policyApi;
