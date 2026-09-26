import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { organizationQuery, OrganizationFormData, Result } from '@services/organization';

export const useOrganizationQuery = () => {
  const { fetchOrganizations } = useOrganizationContext();

  const createOrganization = async (data: OrganizationFormData): Promise<Result<OrganizationFormData>> => {
    const result = await organizationQuery.createOrganization(data);
    if (result.type === 'success') {
      fetchOrganizations(true);
    }
    return result;
  };

  const getOrganizationById = async (id: string): Promise<Result<OrganizationFormData>> =>
    organizationQuery.getOrganizationById(id);

  const updateOrganization = async (id: string, data: OrganizationFormData): Promise<Result<void>> => {
    const result = await organizationQuery.updateOrganization(id, data);
    if (result.type === 'success') {
      fetchOrganizations(true);
    }
    return result;
  };

  const deleteOrganization = async (id: string): Promise<Result<void>> => {
    const result = await organizationQuery.deleteOrganization(id);
    if (result.type === 'success') {
      fetchOrganizations(true);
    }
    return result;
  };

  return {
    createOrganization,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
  };
};
