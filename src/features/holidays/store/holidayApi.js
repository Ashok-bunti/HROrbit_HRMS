import { apiSlice } from '../../../store/api/apiSlice';

export const holidayApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUpcomingHoliday: builder.query({
            queryFn: async () => {
                return { data: null };
            },
            providesTags: ['Holiday'],
        }),
        getHolidays: builder.query({
            queryFn: async () => {
                return { data: [] };
            },
            providesTags: ['Holiday'],
        }),
    }),
});

export const {
    useGetUpcomingHolidayQuery,
    useGetHolidaysQuery,
} = holidayApi;
