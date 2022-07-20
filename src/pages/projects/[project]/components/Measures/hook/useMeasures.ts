import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { projectQuery } from '@services/index';
import { MeasuresHistory } from '@types/project';

const useMeasures = () => {
  const { query } = useRouter();
  const [projectMeasuresHistory, setProjectMeasuresHistory] = useState<MeasuresHistory>();

  async function loadProjectMeasuresHistory() {
    if (query?.project) {
      try {
        const result = await projectQuery.getProjectMeasuresHistory('1', query?.project as string);
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

export default useMeasures;
