import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

import { Organization } from '@customTypes/organization';
import { organizationQuery } from '@services/organization';
import { useRequest } from '@hooks/useRequest';
import { useRouter } from 'next/router';

interface Props {
  children: ReactNode;
}

interface IOrganizationContext {
  currentOrganization: Organization | undefined;
  setCurrentOrganization: (organization: Organization) => void;
  organizationList: Organization[];
}

const OrganizationContext = createContext<IOrganizationContext | undefined>(undefined);

export function OrganizationProvider({ children }: Props) {
  const router = useRouter();

  const [currentOrganization, setCurrentOrganization] = useState<Organization | undefined>();

  const { data } = useRequest<{ results: [Organization] }>(organizationQuery.getAllOrganization());

  const organizationList = useCallback(() => data?.results ?? [], [data])();

  const value = useMemo(() => {
    const regex = /\d+/g;
    const queryProduct = router.query?.product as string;
    const organizationIndex = regex.exec(queryProduct);
    if (!currentOrganization && organizationList.length > 0 && queryProduct && organizationIndex) {
      setCurrentOrganization(organizationList[parseInt(organizationIndex[0], 10) - 1]);
    }
    return { currentOrganization, setCurrentOrganization, organizationList };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganization, organizationList]);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);

  if (context === undefined) {
    throw new Error('OrganizationContext must be used within a OrganizationContext');
  }

  return context;
}
