import { apiSlice } from '../../../store/api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: (params) => ({
                url: '/users',
                params,
            }),
            providesTags: ['User'],
        }),
        getUserById: builder.query({
            query: (id) => `/users/${id}`,
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),
        createUser: builder.mutation({
            query: (userData) => ({
                url: '/users',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),
        updateUser: builder.mutation({
            query: ({ id, ...userData }) => ({
                url: `/users/${id}`,
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
        updateUserRole: builder.mutation({
            query: ({ id, role }) => ({
                url: `/users/${id}/role`,
                method: 'PUT',
                body: { role },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
        }),
        toggleUserStatus: builder.mutation({
            query: ({ id, is_active }) => ({
                url: `/users/${id}/status`,
                method: 'PUT',
                body: { is_active },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useUpdateUserRoleMutation,
    useToggleUserStatusMutation,
} = userApi;
