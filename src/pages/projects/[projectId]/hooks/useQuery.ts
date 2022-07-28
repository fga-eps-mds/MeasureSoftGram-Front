import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { Project } from '@customTypes/project';
import { projectQuery } from '@services/index';

export const useQuery = () => {
  const { query } = useRouter();
  const [project, setProject] = useState<Project>();

  useEffect(() => {
    async function loadQuery() {
      if (query?.projectId) {
        try {
          const result = await projectQuery.getProjectById('1', query?.projectId as string);
          setProject(result.data);
        } catch (error) {
          console.error(error);
        }
      }
    }

    loadQuery();
  }, [query?.projectId]);

  return { project };
};
