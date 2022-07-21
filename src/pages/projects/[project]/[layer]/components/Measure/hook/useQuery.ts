import { useEffect, useState } from 'react';

import { projectQuery } from '@services/index';

import { Measure } from '@types/measure';
import { useProject } from '@contexts/ProjectProvider';

const useQuery = () => {
  const { project } = useProject();
  const [measure, setMeasure] = useState<Measure>();

  async function loadQuery() {
    try {
      if (project?.id) {
        const result = await projectQuery.getProjectMeasures('1', String(project.id));
        setMeasure(result.data);
      }
    } catch (error) {
      return error;
    }
  }

  useEffect(() => {
    loadQuery();
  }, []);

  return { measure };
};

export default useQuery;
