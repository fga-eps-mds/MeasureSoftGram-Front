import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { projectQuery } from '@services/index';

import { useProject } from '@contexts/ProjectProvider';

const useQuery = () => {
  const { query } = useRouter();
  const { setProject } = useProject();

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
};

export default useQuery;
