import { apiSlice } from '../../../store/api/apiSlice';

export const engagementApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createSurvey: builder.mutation({
            query: (data) => ({
                url: '/engagement/surveys',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Engagement'],
        }),
        getActiveSurveys: builder.query({
            query: () => '/engagement/surveys/active',
            providesTags: ['Engagement'],
        }),
        submitSurveyResponse: builder.mutation({
            query: (data) => ({
                url: '/engagement/surveys/respond',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Engagement'],
        }),
        submitFeedback: builder.mutation({
            query: (data) => ({
                url: '/engagement/feedback',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Engagement'],
        }),
        getEngagementStats: builder.query({
            query: () => '/engagement/stats',
            providesTags: ['Engagement'],
        }),
        getAllFeedback: builder.query({
            query: () => '/engagement/feedback/all',
            providesTags: ['Engagement'],
        }),
    }),
});

export const {
    useCreateSurveyMutation,
    useGetActiveSurveysQuery,
    useSubmitSurveyResponseMutation,
    useSubmitFeedbackMutation,
    useGetEngagementStatsQuery,
    useGetAllFeedbackQuery,
} = engagementApi;
