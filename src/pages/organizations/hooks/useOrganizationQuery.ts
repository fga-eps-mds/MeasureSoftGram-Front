import { useEffect, useState } from 'react';
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
      const responseConfig = await organizationQuery.getAllOrganization();
      console.log("Configuração da requisição: ", responseConfig);

      const response = await api.request(responseConfig);
      console.log('Dados da organização: ', response.data);

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

  const [update, setUpdate] = useState<number>(0);

  const createOrganization = async (data: OrganizationFormData): Promise<Result<OrganizationFormData>> => {
    const result = await organizationQuery.createOrganization(data);
    if (result.type === 'success') {
      setUpdate((prev: number) => prev + 1);  // Adicione o tipo aqui
    }
    return result;
  };

  const getOrganizationById = async (id: string): Promise<Result<OrganizationFormData>> =>
  organizationQuery.getOrganizationById(id);

  const updateOrganization = async (id: string, data: OrganizationFormData): Promise<Result<void>> =>
  organizationQuery.updateOrganization(id, data);

const deleteOrganization = async (id: string): Promise<Result<void>> => {
    const result = await organizationQuery.deleteOrganization(id);
    if (result.type === 'success') {
        setUpdate((prev: number) => prev + 1);
    }
    return result;
};


  useEffect(() => {
    if (!currentOrganizations || currentOrganizations.length === 0 || update > 0) {
      loadCurrentOrganizations();
      if (update > 0) setUpdate(0);
    }
  }, [currentOrganizations, update]);

  return {
    createOrganization,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
  };
};
