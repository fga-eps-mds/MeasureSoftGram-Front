import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { Project, RepositoriesSqcHistory } from '@customTypes/project';
import { projectQuery } from '@services/project';

export const useQuery = () => {
  const [project, setProject] = useState<Project>();
  const [repositoriesSqcHistory, setRepositoriesSqcHistory] = useState<RepositoriesSqcHistory>()

  const { query } = useRouter();

  async function loadProject() {
    if (query?.projectId) {
      try {
        const result = await projectQuery.getProjectById('1', query?.projectId as string);
        setProject(result.data);
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function loadRepositoriesSqcHistory() {
    if (query?.projectId) {
      try {
        const result = await projectQuery.getProductRepositoriesSqcHistory('1', query?.projectId as string);
        setRepositoriesSqcHistory(result.data);
      } catch (error) {
        console.error(error);
      }
    }
  }

  useEffect(() => {
    loadProject();
    loadRepositoriesSqcHistory();
  }, [query?.projectId]);

  return { project, repositoriesSqcHistory };
};
