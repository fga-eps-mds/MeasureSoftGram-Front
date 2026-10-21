import { IReleases } from '@customTypes/product';

export interface ReleaseSeries {
  key: string;
  name: string;
  /** Um valor por release, na ordem de `releases`; `null` quando não houve análise na release. */
  values: (number | null)[];
}

/** Resposta de repositories/<id>/release-history/: um ponto por release para cada entidade do nível. */
export interface RepositoryReleaseHistory {
  releases: Pick<IReleases, 'id' | 'release_name'>[];
  entities: {
    key: string;
    name: string;
    history: { release_id: number; value: number | null }[];
  }[];
}

/**
 * Nomes das releases e uma série por entidade, na ordem das releases (da mais antiga para a mais nova, como o
 * Service devolve). O valor de cada release já vem calculado no Service: a última análise dentro da janela dela.
 * Entidades sem valor em nenhuma release ficam de fora.
 */
export function toReleaseSeries(history?: RepositoryReleaseHistory): {
  releaseNames: string[];
  series: ReleaseSeries[];
} {
  if (!history) return { releaseNames: [], series: [] };

  const series = history.entities
    .map((entity) => {
      const valueByRelease = new Map(entity.history.map((point) => [point.release_id, point.value]));
      return {
        key: entity.key,
        name: entity.name,
        values: history.releases.map((release) => valueByRelease.get(release.id) ?? null)
      };
    })
    .filter((item) => item.values.some((value) => value !== null));

  return { releaseNames: history.releases.map((release) => release.release_name), series };
}
