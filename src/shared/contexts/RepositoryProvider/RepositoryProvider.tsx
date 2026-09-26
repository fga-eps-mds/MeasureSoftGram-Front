import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

import { Repository, Historical } from '@customTypes/repository';
import { RepositoriesLatestTsqmi, TsqmiValue } from '@customTypes/product';
import { useLocalStorage } from '@hooks/useLocalStorage';

interface Props {
  children: ReactNode;
}

interface IRepositoryContext {
  currentRepository?: Repository;
  setCurrentRepository: (repository?: Repository) => void;
  repositoryList?: Repository[];
  setRepositoryList: (repository?: Repository[]) => void;
  characteristics: string[];
  setCharacteristics: (characteristics: string[]) => void;
  subCharacteristics: string[];
  setSubCharacteristics: (subCharacteristics: string[]) => void;
  measures: string[];
  setMeasures: (measures: string[]) => void;
  metrics: string[];
  setMetrics: (metrics: string[]) => void;
  historicalTSQMI: Historical;
  setHistoricalTSQMI: (historical?: Historical) => void;
  latestTSQMI: TsqmiValue;
  setLatestTSQMI: (result?: TsqmiValue) => void;
  latestTSQMIBadgeUrl: string;
  setLatestTSQMIBadgeUrl: (result?: string) => void;
  characteristicBadgeUrls: Record<string, string>;
  setCharacteristicBadgeUrls: (urls: Record<string, string>) => void;
  repositoriesLatestTsqmi: RepositoriesLatestTsqmi;
  setRepositoriesLatestTsqmi: (result?: RepositoriesLatestTsqmi) => void;
}

const RepositoryContext = createContext<IRepositoryContext | undefined>(undefined);

export function RepositoryProvider({ children }: Props) {
  const [currentRepository, setCurrentRepository] = useState<Repository | undefined>();
  const [repositoryList, setRepositoryList] = useState<Repository[]>();
  const { storedValue: storedRepoId, setValue: setStoredRepoId } = useLocalStorage<string | null>('selectedRepositoryId', null);

  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [subCharacteristics, setSubCharacteristics] = useState<string[]>([]);
  const [measures, setMeasures] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [historicalTSQMI, setHistoricalTSQMI] = useState<Historical>();
  const [latestTSQMI, setLatestTSQMI] = useState<TsqmiValue>();
  const [latestTSQMIBadgeUrl, setLatestTSQMIBadgeUrl] = useState<string>();
  const [characteristicBadgeUrls, setCharacteristicBadgeUrls] = useState<Record<string, string>>({});
  const [repositoriesLatestTsqmi, setRepositoriesLatestTsqmi] = useState<RepositoriesLatestTsqmi>();

  React.useEffect(() => {
    if (repositoryList && repositoryList.length > 0) {
      if (currentRepository === undefined) {
        if (storedRepoId) {
          const found = repositoryList.find(r => r.id === Number(storedRepoId) || r.id === storedRepoId);
          if (found) {
            setCurrentRepository(found);
            return;
          }
        }
        setCurrentRepository(repositoryList[0]);
      }
    } else if (repositoryList && repositoryList.length === 0) {
      setCurrentRepository(undefined);
    }
  }, [repositoryList, storedRepoId, currentRepository]);

  React.useEffect(() => {
    if (currentRepository && currentRepository.id) {
      setStoredRepoId(currentRepository.id.toString());
    } else if (currentRepository === undefined && repositoryList && repositoryList.length === 0) {
      setStoredRepoId(null);
    }
  }, [currentRepository, repositoryList, setStoredRepoId]);


  const value = useMemo(
    () => ({
      currentRepository,
      setCurrentRepository,
      repositoryList,
      setRepositoryList,
      characteristics,
      setCharacteristics,
      subCharacteristics,
      setSubCharacteristics,
      measures,
      setMeasures,
      metrics,
      setMetrics,
      historicalTSQMI,
      setHistoricalTSQMI,
      latestTSQMI,
      setLatestTSQMI,
      latestTSQMIBadgeUrl,
      setLatestTSQMIBadgeUrl,
      characteristicBadgeUrls,
      setCharacteristicBadgeUrls,
      repositoriesLatestTsqmi,
      setRepositoriesLatestTsqmi
    }),
    [
      currentRepository,
      repositoryList,
      characteristics,
      subCharacteristics,
      measures,
      metrics,
      historicalTSQMI,
      latestTSQMI,
      latestTSQMIBadgeUrl,
      characteristicBadgeUrls,
      repositoriesLatestTsqmi
    ]
  );

  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
}

export function useRepositoryContext() {
  const context = useContext(RepositoryContext);

  if (context === undefined) {
    throw new Error('useRepositoryContext must be used within a RepositoryContext');
  }

  return context;
}
