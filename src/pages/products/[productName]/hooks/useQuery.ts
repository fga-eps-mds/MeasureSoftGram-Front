import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { Project, RepositoriesSqcHistory } from '@customTypes/project';
import { projectQuery } from '@services/project';

export const useQuery = () => {
  const [project, setProject] = useState<Project>();
  const [repositoriesSqcHistory, setRepositoriesSqcHistory] = useState<RepositoriesSqcHistory>();

  const { query } = useRouter();

  function getPathId(name: string) {
    const nameArray = name.split('-');
    return nameArray[0];
  }

  async function loadProject(productId: string) {
    try {
      const result = await projectQuery.getProjectById('1', productId);
      setProject(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRepositoriesSqcHistory(productId: string) {
    try {
      const result = await projectQuery.getProductRepositoriesSqcHistory('1', productId as string);
      setRepositoriesSqcHistory(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (query?.productName) {
      const productId = getPathId(query?.productName as string);

      loadProject(productId);
      loadRepositoriesSqcHistory(productId);
    }
  }, [query?.productName]);

  return { project, repositoriesSqcHistory };
};
