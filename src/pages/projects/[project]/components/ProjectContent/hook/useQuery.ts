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

const useQuery = () => {
  const { query } = useRouter();
  const [project, setProject] = useState<Project>();

  async function loadQuery() {
    if (query?.project) {
      try {
        const result = await projectQuery.getProjectById('1', query?.project as string);
        setProject(result.data);
      } catch (error) {
        return error;
      }
    }
  }

  useEffect(() => {
    loadQuery();
  }, [query?.project]);

  return { project };
};

export default useQuery;
