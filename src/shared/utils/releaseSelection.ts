import { IReleases, ReleasesPaginated } from '@customTypes/product';

/** Dia local (AAAA-MM-DD) de uma data; as releases são gravadas à meia-noite do fuso do projeto. */
export function toLocalDay(date: Date | string): string {
  const parsed = new Date(date);
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${parsed.getFullYear()}-${month}-${day}`;
}

/** A lista de releases vem paginada do Service, mas aceita também um array. */
export function toReleaseArray(data?: IReleases[] | ReleasesPaginated): IReleases[] {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

/** Da release mais nova para a mais antiga, pela data de início. */
export function sortReleasesByStart(releases: IReleases[]): IReleases[] {
  return [...releases].sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());
}

/**
 * Release atual: a que contém o dia de hoje. Sem nenhuma, a mais recente que já começou e, se
 * nenhuma começou ainda, a mais recente da lista.
 */
export function getCurrentRelease(releases: IReleases[], now: Date = new Date()): IReleases | undefined {
  const today = toLocalDay(now);
  const sorted = sortReleasesByStart(releases);

  return (
    sorted.find((release) => toLocalDay(release.start_at) <= today && today <= toLocalDay(release.end_at)) ??
    sorted.find((release) => toLocalDay(release.start_at) <= today) ??
    sorted[0]
  );
}

/** Release que começou logo antes da informada, para comparar valores entre releases. */
export function getPreviousRelease(releases: IReleases[], releaseId?: number): IReleases | undefined {
  const sorted = sortReleasesByStart(releases);
  const index = sorted.findIndex((release) => release.id === releaseId);
  return index === -1 ? undefined : sorted[index + 1];
}
