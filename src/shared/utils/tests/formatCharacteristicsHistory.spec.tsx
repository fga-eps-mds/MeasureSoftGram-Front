import { Historical } from '@customTypes/repository';
import formatCharacteristicsHistory, { FormatCharacteristicsHistoryType } from '@utils/formatCharacteristicsHistory';

describe('formatCharacteristicsHistory', () => {
  test('should return an object with the correct format', () => {
    const historical: Historical[] = [
      {
        id: 1,
        key: 'reliability',
        name: 'Reliability',
        history: [
          {
            id: 121,
            value: 0.8349978922934486,
            created_at: new Date('2023-01-05T21:40:00-03:00')
          },
          {
            id: 123,
            value: 0.8349978922934486,
            created_at: new Date('2023-01-06T00:01:00-03:00')
          }
        ],
        latest: {
          id: 1,
          value: 1,
          created_at: new Date()
        }
      }
    ];

    const params: FormatCharacteristicsHistoryType = {
      historical,
      title: 'title-test',
      isEmpty: false
    }

    const values = formatCharacteristicsHistory(params);

    expect(values).toMatchSnapshot();
  });
});
