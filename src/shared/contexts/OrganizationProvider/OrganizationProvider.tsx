import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

import { Organization } from '@customTypes/organization';
import { organizationQuery } from '@services/organization';
import { useRequest, GetRequest } from '@hooks/useRequest';
import { useRouter } from 'next/router';

interface Props {
  children: ReactNode;
}

interface IOrganizationContext {
  currentOrganizations: Organization[];
  setCurrentOrganizations: (organizations: Organization[]) => void;
  organizationList: Organization[];
}

const OrganizationContext = createContext<IOrganizationContext | undefined>(undefined);

export function OrganizationProvider({ children }: Props) {
  const router = useRouter();

  const [currentOrganizations, setCurrentOrganizations] = useState<Organization[]>([]);

  const { data } = useRequest<{ results: Organization[] }>(
    organizationQuery.getAllOrganization() as unknown as GetRequest
  );


  const organizationList = data?.results ?? [];

  const value = useMemo(() => {
    const regex = /\d+/g;
    const queryProduct = router.query?.product as string;
    const organizationIndex = regex.exec(queryProduct);

    if (currentOrganizations.length === 0 && organizationList.length > 0 && queryProduct && organizationIndex) {
      setCurrentOrganizations([organizationList[parseInt(organizationIndex[0], 10) - 1]]);
    }

    return { currentOrganizations, setCurrentOrganizations, organizationList };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganizations, organizationList]);

  console.log('Dados da organização atualizada:', currentOrganizations);
  console.log('Lista de organizações atualizada:', organizationList);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);

  if (context === undefined) {
    throw new Error('OrganizationContext must be used within a OrganizationProvider');
  }

  return context;
}
