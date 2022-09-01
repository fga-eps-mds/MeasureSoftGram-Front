import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { Project } from '@customTypes/project';
import { projectQuery } from '@services/project';

export const useQuery = () => {
  const { query } = useRouter();
  const [project, setProject] = useState<Project>();

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

  useEffect(() => {
    loadProject();
  }, [query?.projectId]);

  return { project };
};
