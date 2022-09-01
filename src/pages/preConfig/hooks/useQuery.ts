import { useEffect, useState } from 'react';
import { projectQuery } from '@services/index';
import { PreConfigRoot } from '@customTypes/preConfig';
import mockedData from '../utils/mockedData.json';

export const useQuery = () => {
  const [preConfig, setPreConfig] = useState<PreConfigRoot>();

  async function loadProject() {
    try {
      const result = (await projectQuery.getPreConfig('1', '1')) as unknown as PreConfigRoot;

      setPreConfig(result);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadProject();
  }, []);

  return preConfig ?? mockedData;
};
