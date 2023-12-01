import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

import { Repository, Historical, Result } from '@customTypes/repository';

interface Props {
  children: ReactNode;
}

interface IRepositoryContext {
  currentRepository?: Repository;
  setCurrentRepository: (repository: Repository) => void;
  repositoryList?: Repository[];
  setRepositoryList: (repository: Repository) => void;
  characteristics: string[];
  setCharacteristics: (characteristics: string[]) => void;
  subCharacteristics: string[];
  setSubCharacteristics: (subCharacteristics: string[]) => void;
  measures: string[];
  setMeasures: (measures: string[]) => void;
  metrics: string[];
  setMetrics: (metrics: string[]) => void;
  historicalTSQMI: Historical;
  setHistoricalTSQMI: (historical: Historical) => void;
  latestTSQMI: Result;
  setLatestTSQMI: (result: Result) => void;
}

const RepositoryContext = createContext<IRepositoryContext | undefined>(undefined);

export function RepositoryProvider({ children }: Props) {
  const [currentRepository, setCurrentRepository] = useState<Repository | undefined>();
  const [repositoryList, setRepositoryList] = useState<Repository[]>();

  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [subCharacteristics, setSubCharacteristics] = useState<string[]>([]);
  const [measures, setMeasures] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [historicalTSQMI, setHistoricalTSQMI] = useState<Historical>();
  const [latestTSQMI, setLatestTSQMI] = useState<Result>();


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
      setLatestTSQMI
    }),
    [currentRepository, repositoryList, characteristics, subCharacteristics, measures, metrics, historicalTSQMI, latestTSQMI]
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
