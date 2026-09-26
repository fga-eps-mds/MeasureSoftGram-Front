import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';

import { Product } from '@customTypes/product';
import { productQuery } from '@services/product';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useLocalStorage } from '@hooks/useLocalStorage';

interface Props {
  children: ReactNode;
}

export interface IProductContext {
  currentProduct?: Product | null;
  setCurrentProduct: (product: Product | null) => void;
  productsList?: Product[];
  updateProductList: (products: Product[]) => void;
  loadAllProducts: () => Promise<void>;
}

export const ProductContext = createContext<IProductContext | undefined>(undefined);

export function ProductProvider({ children }: Props) {
  const [currentProduct, setCurrentProduct] = useState<Product | null | undefined>(undefined); // Initialize with undefined
  const [productsList, setProductsList] = useState<Product[]>([]);
  const { storedValue: storedProductId, setValue: setStoredProductId } = useLocalStorage<string | null>('selectedProductId', null);

  const { currentOrganization } = useOrganizationContext();

  const updateProductList = useCallback((products: Product[]) => {
    setProductsList(products);
  }, []);

  const loadAllProducts = async () => {
    try {
      if (!currentOrganization) {
        updateProductList([]);
        return;
      }

      const result = await productQuery.getAllProducts(currentOrganization.id);
      const products = result.data?.results || result.data || [];
      updateProductList(products);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (currentOrganization) {
      // Load products without indiscriminately clearing currentProduct, 
      // let the next useEffect decide if it's still valid
      loadAllProducts();
    } else {
      setCurrentProduct(null);
      setProductsList([]);
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (productsList.length > 0) {
      if (currentProduct === undefined || currentProduct === null) {
        if (storedProductId) {
          const found = productsList.find(p => p.id === storedProductId || p.id?.toString() === storedProductId);
          if (found) {
            setCurrentProduct(found);
            return;
          }
        }
        setCurrentProduct(productsList[0]);
      }
    } else if (currentOrganization) {
      // If we loaded products but it's empty
      setCurrentProduct(null);
    }
  }, [productsList, storedProductId, currentProduct, currentOrganization]);

  // Sync back to local storage whenever it changes
  useEffect(() => {
    if (currentProduct && currentProduct.id) {
      setStoredProductId(currentProduct.id.toString());
    } else if (currentProduct === null) {
      setStoredProductId(null);
    }
  }, [currentProduct, setStoredProductId]);

  const value = useMemo(
    () => ({
      currentProduct,
      setCurrentProduct,
      productsList,
      updateProductList,
      loadAllProducts,
    }),
    [currentProduct, productsList, updateProductList, loadAllProducts]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProductContext() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error('useProductContext must be used within a ProductContext');
  }

  return context;
}
