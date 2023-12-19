import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { Organization } from '@customTypes/organization';
import { organizationQuery } from '@services/organization';
import { toast } from 'react-toastify';
import { useAuth } from '@contexts/Auth';

interface Props {
  children: ReactNode;
}

interface IOrganizationContext {
  currentOrganization: Organization | null;
  currentOrganizations: Organization[];
  setCurrentOrganizations: (organizations: Organization[]) => void;
  organizationList: Organization[];
  isLoading: boolean;
  fetchOrganizations: () => void;
}

const OrganizationContext = createContext<IOrganizationContext | undefined>(undefined);

export function OrganizationProvider({ children }: Props) {
  const { session } = useAuth();
  const [currentOrganizations, setCurrentOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizationList, setOrganizationList] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganizations = async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const result = await organizationQuery.getAllOrganization();
      if (result.type === 'success') {
        const organizations = result.value.map(org => ({
          id: org.id ?? '',
          name: org.name,
          description: org.description ?? '',
          url: org.url ?? '',
          products: org.products ?? [],
          key: org.key ?? ''
        }));
        setOrganizationList(organizations);
      } else {
        toast.error("Erro ao carregar organizações.");
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      toast.error("Erro ao carregar organizações. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (organizationList.length > 0 && currentOrganizations.length === 0) {
      setCurrentOrganizations([organizationList[0]]);
    }
  }, [organizationList, currentOrganizations]);

  useEffect(() => {
    if (currentOrganizations.length > 0) {
      setCurrentOrganization(currentOrganizations[0]);
    } else {
      setCurrentOrganization(null);
    }
  }, [currentOrganizations]);

  const value = useMemo(() => {
    return {
      currentOrganization,
      currentOrganizations,
      setCurrentOrganizations,
      organizationList,
      isLoading,
      fetchOrganizations
    };
  }, [currentOrganization, currentOrganizations, organizationList, isLoading]);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);

  if (context === undefined) {
    throw new Error('OrganizationContext must be used within a OrganizationProvider');
  }

  return context;
}
