import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

import { RepositoriesSqcHistoryResult } from '@customTypes/product';

interface Props {
  children: ReactNode;
}

interface IRepositoryContext {
  currentRepository?: RepositoriesSqcHistoryResult;
  setCurrentRepository: (repository: RepositoriesSqcHistoryResult) => void;
  repositoryList?: RepositoriesSqcHistoryResult[];
  updateRepositoryList: (repository: RepositoriesSqcHistoryResult) => void;
}

const RepositoryContext = createContext<IRepositoryContext | undefined>(undefined);

export function RepositoryProvider({ children }: Props) {
  const [currentRepository, setCurrentRepository] = useState<RepositoriesSqcHistoryResult | undefined>();
  const [repositoryList, setRepositoryList] = useState<RepositoriesSqcHistoryResult[]>([]);

  const updateRepositoryList = useCallback(
    (repository: RepositoriesSqcHistoryResult) => {
      setRepositoryList([...repositoryList, repository]);
    },
    [repositoryList]
  );

  const value = useMemo(
    () => ({
      currentRepository,
      setCurrentRepository,
      repositoryList,
      updateRepositoryList
    }),
    [currentRepository, repositoryList, updateRepositoryList]
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
