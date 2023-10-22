import { useEffect } from 'react';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { toast } from 'react-toastify';
import { organizationQuery, OrganizationFormData, Result } from '@services/organization';
import { Organization } from '@customTypes/organization';
import api from '@services/api';

interface CurrentOrganizationType extends Organization {
  id: string;
}

interface OrganizationWithId extends OrganizationFormData {
  id?: string;
}

export const useOrganizationQuery = () => {
  const { currentOrganizations, setCurrentOrganizations } = useOrganizationContext();

const loadCurrentOrganizations = async () => {
    console.log("loadCurrentOrganizations foi chamada");
    try {
        // Aqui você pode chamar a API diretamente com Axios ou outra biblioteca HTTP, usando o requestConfig
        const responseConfig = await organizationQuery.getAllOrganization();
        console.log("Configuração da requisição: ", responseConfig);

        // Chame a API com o requestConfig obtido
        const response = await api.request(responseConfig);
        console.log('Dados da organização: ', response.data);

        // Continua como antes
        const organizations = response.data.results.map((item: OrganizationWithId) => ({
            ...item,
            id: item.id || 'fake-id'
        })) as CurrentOrganizationType[];

        setCurrentOrganizations(organizations);
        console.log('Organizações carregadas:', organizations);

    } catch (error: any) {
        console.error("Erro detalhado:", error);
        toast.error(`Erro ao carregar organizações: ${error.message || 'Erro desconhecido'}`);
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
