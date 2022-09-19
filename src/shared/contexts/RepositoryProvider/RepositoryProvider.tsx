import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

import { Repository, Historical } from '@customTypes/repository';

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
  historicalSQC: Historical;
  setHistoricalSQC: (historical: Historical) => void;
}

const RepositoryContext = createContext<IRepositoryContext | undefined>(undefined);

export function RepositoryProvider({ children }: Props) {
  const [currentRepository, setCurrentRepository] = useState<Repository | undefined>();
  const [repositoryList, setRepositoryList] = useState<Repository[]>();

  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [subCharacteristics, setSubCharacteristics] = useState<string[]>([]);
  const [historicalSQC, setHistoricalSQC] = useState<Historical>();

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
      historicalSQC,
      setHistoricalSQC
    }),
    [currentRepository, repositoryList, characteristics, subCharacteristics, historicalSQC]
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
