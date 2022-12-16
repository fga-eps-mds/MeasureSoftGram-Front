import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { productQuery } from '@services/product';
import { Changes } from '@customTypes/product';
import { addDays, format } from 'date-fns';

interface CreateReleaseProviderProps {
  children: ReactNode;
  productId: string;
  organizationId: string;
}

interface ReleaseInfoForm {
  name: string;
  startDate: string;
  endDate: string;
  characteristics: string[];
  changes: Changes[];
}

interface CreateReleaseContextData {
  releaseInfoForm: ReleaseInfoForm;
  successOnCreation: string;
  preConfigCharacteristics: string[] | undefined;
  // eslint-disable-next-line no-unused-vars
  handleChangeForm: (field: string, value: string | Changes[]) => void;
  // eslint-disable-next-line no-unused-vars
  handleSelectCharacteristics: (characteristic: string) => void;
  createProductReleaseGoal: () => void;
  goToGoalsStep: () => boolean;
  closeAlert: () => void;
}

const CreateReleaseContext = createContext({} as CreateReleaseContextData);

const defaultEndDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
const defaulStartDate = format(new Date(), 'yyyy-MM-dd');

export function CreateReleaseProvider({ children, productId, organizationId }: CreateReleaseProviderProps) {
  const [preConfigCharacteristics, setPreConfigCharacteristics] = useState<string[]>();
  const [successOnCreation, setSuccessOnCreation] = useState('');
  const [releaseInfoForm, setReleaseInfoForm] = useState<ReleaseInfoForm>({
    endDate: defaultEndDate,
    startDate: defaulStartDate
  } as ReleaseInfoForm);

  async function loadCurrentPreConfig() {
    try {
      const result = await productQuery.getPreConfigEntitiesRelationship(organizationId, productId);
      setPreConfigCharacteristics(result.data.map((item) => item.key));
    } catch (error) {
      console.error(error);
    }
  }

  async function createProductReleaseGoal() {
    try {
      const data = {
        release_name: releaseInfoForm.name,
        start_at: releaseInfoForm.startDate,
        end_at: releaseInfoForm.endDate,
        changes: releaseInfoForm.changes
      };

      await productQuery.createProductReleaseGoal(organizationId, productId, data);

      setSuccessOnCreation('success');
    } catch (error) {
      setSuccessOnCreation('error');
      console.error(error);
    }
  }

  function handleChangeForm(field: string, value: string | string[] | Changes[]) {
    setReleaseInfoForm((form) => ({
      ...form,
      [field]: value
    }));
  }

  function handleSelectCharacteristics(characteristic: string) {
    const selectedCharacteristics = [...(releaseInfoForm.characteristics || [])];

    if (!selectedCharacteristics.includes(characteristic)) {
      selectedCharacteristics.push(characteristic);
    } else {
      selectedCharacteristics.splice(selectedCharacteristics.indexOf(characteristic), 1);
    }

    handleChangeForm('characteristics', selectedCharacteristics);
  }

  function goToGoalsStep() {
    const { characteristics, name } = releaseInfoForm;
    return !!characteristics?.length && !!name;
  }

  function closeAlert() {
    setSuccessOnCreation('');
    setReleaseInfoForm({
      endDate: defaultEndDate,
      startDate: defaulStartDate,
      name: '',
      characteristics: [],
      changes: []
    });
  }

  useEffect(() => {
    loadCurrentPreConfig();
  }, [productId]);

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value = {
    releaseInfoForm,
    successOnCreation,
    preConfigCharacteristics,
    handleChangeForm,
    handleSelectCharacteristics,
    createProductReleaseGoal,
    goToGoalsStep,
    closeAlert
  };

  return <CreateReleaseContext.Provider value={value}>{children}</CreateReleaseContext.Provider>;
}

export function useCreateReleaseContext(): CreateReleaseContextData {
  return useContext(CreateReleaseContext);
}
