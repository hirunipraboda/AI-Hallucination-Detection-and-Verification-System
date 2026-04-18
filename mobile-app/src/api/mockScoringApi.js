import records from '../../tests/mockData/scoringRecords.json';

export function mockSearchScores() {
  return {
    data: records,
    meta: {
      page: 1,
      limit: records.length,
      total: records.length,
      totalPages: 1,
    },
  };
}

