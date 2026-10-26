import { useMemo, useState } from 'react';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { ProductTsqmiReleaseHistory, RepositoriesTsqmiHistory } from '@customTypes/product';
import { PulseRelease, PulseRepositoryData } from '@utils/formatPulseChart';

// Janela De/Até em milissegundos, com o dia final inteiro; sem data, o lado fica aberto.
function getPeriodBounds(startDate: string, endDate: string) {
  return {
    startMs: startDate ? new Date(startDate).getTime() : 0,
    endMs: endDate ? new Date(endDate).getTime() + 86400000 - 1 : Infinity,
  };
}

export function usePulseChartData(organizationId?: string, productId?: string) {
  const [selectedRepo, setSelectedRepo] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const tsqmiHistoryConfig = useMemo(() => {
    if (!organizationId || !productId) return null;
    return productQuery.getProductRepositoriesTsqmiHistoryConfig(organizationId, productId);
  }, [organizationId, productId]);


  const releaseHistoryConfig = useMemo(() => {
    if (!organizationId || !productId) return null;
    return productQuery.getProductTsqmiReleaseHistoryConfig(organizationId, productId);
  }, [organizationId, productId]);

  const { data: tsqmiHistoryData, isLoading: isTsqmiLoading, error: tsqmiError } = useRequest<RepositoriesTsqmiHistory>(
    tsqmiHistoryConfig
  );

  const {
    data: releaseHistoryData,
    isLoading: isReleaseHistoryLoading,
    error: releaseHistoryError,
  } = useRequest<ProductTsqmiReleaseHistory>(releaseHistoryConfig);

  // Releases de cada repositório, com o indicador TSQMI consolidado em cada uma (US06.01). Só entram as releases que
  // incluem o repositório, pela regra do Service; a etiqueta é o nome cadastrado no MSGram.
  const releasesByRepository = useMemo(() => {
    const releasesById = new Map((releaseHistoryData?.releases ?? []).map((release) => [release.id, release]));
    const byRepository = new Map<number, PulseRelease[]>();

    (releaseHistoryData?.repositories ?? []).forEach((repo) => {
      const releases: PulseRelease[] = [];
      repo.history.forEach((point) => {
        const release = releasesById.get(point.release_id);
        if (!release) return;
        releases.push({
          id: release.id,
          name: release.release_name,
          version: release.release_name,
          start_at: release.start_at,
          end_at: release.end_at,
          tsqmi: point,
          previousName: releases[releases.length - 1]?.name,
        });
      });
      byRepository.set(repo.id, releases);
    });

    return byRepository;
  }, [releaseHistoryData]);

  const allRepositories: PulseRepositoryData[] = useMemo(() => {
    if (!tsqmiHistoryData || !tsqmiHistoryData.results) return [];

    return tsqmiHistoryData.results.map((repo) => ({
      id: repo.id,
      name: repo.name,
      measurements: (repo.history || []).map((m) => ({
        created_at: m.created_at,
        value: m.value,
      })),
      releases: releasesByRepository.get(repo.id) ?? [],
    }));
  }, [tsqmiHistoryData, releasesByRepository]);

  const filteredRepositories = useMemo(() => {
    let list = [...allRepositories];

    if (selectedRepo !== 'all') {
      list = list.filter((r) => String(r.id) === selectedRepo);
    }

    if (startDate || endDate) {
      const { startMs, endMs } = getPeriodBounds(startDate, endDate);

      const inPeriod = (date: string) => {
        const t = new Date(date).getTime();
        return t >= startMs && t <= endMs;
      };

      // Releases pelo encerramento, onde ficam o marcador e o ponto do indicador.
      list = list.map((repo) => ({
        ...repo,
        measurements: repo.measurements.filter((m) => inPeriod(m.created_at)),
        releases: repo.releases.filter((rel) => inPeriod(rel.end_at)),
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
    // dd/mm/aaaa
    return maxMs ? new Date(maxMs).toISOString().split('T')[0].split('-').reverse().join('/') : '';
  }, [allRepositories]);

  // Releases dos repositórios exibidos (já filtradas pelo período); uma release com vários repositórios conta uma vez.
  const releasesInPeriod = useMemo(
    () => new Set(filteredRepositories.flatMap((repo) => repo.releases.map((rel) => rel.id))).size,
    [filteredRepositories]
  );

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
    releasesInPeriod,
    isLoading: isTsqmiLoading || isReleaseHistoryLoading,
    error: tsqmiError || releaseHistoryError,
  };
}
