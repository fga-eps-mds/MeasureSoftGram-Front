import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';

import { Organization } from '@customTypes/organization';
import { organizationQuery } from '@services/organization';
import { toast } from 'react-toastify';
import { useRequest } from '@hooks/useRequest';

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
  const [currentOrganization, setCurrentOrganization] = useState<Organization | undefined>();

  const { data } = useRequest<{ results: [Organization] }>(organizationQuery.getAllOrganization());

  const organizationList = useCallback(() => data?.results || [], [data])();

  const value = useMemo(
    () => ({
      currentOrganization,
      setCurrentOrganization,
      organizationList
    }),
    [organizationList, currentOrganization]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);

  if (context === undefined) {
    throw new Error('OrganizationContext must be used within a OrganizationContext');
  }

  return context;
}
