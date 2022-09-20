import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

import { Organization } from '@customTypes/organization';

interface Props {
  children: ReactNode;
}

interface IOrganizationContext {
  currentOrganization: Organization;
  setCurrentOrganization: (organization: Organization) => void;
  organizationList: Organization[];
  setOrganizationList: (organizations: Organization[]) => void;
}

const OrganizationContext = createContext<IOrganizationContext | undefined>(undefined);

export function OrganizationProvider({ children }: Props) {
  const [organizationList, setOrganizationList] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization>();

  const value = useMemo(
    () => ({
      currentOrganization,
      setCurrentOrganization,
      organizationList,
      setOrganizationList
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
