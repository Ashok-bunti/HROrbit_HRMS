import { apiSlice } from '../../../store/api/apiSlice';

export const calendarApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getHolidays: builder.query({
            query: (params) => ({
                url: '/calendar',
                method: 'GET',
                params,
            }),
            providesTags: ['Holiday'],
        }),
        getHolidayById: builder.query({
            query: (id) => `/calendar/${id}`,
            providesTags: (result, error, id) => [{ type: 'Holiday', id }],
        }),
        createHoliday: builder.mutation({
            query: (data) => ({
                url: '/calendar',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Holiday'],
        }),
        updateHoliday: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/calendar/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Holiday', id }, 'Holiday'],
        }),
        deleteHoliday: builder.mutation({
            query: (id) => ({
                url: `/calendar/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Holiday'],
        }),
    }),
});

export const {
    useGetHolidaysQuery,
    useGetHolidayByIdQuery,
    useCreateHolidayMutation,
    useUpdateHolidayMutation,
    useDeleteHolidayMutation,
} = calendarApi;
