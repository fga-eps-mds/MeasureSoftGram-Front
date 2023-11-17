import { useState } from 'react';
import { ProductFormData, productQuery } from '@services/product';
export const useProductQuery = () => {
  const [update, setUpdate] = useState<number>(0);

  const createProduct = async (data: ProductFormData): Promise<Result<ProductFormData>> => {
    const result = await productQuery.createProduct(data);
    if (result.type === 'success') {
      setUpdate((prev: number) => prev + 1);
    }
    return result;
  };

  const getProductById = async (organizationId: string, productId: string): Promise<Result<ProductFormData>> =>
    productQuery.getProductById(organizationId, productId);

  const updateProduct = async (productId: string, data: ProductFormData): Promise<Result<ProductFormData>> =>
    productQuery.updateProduct(productId, data);

  const deleteProduct = async (productId: string, organizationId: string | undefined): Promise<Result<void>> => {
    const result = await productQuery.deleteProduct(productId, organizationId);
    if (result.type === 'success') {
      setUpdate((prev: number) => prev + 1);
    }
    return result;
  };
  return {
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
  };
};
