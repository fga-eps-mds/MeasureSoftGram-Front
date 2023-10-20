import { useEffect } from 'react';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { toast } from 'react-toastify';
import { organizationQuery, OrganizationFormData, Result } from '@services/organization';
import { Organization } from '@customTypes/organization';

interface CurrentOrganizationType extends Organization {
  id: string;
}

export const useOrganizationQuery = () => {
  const { currentOrganizations, setCurrentOrganizations } = useOrganizationContext();

  const loadCurrentOrganizations = async () => {
    console.log("loadCurrentOrganizations foi chamada");
    try {
      const response = await organizationQuery.getAllOrganization();
      console.log("Dados da organização: ", response);

      if (response.type === 'success') {
        console.log('Response Value:', response.value);

        if (response.value && response.value.results && Array.isArray(response.value.results)) {
          const organizations = response.value.results.map(item => ({
            ...item,
            id: 'fake-id'  // ou item.id se a resposta contém um ID
          })) as CurrentOrganizationType[];

          setCurrentOrganizations(organizations);
          console.log('Organizações carregadas:', organizations);
        } else {
          console.error('Response Value results is not an array or is missing:', response.value);
        }
      } else {
        console.error("Erro ao recuperar os dados da organização: ", response.error);
      }
    } catch (error) {
      console.error("Erro detalhado:", error);
      toast.error(`Erro ao carregar organizações: ${error}`);
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
    if (!currentOrganizations || currentOrganizations.length === 0) {
      loadCurrentOrganizations();
    }
  }, [currentOrganizations]);

  return {
    createOrganization,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
  };
};
