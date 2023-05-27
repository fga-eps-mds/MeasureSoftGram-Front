import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';

import { Product } from '@customTypes/product';
import { productQuery } from '@services/product';
import { useOrganizationContext } from '@contexts/OrganizationProvider';

interface Props {
  children: ReactNode;
}

export interface IProductContext {
  currentProduct?: Product;
  setCurrentProduct: (product: Product) => void;
  productsList?: Product[];
  updateProductList: (products: Product[]) => void;
}

const ProductContext = createContext<IProductContext | undefined>(undefined);

export function ProductProvider({ children }: Props) {
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>();
  const [productsList, setProductsList] = useState<Product[]>([]);

  const { currentOrganization } = useOrganizationContext();

  const updateProductList = useCallback((products: Product[]) => {
    setProductsList(products);
  }, []);

  const loadAllProducts = async () => {
    try {
      const result = await productQuery.getAllProducts(currentOrganization.id);

      updateProductList(result.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (currentOrganization) {
      loadAllProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganization]);

  const value = useMemo(
    () => ({
      currentProduct,
      setCurrentProduct,
      productsList,
      updateProductList
    }),
    [currentProduct, productsList, updateProductList]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProductContext() {
  const context = useContext(ProductContext);

  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductContext');
  }

  return context;
}