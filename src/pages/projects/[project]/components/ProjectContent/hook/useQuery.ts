import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { projectQuery } from '@services/index';
import { Project } from '@types/project';

const useQuery = () => {
  const { query } = useRouter();
  const [project, setProject] = useState<Project>();

  async function loadProject() {

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
    loadProject();
  }, [query?.project]);

  return { project };
};

export default useQuery;
