import { apiSlice } from '../../../store/api/apiSlice';

export const employeeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getEmployees: builder.query({
            query: (params) => ({
                url: '/employees',
                params,
            }),
            providesTags: ['Employee'],
        }),
        getEmployeeById: builder.query({
            query: (id) => `/employees/${id}`,
            providesTags: (result, error, id) => [{ type: 'Employee', id }],
        }),
        createEmployee: builder.mutation({
            query: (employeeData) => {
                console.log("RTK Query: createEmployee payload:", employeeData);
                return {
                    url: '/employees',
                    method: 'POST',
                    body: employeeData,
                };
            },
            invalidatesTags: ['Employee'],
        }),
        updateEmployee: builder.mutation({
            query: ({ id, ...employeeData }) => ({
                url: `/employees/${id}`,
                method: 'PUT',
                body: { id, ...employeeData },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Employee', id }, 'Employee'],
        }),
        deleteEmployee: builder.mutation({
            query: ({ id, permanent = false }) => ({
                url: `/employees/${id}`,
                method: 'DELETE',
                params: { permanent },
            }),
            invalidatesTags: ['Employee'],
        }),
        getEmployeeByUserId: builder.query({
            query: (userId) => `/employees/user/${userId}`,
            providesTags: (result, error, userId) => [{ type: 'Employee', id: `USER_${userId}` }],
        }),
        updateOwnProfile: builder.mutation({
            query: ({ userId, ...profileData }) => ({
                url: `/employees/user/${userId}/profile`,
                method: 'PUT',
                body: profileData,
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: 'Employee', id: `USER_${userId}` },
                'Employee'
            ],
        }),
        getEmployeeStats: builder.query({
            query: () => '/employees/stats',
            providesTags: ['Employee'],
        }),
        // Document Management
        getEmployeeDocuments: builder.query({
            query: (userId) => `/employees/${userId}/documents`,
            providesTags: (result, error, userId) => [{ type: 'Employee', id: `DOCS_${userId}` }],
        }),
        uploadDocument: builder.mutation({
            query: ({ userId, documentType, formData }) => ({
                url: `/employees/${userId}/documents/${documentType}`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: 'Employee', id: `DOCS_${userId}` },
                'Employee'
            ],
        }),
        deleteDocument: builder.mutation({
            query: ({ userId, documentType }) => ({
                url: `/employees/${userId}/documents/${documentType}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: 'Employee', id: `DOCS_${userId}` },
                'Employee'
            ],
        }),
    }),
});

export const {
    useGetEmployeesQuery,
    useGetEmployeeByIdQuery,
    useGetEmployeeByUserIdQuery,
    useCreateEmployeeMutation,
    useUpdateEmployeeMutation,
    useUpdateOwnProfileMutation,
    useDeleteEmployeeMutation,
    useGetEmployeeStatsQuery,
    useGetEmployeeDocumentsQuery,
    useUploadDocumentMutation,
    useDeleteDocumentMutation,
} = employeeApi;
