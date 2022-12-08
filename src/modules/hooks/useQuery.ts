import { useEffect } from 'react';

import { organization } from '@services/organization';

import { useOrganizationContext } from '@contexts/OrganizationProvider';

export const useQuery = () => {
  const { setOrganizationList } = useOrganizationContext();

  async function loadAllOrganization() {
    try {
      const result = await organization.getAllOrganization();
      setOrganizationList(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadAllOrganization();
  }, []);
};
