import React from 'react';
import ProductConfigFilterProvider from '@contexts/ProductConfigFilterProvider';

export default function RepositoryLayout({ children }: { children: React.ReactNode }) {
  return <ProductConfigFilterProvider>{children}</ProductConfigFilterProvider>;
}
