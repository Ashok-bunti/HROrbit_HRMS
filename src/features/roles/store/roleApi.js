import { apiSlice } from '../../../store/api/apiSlice';

export const roleApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRoles: builder.query({
            query: () => '/roles',
            providesTags: (result) =>
                result && result.data
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'Role', id })),
                        { type: 'Role', id: 'LIST' },
                    ]
                    : [{ type: 'Role', id: 'LIST' }],
        }),
        getRole: builder.query({
            query: (id) => `/roles/${id}`,
            providesTags: (result, error, id) => [{ type: 'Role', id }],
        }),
        createRole: builder.mutation({
            query: (roleData) => ({
                url: '/roles',
                method: 'POST',
                body: roleData,
            }),
            invalidatesTags: [{ type: 'Role', id: 'LIST' }],
        }),
        updateRole: builder.mutation({
            query: ({ id, ...roleData }) => ({
                url: `/roles/${id}`,
                method: 'PUT',
                body: roleData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Role', id },
                { type: 'Role', id: 'LIST' },
            ],
        }),
        deleteRole: builder.mutation({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Role', id: 'LIST' }],
        }),
        getPermissionsMatrix: builder.query({
            query: () => '/roles/permissions-matrix',
            providesTags: ['Role'],
        }),
        updateRolePermissions: builder.mutation({
            query: ({ id, permissions }) => ({
                url: `/roles/${id}/permissions`,
                method: 'PUT',
                body: { permissions },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Role', id },
                { type: 'Role', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetRolesQuery,
    useGetRoleQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useGetPermissionsMatrixQuery,
    useUpdateRolePermissionsMutation,
} = roleApi;
