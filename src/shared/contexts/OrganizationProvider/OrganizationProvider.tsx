import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { Organization } from '@customTypes/organization';
import { organizationQuery } from '@services/organization';
import { toast } from 'react-toastify';
import { useAuth } from '@contexts/Auth';
import { useLocalStorage } from '@hooks/useLocalStorage';

interface Props {
  children: ReactNode;
}

interface IOrganizationContext {
  currentOrganization: Organization | null;
  currentOrganizations: Organization[];
  setCurrentOrganizations: (organizations: Organization[]) => void;
  organizationList: Organization[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchOrganizations: (forceFetch?: boolean) => void;
}

const OrganizationContext = createContext<IOrganizationContext | undefined>(undefined);

const isSameGithubOrg = (githubOrgName: string, dbOrg: Organization) => {
  return dbOrg.name === githubOrgName || dbOrg.key === githubOrgName;
};

export function OrganizationProvider({ children }: Props) {
  const { session } = useAuth();
  const [currentOrganizations, setCurrentOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizationList, setOrganizationList] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const { storedValue: storedOrgId, setValue: setStoredOrgId } = useLocalStorage<string | null>('selectedOrgId', null);

  const syncGithubOrganizations = async (organizations: Organization[]) => {
    if (sessionStorage.getItem('github_orgs_synced') === 'true') return;
    sessionStorage.setItem('github_orgs_synced', 'true');

    try {
      const githubOrgsRes = await organizationQuery.getGithubOrganizations();
      if (githubOrgsRes.type === 'success' && githubOrgsRes.value.length > 0) {

        const missingOrgs = githubOrgsRes.value.filter(
          (githubOrg) => !organizations.some((dbOrg) => isSameGithubOrg(githubOrg.github_org_name, dbOrg))
        );

        if (missingOrgs.length > 0) {
          const importPromises = missingOrgs.map((org) =>
            organizationQuery.importOrganization(org.github_org_name)
          );

          const results = await Promise.all(importPromises);
          const hasSuccessfulImport = results.some((res) => res.type === 'success');

          if (hasSuccessfulImport) {
            const reloadResult = await organizationQuery.getAllOrganization();
            if (reloadResult.type === 'success') {
              const reloadedOrgs = reloadResult.value.map((org) => ({
                id: org.id ?? '',
                name: org.name,
                description: org.description ?? '',
                url: org.url ?? '',
                products: org.products ?? [],
                key: org.key ?? ''
              }));
              setOrganizationList(reloadedOrgs);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to sync GitHub organizations:", error);
    }
  };

  const fetchOrganizations = useCallback(async (forceFetch?: boolean) => {
    if (!session && !forceFetch) return;

    setIsLoading(true);
    try {
      const result = await organizationQuery.getAllOrganization();
      if (result.type === 'success') {
        const organizations = result.value.map((org) => ({
          id: org.id ?? '',
          name: org.name,
          description: org.description ?? '',
          url: org.url ?? '',
          products: org.products ?? [],
          key: org.key ?? ''
        }));

        setOrganizationList(organizations);
        setHasFetched(true);
        setIsLoading(false);
  
        syncGithubOrganizations(organizations);
      } else {
        toast.error("Erro ao carregar organizações.");
        setHasFetched(true);
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      toast.error("Erro ao carregar organizações. Por favor, tente novamente.");
      setHasFetched(true);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.username) {
      fetchOrganizations();
    } else if (!session) {
      setOrganizationList([]);
      setHasFetched(false);
    }
  }, [session?.username, fetchOrganizations]);

  useEffect(() => {
    if (organizationList.length > 0) {
      if (currentOrganizations.length === 0) {
        if (storedOrgId) {
          const found = organizationList.find((org) => org.id === storedOrgId || org.id?.toString() === storedOrgId);
          if (found) {
            setCurrentOrganizations([found]);
            return;
          }
        }
        setCurrentOrganizations([organizationList[0]]);
      }
    }
  }, [organizationList, currentOrganizations, storedOrgId]);

  useEffect(() => {
    if (currentOrganizations.length > 0) {
      setCurrentOrganization(currentOrganizations[0]);
      if (currentOrganizations[0].id) {
        setStoredOrgId(currentOrganizations[0].id.toString());
      }
    } else if (organizationList.length === 0 && hasFetched) {
      setCurrentOrganization(null);
      setStoredOrgId(null);
    }
  }, [currentOrganizations, organizationList, hasFetched, setStoredOrgId]);

  const value = useMemo(() => ({
    currentOrganization,
    currentOrganizations,
    setCurrentOrganizations,
    organizationList,
    isLoading,
    hasFetched,
    fetchOrganizations
  }), [currentOrganization, currentOrganizations, organizationList, isLoading, hasFetched, fetchOrganizations]);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);

  if (context === undefined) {
    throw new Error('OrganizationContext must be used within a OrganizationProvider');
  }

  return context;
}
