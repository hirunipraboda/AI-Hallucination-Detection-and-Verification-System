export const sampleHistory = [
  {
    _id: '1',
    createdAt: '2023-10-24T14:20:00.000Z',
    originalText:
      'The claims regarding climate change in this article seem to be misrepresented...',
    score: 85,
    confidenceLevel: 'HIGH',
    notes: 'Potential unsupported climate-related statements detected.',
    suspiciousSentences: ['The article makes absolute claims without proper evidence.'],
  },
  {
    _id: '2',
    createdAt: '2023-10-22T09:15:00.000Z',
    originalText:
      'Economic forecast for Q4 indicates a significant shift in consumer behavior...',
    score: 62,
    confidenceLevel: 'MID',
    notes: 'Some claims appear speculative and weakly supported.',
    suspiciousSentences: ['The response gives broad market claims without citations.'],
  },
  {
    _id: '3',
    createdAt: '2023-10-21T18:45:00.000Z',
    originalText:
      'The viral video claiming a new discovery in the Amazon rainforest has been...',
    score: 24,
    confidenceLevel: 'LOW',
    notes: 'Multiple suspicious and unsupported claims found.',
    suspiciousSentences: ['The statement uses certainty without evidence.'],
  },
];