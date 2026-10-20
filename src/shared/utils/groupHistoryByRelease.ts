import { IReleases } from '@customTypes/product';

export interface HistoryPoint {
  value: number;
  created_at: Date | string;
}

export interface HistoryEntity {
  key: string;
  name: string;
  history?: HistoryPoint[];
}

export interface ReleaseSeries {
  key: string;
  name: string;
  /** Um valor por release, na ordem de `releases`; `null` quando não houve análise na release. */
  values: (number | null)[];
}

export type ReleaseWithRepositories = IReleases & { repositories_ids?: number[] };

/** Dia local (AAAA-MM-DD) de uma data; as releases são gravadas à meia-noite do fuso do projeto. */
function toLocalDay(date: Date | string): string {
  const parsed = new Date(date);
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${parsed.getFullYear()}-${month}-${day}`;
}

/**
 * Releases que valem para o repositório, da mais antiga para a mais nova: as que já começaram e
 * que não escolheram repositórios ou escolheram este.
 */
export function getRepositoryReleases(
  releases: ReleaseWithRepositories[],
  repositoryId?: number,
  now: Date = new Date()
): ReleaseWithRepositories[] {
  const today = toLocalDay(now);

  return releases
    .filter((release) => toLocalDay(release.start_at) <= today)
    .filter(
      (release) =>
        repositoryId === undefined ||
        !release.repositories_ids?.length ||
        release.repositories_ids.includes(repositoryId)
    )
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
}

/**
 * Último valor dentro da janela de cada release, do dia de `start_at` ao dia de `end_at`, ambos
 * inclusive. É a mesma regra do gráfico de pulso e do Service (`get_latest_values_in_release_window`).
 */
export function getLatestValuePerRelease(history: HistoryPoint[], releases: IReleases[]): (number | null)[] {
  return releases.map((release) => {
    const startDay = toLocalDay(release.start_at);
    const endDay = toLocalDay(release.end_at);

    const latest = history
      .filter((point) => {
        const pointDay = toLocalDay(point.created_at);
        return pointDay >= startDay && pointDay <= endDay;
      })
      .reduce<HistoryPoint | null>(
        (last, point) => (!last || new Date(point.created_at) >= new Date(last.created_at) ? point : last),
        null
      );

    return latest ? latest.value : null;
  });
}

/** Uma série por entidade; entidades sem valor em nenhuma release ficam de fora. */
export function groupHistoryByRelease(entities: HistoryEntity[], releases: IReleases[]): ReleaseSeries[] {
  return entities
    .map((entity) => ({
      key: entity.key,
      name: entity.name,
      values: getLatestValuePerRelease(entity.history ?? [], releases),
    }))
    .filter((series) => series.values.some((value) => value !== null));
}
