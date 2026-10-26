import { IReleases } from '@customTypes/product';
import {
  getCurrentRelease,
  getPreviousRelease,
  sortReleasesByStart,
  toLocalDay,
  toReleaseArray
} from '../releaseSelection';

function release(id: number, start: string, end: string): IReleases {
  return {
    id,
    release_name: `R${id}`,
    start_at: `${start}T00:00:00-03:00`,
    end_at: `${end}T00:00:00-03:00`,
    created_by: 'user',
    product: 1
  };
}

const releases = [
  release(1, '2026-01-01', '2026-01-31'),
  release(3, '2026-03-01', '2026-03-31'),
  release(2, '2026-02-01', '2026-02-28')
];

describe('releaseSelection', () => {
  it('converte a data para o dia local', () => {
    expect(toLocalDay('2026-03-31T00:00:00-03:00')).toBe('2026-03-31');
  });

  it('aceita a lista de releases paginada ou como array', () => {
    expect(toReleaseArray({ results: releases })).toEqual(releases);
    expect(toReleaseArray(releases)).toEqual(releases);
    expect(toReleaseArray(undefined)).toEqual([]);
  });

  it('ordena da release mais nova para a mais antiga', () => {
    expect(sortReleasesByStart(releases).map((item) => item.id)).toEqual([3, 2, 1]);
  });

  describe('getCurrentRelease', () => {
    it('escolhe a release que contém o dia de hoje', () => {
      expect(getCurrentRelease(releases, new Date('2026-02-15T12:00:00-03:00'))?.id).toBe(2);
    });

    it('considera o último dia da release inteiro', () => {
      expect(getCurrentRelease(releases, new Date('2026-02-28T23:00:00-03:00'))?.id).toBe(2);
    });

    it('sem release em andamento, escolhe a mais recente que já começou', () => {
      expect(getCurrentRelease(releases, new Date('2026-05-10T12:00:00-03:00'))?.id).toBe(3);
    });

    it('se nenhuma começou, escolhe a mais recente da lista', () => {
      expect(getCurrentRelease(releases, new Date('2025-12-01T12:00:00-03:00'))?.id).toBe(3);
    });

    it('sem releases, não escolhe nenhuma', () => {
      expect(getCurrentRelease([])).toBeUndefined();
    });
  });

  it('acha a release que começou logo antes da informada', () => {
    expect(getPreviousRelease(releases, 3)?.id).toBe(2);
    expect(getPreviousRelease(releases, 1)).toBeUndefined();
    expect(getPreviousRelease(releases, 99)).toBeUndefined();
  });
});
