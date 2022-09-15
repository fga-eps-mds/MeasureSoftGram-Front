import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

import { Repositories } from '@customTypes/repositories';

interface Props {
  children: ReactNode;
}

interface IRepositoryContext {
  currentRepository?: Repositories;
  setCurrentRepository: (repository: Repositories) => void;
  repositoryList?: Repositories[];
  updateRepositoryList: (repository: Repositories) => void;
}

const RepositoryContext = createContext<IRepositoryContext | undefined>(undefined);

export function RepositoryProvider({ children }: Props) {
  const [currentRepository, setCurrentRepository] = useState<Repositories | undefined>();
  const [repositoryList, setRepositoryList] = useState<Repositories[]>([]);

  const updateRepositoryList = useCallback(
    (repository: Repositories[]) => {
      setRepositoryList(repository);
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
