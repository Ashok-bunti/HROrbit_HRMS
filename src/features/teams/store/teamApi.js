import { apiSlice } from '../../../store/api/apiSlice';

export const teamApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTeams: builder.query({
            query: (params) => ({
                url: '/teams',
                params,
            }),
            providesTags: ['Team'],
        }),
        getTeamById: builder.query({
            query: (id) => `/teams/${id}`,
            providesTags: (result, error, id) => [{ type: 'Team', id }],
        }),
        createTeam: builder.mutation({
            query: (teamData) => ({
                url: '/teams',
                method: 'POST',
                body: teamData,
            }),
            invalidatesTags: ['Team'],
        }),
        updateTeam: builder.mutation({
            query: ({ id, ...teamData }) => ({
                url: `/teams/${id}`,
                method: 'PUT',
                body: teamData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Team', id }, 'Team'],
        }),
        deleteTeam: builder.mutation({
            query: (id) => ({
                url: `/teams/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Team'],
        }),
    }),
});

export const {
    useGetTeamsQuery,
    useGetTeamByIdQuery,
    useCreateTeamMutation,
    useUpdateTeamMutation,
    useDeleteTeamMutation,
} = teamApi;
