import { apiSlice } from '../../../store/api/apiSlice';

export const departmentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDepartments: builder.query({
            query: (params) => ({
                url: '/departments',
                params,
            }),
            providesTags: ['Department'],
        }),
        getDepartmentById: builder.query({
            query: (id) => `/departments/${id}`,
            providesTags: (result, error, id) => [{ type: 'Department', id }],
        }),
        createDepartment: builder.mutation({
            query: (departmentData) => ({
                url: '/departments',
                method: 'POST',
                body: departmentData,
            }),
            invalidatesTags: ['Department'],
        }),
        updateDepartment: builder.mutation({
            query: ({ id, ...departmentData }) => ({
                url: `/departments/${id}`,
                method: 'PUT',
                body: departmentData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Department', id }, 'Department'],
        }),
        deleteDepartment: builder.mutation({
            query: (id) => ({
                url: `/departments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Department'],
        }),
    }),
});

export const {
    useGetDepartmentsQuery,
    useGetDepartmentByIdQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation,
} = departmentApi;
