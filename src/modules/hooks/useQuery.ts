import { useCallback, useEffect } from 'react';

import { organization } from '@services/organization';

import { useOrganizationContext } from '@contexts/OrganizationProvider';

export const useQuery = () => {
  const { setOrganizationList } = useOrganizationContext();

  const loadAllOrganization = useCallback(async () => {
    try {
      const result = await organization.getAllOrganization();
      setOrganizationList(result.data);
    } catch (error) {
      console.error(error);
    }
  }, [setOrganizationList]);

  useEffect(() => {
    loadAllOrganization();
  }, [loadAllOrganization]);
};
