import { ProductFormData, productQuery } from '@services/product';
import { useState } from 'react';

export const useProductQuery = () => {
  const [update, setUpdate] = useState<number>(0);

  const createProduct = async (data: ProductFormData): Promise<Result<ProductFormData>> => {
    const result = await productQuery.createProduct(data);
    if (result.type === 'success') {
      setUpdate((prev: number) => prev + 1);
    }
    return result;
  };

  return {
    createProduct
  };
};
