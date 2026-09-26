import convertToCsv from '@utils/convertToCsv';
import tsqmiHistory from './mock/tsqmiHistory.json'
import { tsqmiHistoryCsvOutput } from './mock/tsqmiHistoryCsvOutput'

describe('convertToCsv', () => {
  test('should return a string with the correct format', () => {
    const filters = {
      "dateRange": {
        "startDate": 1724264752241.6025,
        "endDate": 1724264756299
      }
    }
    expect(convertToCsv(tsqmiHistory, filters)).toBe(tsqmiHistoryCsvOutput);
  });
});
