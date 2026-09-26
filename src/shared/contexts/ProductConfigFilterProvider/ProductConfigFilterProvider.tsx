import React, { createContext, useContext, useMemo, useState } from 'react';

interface IContext {
  configFilter: string[];
  setConfigFilter: (configFilter: string[]) => void;
  hasKey: (key: string) => boolean;
}

export const ProductConfigFilterContext = createContext<IContext>({
  configFilter: [],
  setConfigFilter: () => {},
  hasKey: () => false
});

interface Props {
  children: React.ReactNode;
}

export default function ProductConfigFilterProvider({ children }: Props) {
  const [configFilter, setConfigFilter] = useState<string[]>([]);
  const hasKey = (key: string) => configFilter.includes(key) || key === 'TSQMI';

  const value = useMemo(
    () => ({
      configFilter,
      setConfigFilter,
      hasKey
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configFilter, setConfigFilter]
  );

  return <ProductConfigFilterContext.Provider value={value}>{children}</ProductConfigFilterContext.Provider>;
}

export function useProductConfigFilterContext() {
  const context = useContext(ProductConfigFilterContext);

  if (!context) {
    throw new Error('useProductConfigFilterContext must be used within a ProductConfigFilterContext');
  }

  return context;
}
