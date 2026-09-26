import { IReleases, ReleasesPaginated } from '@customTypes/product';
import filterReleaseList from '../filterReleaseList';

describe('Filter Release List', () => {
  it('Deve retornar uma lista de releases filtrada por nome e datas', () => {
    const releases = {
      results: [
        {
          id: 1,
          release_name: 'Release 1',
          start_at: '2021-01-01',
          end_at: '2021-01-02'
        },
        {
          id: 2,
          release_name: 'Release 2',
          start_at: '2021-01-03',
          end_at: '2021-01-04'
        }
      ],
      count: 2,
      next: null,
      previous: null
    };
    const filteredReleases = filterReleaseList(
      releases as unknown as ReleasesPaginated,
      'Release 1',
      '2021-01-01',
      '2021-01-02'
    );
    expect(filteredReleases[0]).toEqual(releases.results[0]);
  });
});
