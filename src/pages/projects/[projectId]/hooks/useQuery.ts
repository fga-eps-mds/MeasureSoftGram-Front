import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { projectQuery } from '@services/index';

interface Project {
  id: number;
  name: string;
  description: string;
  github_url: string;
  created_at: string;
  updated_at: string;
}

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
          // throw new Error();
        }
      }
    }

    loadQuery();
  }, [query?.projectId]);

  return { project };
};
