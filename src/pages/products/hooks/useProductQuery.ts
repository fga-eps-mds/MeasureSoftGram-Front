import { ProductFormData, productQuery } from '@services/product';

export const useProductQuery = () => {
  const createProduct = async (data: ProductFormData): Promise<Result<ProductFormData>> => {
    const result = await productQuery.createProduct(data);
    return result;
  };

  const getProductById = async (organizationId: string, productId: string): Promise<Result<ProductFormData>> =>
    productQuery.getProductById(organizationId, productId);

  const updateProduct = async (productId: string, data: ProductFormData): Promise<Result<ProductFormData>> =>
    productQuery.updateProduct(productId, data);

  const deleteProduct = async (productId: string, organizationId: string | undefined): Promise<Result<void>> => {
    const result = await productQuery.deleteProduct(productId, organizationId);
    return result;
  };
  return {
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
  };
};
