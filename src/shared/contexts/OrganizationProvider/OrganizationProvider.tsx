import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';

import { Organization } from '@customTypes/organization';
import { organization } from '@services/organization';

interface Props {
  children: ReactNode;
}

interface IOrganizationContext {
  currentOrganization: Organization | undefined;
  setCurrentOrganization: (organization: Organization) => void;
  organizationList: Organization[];
  setOrganizationList: (organizations: Organization[]) => void;
}

const OrganizationContext = createContext<IOrganizationContext | undefined>(undefined);

export function OrganizationProvider({ children }: Props) {
  const [organizationList, setOrganizationList] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | undefined>();

  const loadAllOrganization = async () => {
    try {
      const result = await organization?.getAllOrganization();
      setOrganizationList(result?.data?.results);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadAllOrganization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
