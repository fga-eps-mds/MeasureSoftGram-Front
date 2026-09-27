import { useMemo, useState } from 'react';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { RepositoriesTsqmiHistory, ReleasesPaginated } from '@customTypes/product';
import { PulseRepositoryData } from '@utils/formatPulseChart';

export function usePulseChartData(organizationId?: string, productId?: string) {
  const [selectedRepo, setSelectedRepo] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const tsqmiHistoryConfig = useMemo(() => {
    if (!organizationId || !productId) return null;
    return productQuery.getProductRepositoriesTsqmiHistoryConfig(organizationId, productId);
  }, [organizationId, productId]);


  const releaseConfig = useMemo(() => {
    if (!organizationId || !productId) return null;
    return productQuery.getReleaseList(organizationId, productId);
  }, [organizationId, productId]);

  const { data: tsqmiHistoryData, isLoading: isTsqmiLoading, error: tsqmiError } = useRequest<RepositoriesTsqmiHistory>(
    tsqmiHistoryConfig
  );

  const { data: releaseData, isLoading: isReleasesLoading } = useRequest<ReleasesPaginated | any>(
    releaseConfig
  );


  const allRepositories: PulseRepositoryData[] = useMemo(() => {
    if (!tsqmiHistoryData || !tsqmiHistoryData.results) return [];

    const rawReleases: any[] = Array.isArray(releaseData)
      ? releaseData
      : Array.isArray(releaseData?.results)
      ? releaseData.results
      : [];

    const parsedReleases = rawReleases.map((rel) => ({
      name: rel.release_name || '',
      version: rel.release_name || '',
      end_at: rel.end_at,
    }));


    return tsqmiHistoryData.results.map((repo) => ({
      id: repo.id,
      name: repo.name,
      measurements: (repo.history || []).map((m) => ({
        created_at: m.created_at,
        value: m.value,
      })),
      releases: parsedReleases,
    }));
  }, [tsqmiHistoryData, releaseData]);

  const filteredRepositories = useMemo(() => {
    let list = [...allRepositories];

    if (selectedRepo !== 'all') {
      list = list.filter((r) => String(r.id) === selectedRepo);
    }

    if (startDate || endDate) {
      const startMs = startDate ? new Date(startDate).getTime() : 0;
      const endMs = endDate ? new Date(endDate).getTime() + 86400000 - 1 : Infinity;

      list = list.map((repo) => ({
        ...repo,
        measurements: repo.measurements.filter((m) => {
          const t = new Date(m.created_at).getTime();
          return t >= startMs && t <= endMs;
        }),
      }));
    }

    return list;
  }, [allRepositories, selectedRepo, startDate, endDate]);

  const totalMeasurements = useMemo(() => {
    return allRepositories.reduce((acc, r) => acc + r.measurements.length, 0);
  }, [allRepositories]);

  const selectedMeasurements = useMemo(() => {
    return filteredRepositories.reduce((acc, r) => acc + r.measurements.length, 0);
  }, [filteredRepositories]);

  const latestDate = useMemo(() => {
    let maxMs = 0;
    allRepositories.forEach((repo) => {
      repo.measurements.forEach((m) => {
        const t = new Date(m.created_at).getTime();
        if (t > maxMs) maxMs = t;
      });
    });
    return maxMs ? new Date(maxMs).toISOString().split('T')[0] : '';
  }, [allRepositories]);

  return {
    allRepositories,
    filteredRepositories,
    selectedRepo,
    setSelectedRepo,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    totalMeasurements,
    selectedMeasurements,
    latestDate,
    isLoading: isTsqmiLoading || isReleasesLoading,
    error: tsqmiError,
  };
}
