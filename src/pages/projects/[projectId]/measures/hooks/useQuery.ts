import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { projectQuery } from '@services/index';

import { MeasuresHistory } from '@customTypes/project';

const useQuery = () => {
  const { query } = useRouter();
  const [projectMeasuresHistory, setProjectMeasuresHistory] = useState<MeasuresHistory>();

  async function loadProjectMeasuresHistory() {
    if (query?.projectId) {
      try {
        const result = await projectQuery.getProjectMeasuresHistory('1', query?.projectId as string);
        setProjectMeasuresHistory(result.data);
      } catch (error) {
        return error;
      }
    }
  }

  useEffect(() => {
    loadProjectMeasuresHistory();
  }, [query?.project]);

  return { projectMeasuresHistory };
};

export default useQuery;
