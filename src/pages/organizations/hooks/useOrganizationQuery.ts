import { useEffect } from 'react';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { toast } from 'react-toastify';
import { organizationQuery, OrganizationFormData, Result } from '@services/organization';

export const useOrganizationQuery = () => {
  const { currentOrganization, setCurrentOrganization } = useOrganizationContext();

  const loadCurrentOrganization = async () => {
    try {
      const response = await organizationQuery.getAllOrganization();
      setCurrentOrganization(response.data);
    } catch (error) {
      toast.error(`Erro ao carregar organização: ${error}`);
    }
  };

  const createOrganization = async (data: OrganizationFormData): Promise<Result<OrganizationFormData>> => {
    return organizationQuery.createOrganization(data);
  };

  const getOrganizationById = async (id: string): Promise<Result<OrganizationFormData>> => {
    return organizationQuery.getOrganizationById(id);
  };

  const updateOrganization = async (id: string, data: OrganizationFormData): Promise<Result<void>> => {
    return organizationQuery.updateOrganization(id, data);
  };

  const deleteOrganization = async (id: string): Promise<Result<void>> => {
    return organizationQuery.deleteOrganization(id);
  };

  useEffect(() => {
    if (!currentOrganization) {
      loadCurrentOrganization();
    }
  }, []);

  return {
    createOrganization,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
  };
};
