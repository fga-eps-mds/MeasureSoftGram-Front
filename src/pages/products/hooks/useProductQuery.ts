import { useEffect, useState } from 'react';
import { useProductContext } from '@contexts/ProductProvider';
import { toast } from 'react-toastify';
import { ProductFormData, productQuery } from '@services/product';
import { Product } from '@customTypes/product';
import api from '@services/api';

// interface CurrentProductType extends Product {
//   id: string;
// }

// interface ProductWithId extends ProductFormData {
//   id?: string;
// }

export const useProductQuery = () => {
  // const { currentProducts, setCurrentProducts } = useProductContext();

  // const loadCurrentProducts = async () => {
  //   try {
  //     const responseConfig = await productQuery.getAllProduct();

  //     const response = await api.request(responseConfig);

  //     const products = response.data.results.map((item: ProductWithId) => ({
  //       ...item,
  //       id: item.id || 'fake-id'
  //     })) as CurrentProductType[];

  //     setCurrentProducts(products);
  //   } catch (error: any) {
  //     console.error("Erro detalhado:", error);
  //     toast.error(`Erro ao carregar produtos: ${error.message || 'Erro desconhecido'}`);
  //   }
  // };

  const [update, setUpdate] = useState<number>(0);

  const createProduct = async (data: ProductFormData): Promise<Result<ProductFormData>> => {
    const result = await productQuery.createProduct(data);
    if (result.type === 'success') {
      setUpdate((prev: number) => prev + 1);
    }
    return result;
  };

  // const getProductById = async (id: string): Promise<Result<ProductFormData>> =>
  // productQuery.getProductById(id);

  // const updateProduct = async (id: string, data: ProductFormData): Promise<Result<void>> =>
  // productQuery.updateProduct(id, data);

  const deleteProduct = async (productId: string, organizationId: string | undefined): Promise<Result<void>> => {
    const result = await productQuery.deleteProduct(productId, organizationId);
    if (result.type === 'success') {
        setUpdate((prev: number) => prev + 1);
    }
    return result;
};

  // useEffect(() => {
  //   if (!currentProducts || currentProducts.length === 0 || update > 0) {
  //     loadCurrentProducts();
  //     if (update > 0) setUpdate(0);
  //   }
  // }, [currentProducts, update]);


  return {
    createProduct,
    // getProductById,
    // updateProduct,
    deleteProduct
  };
};
