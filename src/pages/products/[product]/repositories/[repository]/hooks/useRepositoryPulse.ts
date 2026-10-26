import { useMemo, useState } from 'react';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { IReleases, ReleasesPaginated } from '@customTypes/product';
import { PulseRelease, PulseRepositoryData } from '@utils/formatPulseChart';
import { HistoricalValuesResponse } from '@utils/historicalValues';
import { toReleaseArray } from '@utils/releaseSelection';

const DAY = 24 * 60 * 60 * 1000;

/**
 * Pulso das características do repositório (US07.01, CA3): uma faixa por característica, com todas as medições de
 * historical-values/characteristics, os marcadores das releases do repositório e o filtro de período.
 */
export function useRepositoryPulse(organizationId: string, productId: string, repositoryId?: number) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const historyRequest = useRequest<HistoricalValuesResponse>(
    productQuery.getRepositoryHistoricalValuesConfig(organizationId, productId, repositoryId, 'characteristics')
  );
  const releasesRequest = useRequest<IReleases[] | ReleasesPaginated>(
    productQuery.getReleaseList(organizationId, productId)
  );

  const rows: PulseRepositoryData[] = useMemo(() => {
    // releases sem repositório escolhido valem para todos os repositórios do produto
    const releases: PulseRelease[] = toReleaseArray(releasesRequest.data)
      .filter((release) => !release.repositories_ids?.length || release.repositories_ids.includes(repositoryId ?? -1))
      .map((release) => ({
        name: release.release_name,
        version: release.release_name,
        start_at: String(release.start_at),
        end_at: String(release.end_at)
      }));

    return (historyRequest.data?.results ?? [])
      .filter((characteristic) => characteristic.history.length > 0)
      .map((characteristic) => ({
        id: characteristic.key,
        name: characteristic.name,
        measurements: characteristic.history,
        releases
      }));
  }, [historyRequest.data, releasesRequest.data, repositoryId]);

  const filteredRows = useMemo(() => {
    if (!startDate && !endDate) return rows;
    const startMs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : -Infinity;
    const endMs = endDate ? new Date(`${endDate}T00:00:00`).getTime() + DAY - 1 : Infinity;
    return rows
      .map((row) => ({
        ...row,
        measurements: row.measurements.filter((measurement) => {
          const time = new Date(measurement.created_at).getTime();
          return time >= startMs && time <= endMs;
        })
      }))
      .filter((row) => row.measurements.length > 0);
  }, [rows, startDate, endDate]);

  return {
    rows: filteredRows,
    hasMeasurements: rows.length > 0,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading: historyRequest.isLoading || releasesRequest.isLoading,
    hasError: !!historyRequest.error || !!releasesRequest.error,
    retry: () => {
      void historyRequest.mutate();
      void releasesRequest.mutate();
    }
  };
}
