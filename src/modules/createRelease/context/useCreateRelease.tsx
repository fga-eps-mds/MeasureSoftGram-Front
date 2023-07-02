import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { productQuery } from '@services/product';
import { Changes, Product } from '@customTypes/product';
import { addDays, format } from 'date-fns';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import { Characteristic } from '@customTypes/preConfig';

interface CreateReleaseProviderProps {
  children: ReactNode;
  productId: string;
  organizationId: string;
  currentProduct: Product;
}

interface ReleaseInfoForm {
  name: string;
  startDate: string;
  endDate: string;
  characteristics: string[];
  changes: Changes[];
}

interface ConfigPageData {
  characteristicCheckbox: string[];
  setCharacteristicCheckbox: (characteristicCheckbox: string[]) => void;
  subcharacterCheckbox: string[];
  setSubcharacterCheckbox: (subcharacterCheckbox: string[]) => void;
  measureCheckbox: string[];
  setMeasureCheckbox: (measureCheckbox: string[]) => void;
  characteristicData: Characteristic[];
}

interface CreateReleaseContextData {
  releaseInfoForm: ReleaseInfoForm;
  successOnCreation: string;
  preConfigCharacteristics: string[] | undefined;
  productId: string;
  organizationId: string;
  configPageData: ConfigPageData;
  // eslint-disable-next-line no-unused-vars
  handleChangeForm: (field: string, value: string | Changes[]) => void;
  // eslint-disable-next-line no-unused-vars
  handleSelectCharacteristics: (characteristic: string) => void;
  createProductReleaseGoal: () => void;
  goToNextStep: () => boolean;
  closeAlert: () => void;
  setCurrentConfig: (data: Characteristic[]) => void;
}

const CreateReleaseContext = createContext({} as CreateReleaseContextData);

const defaultEndDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
const defaulStartDate = format(new Date(), 'yyyy-MM-dd');

export function CreateReleaseProvider({
  children,
  productId,
  organizationId,
  currentProduct
}: CreateReleaseProviderProps) {
  const [preConfigCharacteristics, setPreConfigCharacteristics] = useState<string[]>();
  const [successOnCreation, setSuccessOnCreation] = useState('');
  const [releaseInfoForm, setReleaseInfoForm] = useState<ReleaseInfoForm>({
    endDate: defaultEndDate,
    startDate: defaulStartDate
  } as ReleaseInfoForm);
  const [characteristicData, setCharacteristicData] = useState<Characteristic[]>([]);
  const [characteristicCheckbox, setCharacteristicCheckbox] = useState<string[]>([]);
  const [subcharacterCheckbox, setSubcharacterCheckbox] = useState<string[]>([]);
  const [measureCheckbox, setMeasureCheckbox] = useState<string[]>([]);

  const router = useRouter();

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

      const response = await productQuery.createProductReleaseGoal(organizationId, productId, data);
      await mutate(
        JSON.stringify({ url: `organizations/${organizationId}/products/${productId}/release/`, method: 'get' })
      );
      const releaseId = response?.data?.id;

      if (releaseId) {
        await router.push(
          `/products/${organizationId}-${productId}-${currentProduct.name.toLowerCase()}/releases/${releaseId}`
        );
        setSuccessOnCreation('success');
      }
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

  function goToNextStep() {
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

  function setCurrentConfig(configData: Characteristic[]) {
    setCharacteristicData(configData);
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
    goToNextStep,
    closeAlert,
    productId,
    organizationId,
    setCurrentConfig,
    configPageData: {
      characteristicCheckbox,
      setCharacteristicCheckbox,
      subcharacterCheckbox,
      setSubcharacterCheckbox,
      characteristicData,
      setMeasureCheckbox,
      measureCheckbox
    }
  };

  return <CreateReleaseContext.Provider value={value}>{children}</CreateReleaseContext.Provider>;
}

export function useCreateReleaseContext(): CreateReleaseContextData {
  return useContext(CreateReleaseContext);
}
