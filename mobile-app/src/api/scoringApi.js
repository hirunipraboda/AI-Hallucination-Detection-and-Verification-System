import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config/env';

export const scoringApi = createApi({
  reducerPath: 'scoringApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/scoring`,
  }),
  tagTypes: ['Scoring'],
  endpoints: (builder) => ({
    createScore: builder.mutation({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Scoring'],
    }),
    getScoreByResponseId: builder.query({
      query: (responseId) => `/${encodeURIComponent(responseId)}`,
      providesTags: (result) =>
        result?.data
          ? [{ type: 'Scoring', id: result.data._id }]
          : [{ type: 'Scoring', id: 'LIST' }],
    }),
    searchScores: builder.query({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((item) => ({
                type: 'Scoring',
                id: item._id,
              })),
              { type: 'Scoring', id: 'LIST' },
            ]
          : [{ type: 'Scoring', id: 'LIST' }],
    }),
    recalculateScore: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Scoring', id },
        { type: 'Scoring', id: 'LIST' },
      ],
    }),
    softDeleteScore: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Scoring', id },
        { type: 'Scoring', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCreateScoreMutation,
  useGetScoreByResponseIdQuery,
  useSearchScoresQuery,
  useRecalculateScoreMutation,
  useSoftDeleteScoreMutation,
} = scoringApi;

