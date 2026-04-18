import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  filters: {
    search: '',
    confidenceRange: [0, 100],
    riskLevel: 'All',
  },
  pagination: {
    page: 1,
    limit: 20,
  },
  selectedRecordId: null,
};

const scoringSlice = createSlice({
  name: 'scoring',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.filters.search = action.payload;
      state.pagination.page = 1;
    },
    setConfidenceRange(state, action) {
      state.filters.confidenceRange = action.payload;
      state.pagination.page = 1;
    },
    setRiskLevel(state, action) {
      state.filters.riskLevel = action.payload;
      state.pagination.page = 1;
    },
    setPage(state, action) {
      state.pagination.page = action.payload;
    },
    selectRecord(state, action) {
      state.selectedRecordId = action.payload;
    },
  },
});

export const {
  setSearch,
  setConfidenceRange,
  setRiskLevel,
  setPage,
  selectRecord,
} = scoringSlice.actions;

export default scoringSlice.reducer;

