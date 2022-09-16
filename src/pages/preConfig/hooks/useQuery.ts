import { useEffect, useState } from 'react';
import { productQuery } from '@services/product';
import { PreConfigRoot } from '@customTypes/preConfig';

import mockedData from '../utils/mockedData.json';

export const useQuery = () => {
  const [preConfig, setPreConfig] = useState<PreConfigRoot>();

  async function loadProduct() {
    try {
      const result = (await productQuery.getProductCurrentPreConfig('1', '3')) as unknown as PreConfigRoot;

      setPreConfig(result);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadProduct();
  }, []);

  return preConfig ?? mockedData;
};
