import { IReleases } from '@customTypes/product';
import {
  getLatestValuePerRelease,
  getRepositoryReleases,
  groupHistoryByRelease,
  ReleaseWithRepositories,
} from '../groupHistoryByRelease';

const release = (id: number, start: string, end: string, repositoryIds?: number[]): ReleaseWithRepositories => ({
  id,
  release_name: `v${id}`,
  start_at: `${start}T00:00:00-03:00`,
  end_at: `${end}T00:00:00-03:00`,
  created_by: '1',
  product: 1,
  repositories_ids: repositoryIds,
});

const point = (value: number, createdAt: string) => ({ value, created_at: createdAt });

describe('groupHistoryByRelease', () => {
  const releases: IReleases[] = [release(1, '2026-03-01', '2026-03-31'), release(2, '2026-04-01', '2026-04-30')];

  describe('getLatestValuePerRelease', () => {
    it('usa o último valor dentro da janela de cada release', () => {
      const history = [
        point(0.2, '2026-03-05T10:00:00-03:00'),
        point(0.4, '2026-03-20T10:00:00-03:00'),
        point(0.7, '2026-04-10T10:00:00-03:00'),
      ];

      expect(getLatestValuePerRelease(history, releases)).toEqual([0.4, 0.7]);
    });

    it('considera o último dia da release inteiro', () => {
      expect(getLatestValuePerRelease([point(0.9, '2026-03-31T22:30:00-03:00')], releases)).toEqual([0.9, null]);
    });

    it('não usa valores de fora da janela e deixa a release sem valor como null', () => {
      const history = [point(0.1, '2026-02-27T10:00:00-03:00'), point(0.5, '2026-05-02T10:00:00-03:00')];

      expect(getLatestValuePerRelease(history, releases)).toEqual([null, null]);
    });

    it('não depende da ordem do histórico', () => {
      const history = [point(0.4, '2026-03-20T10:00:00-03:00'), point(0.2, '2026-03-05T10:00:00-03:00')];

      expect(getLatestValuePerRelease(history, releases)).toEqual([0.4, null]);
    });
  });

  describe('getRepositoryReleases', () => {
    const now = new Date('2026-04-15T12:00:00-03:00');

    it('ordena da release mais antiga para a mais nova e tira as que ainda não começaram', () => {
      const result = getRepositoryReleases(
        [release(3, '2026-05-01', '2026-05-31'), release(2, '2026-04-01', '2026-04-30'), release(1, '2026-03-01', '2026-03-31')],
        undefined,
        now
      );

      expect(result.map((item) => item.id)).toEqual([1, 2]);
    });

    it('mantém só as releases sem repositórios escolhidos ou que escolheram o repositório', () => {
      const result = getRepositoryReleases(
        [release(1, '2026-03-01', '2026-03-31', [7]), release(2, '2026-04-01', '2026-04-30', []), release(4, '2026-02-01', '2026-02-28', [9])],
        7,
        now
      );

      expect(result.map((item) => item.id)).toEqual([1, 2]);
    });
  });

  describe('groupHistoryByRelease', () => {
    it('monta uma série por entidade e tira as que não têm valor em nenhuma release', () => {
      const series = groupHistoryByRelease(
        [
          { key: 'reliability', name: 'Reliability', history: [point(0.6, '2026-04-02T10:00:00-03:00')] },
          { key: 'maintainability', name: 'Maintainability', history: [point(0.3, '2026-01-02T10:00:00-03:00')] },
          { key: 'functional_suitability', name: 'Functional Suitability' },
        ],
        releases
      );

      expect(series).toEqual([{ key: 'reliability', name: 'Reliability', values: [null, 0.6] }]);
    });
  });
});
