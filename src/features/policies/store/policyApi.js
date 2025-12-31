import { apiSlice } from '../../../store/api/apiSlice';

export const policyApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPolicies: builder.query({
            query: ({ is_active, category }) => {
                const params = new URLSearchParams();
                if (is_active !== undefined) params.append('is_active', is_active);
                if (category) params.append('category', category);
                return `/leave-policies?${params.toString()}`;
            },
            providesTags: ['Policy']
        }),
        getPolicyStats: builder.query({
            query: () => '/leave-policies/stats',
            providesTags: ['Policy']
        }),
        getPolicy: builder.query({
            query: (id) => `/leave-policies/${id}`,
            providesTags: (result, error, id) => [{ type: 'Policy', id }]
        }),
        createPolicy: builder.mutation({
            query: (policy) => ({
                url: '/leave-policies',
                method: 'POST',
                body: policy
            }),
            invalidatesTags: ['Policy']
        }),
        updatePolicy: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/leave-policies/${id}`,
                method: 'PUT',
                body: patch
            }),
            invalidatesTags: ['Policy']
        }),
        deletePolicy: builder.mutation({
            query: (id) => ({
                url: `/leave-policies/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Policy']
        })
    })
});

export const {
    useGetPoliciesQuery,
    useGetPolicyStatsQuery,
    useGetPolicyQuery,
    useCreatePolicyMutation,
    useUpdatePolicyMutation,
    useDeletePolicyMutation
} = policyApi;
