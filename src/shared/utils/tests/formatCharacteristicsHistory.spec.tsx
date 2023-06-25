import { Historical } from '@customTypes/repository';
import formatCharacteristicsHistory from '@utils/formatCharacteristicsHistory';

describe('formatCharacteristicsHistory', () => {
  test('should return an object with the correct format', () => {
    const historical: Historical[] = [
      {
        id: 1,
        key: 'reliability',
        name: 'Reliability',
        description: null,
        history: [
          {
            id: 121,
            value: 0.8349978922934486,
            created_at: '2023-01-05T21:40:00-03:00'
          },
          {
            id: 123,
            value: 0.8349978922934486,
            created_at: '2023-01-06T00:01:00-03:00'
          }
        ]
      }
    ];

    const values = formatCharacteristicsHistory({ historical, title: 'title-test' });

    expect(values).toMatchSnapshot();
  });
});
