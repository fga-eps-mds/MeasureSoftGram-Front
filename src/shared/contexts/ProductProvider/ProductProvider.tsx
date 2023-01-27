import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

import { Product } from '@customTypes/product';

interface Props {
  children: ReactNode;
}

interface IProductContext {
  currentProduct?: Product;
  setCurrentProduct: (product: Product) => void;
  productsList?: Product[];
  updateProductList: (products: Product[]) => void;
}

const ProductContext = createContext<IProductContext | undefined>(undefined);

export function ProductProvider({ children }: Props) {
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>();
  const [productsList, setProductsList] = useState<Product[]>([]);

  const updateProductList = useCallback((products: Product[]) => {
    setProductsList(products);
  }, []);

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
