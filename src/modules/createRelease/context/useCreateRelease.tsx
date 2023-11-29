import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { productQuery } from '@services/product';
import { Changes, Goal, PreConfigEntitiesRelationship, Product } from '@customTypes/product';
import { addDays, format } from 'date-fns';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import { Characteristic, Measure, PreConfigRoot, Subcharacteristic } from '@customTypes/preConfig';
import { entityRelationshipTreeService } from '@services/entityRelationshipTree';
import { CREATE_RELEASE_STEP } from '../consts';
import mockedData from '../utils/mockedData.json';
import { mergeCharacteristicData } from '../utils/mergeCharacteristicData';
import ReleaseGoals from '../components/ReleaseGoals';

interface ReleaseGoal {
  id: number;
  release_name: string;
  start_at: string;
  end_at: string;
  changes: Changes[];
  allow_dynamic: boolean;
}

interface NewCreateGoalData {
  changes: Changes[];
  allow_dynamic: boolean;
}

export interface NewCreateReleaseData {
  goal: number;
  description?: string;
  release_name: string;
  start_at: string;
  end_at: string;
}

interface CreateReleaseProviderProps {
  children: ReactNode;
  productId: string;
  organizationId: string;
  currentProduct: Product;
}

interface ReleaseInfoForm {
  name: string;
  description: string;
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
  setCharacteristicValuesValid: (value: boolean) => void;
}

interface CreateReleaseContextData {
  releaseInfoForm: ReleaseInfoForm;
  alertMessage: string;
  productId: string;
  organizationId: string;
  currentProduct: Product;
  isFirstRelease: boolean;
  configPageData: ConfigPageData;
  handleChangeForm: (field: string, value: string | Changes[]) => void;
  finishReleasePlanning: () => void;
  goToNextStep: (activeStep: number) => boolean;
  closeAlert: () => void;
  setCurrentConfig: (data: Characteristic[]) => void;
  changeThreshold: boolean;
  toggleChangeThreshold: () => void;
  getNextStep: (activeStep: number, configPage: number) => number;
  getPreviousStep: (activeStep: number, configPage: number) => number;
  allowChangeConfig: boolean;
  toggleAllowChangeConfig: () => void;
  setUseLastConfig: (value: boolean) => void;
  resetStates: () => void;
  lastGoal?: Goal;
  setAllowDynamicBalance: (value: boolean) => void;
}

export const CreateReleaseContext = createContext({} as CreateReleaseContextData);

const defaultEndDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
const defaultStartDate = format(new Date(), 'yyyy-MM-dd');

export function CreateReleaseProvider({
  children,
  productId,
  organizationId,
  currentProduct
}: CreateReleaseProviderProps) {
  const [alertMessage, setAlertMessage] = useState('');
  const [releaseInfoForm, setReleaseInfoForm] = useState<ReleaseInfoForm>({
    endDate: defaultEndDate,
    startDate: defaultStartDate,
    changes: [],
    characteristics: [],
    name: '',
    description: ''
  });
  const [characteristicData, setCharacteristicData] = useState<Characteristic[]>([]);
  const [characteristicCheckbox, setCharacteristicCheckbox] = useState<string[]>([]);
  const [subcharacterCheckbox, setSubcharacterCheckbox] = useState<string[]>([]);
  const [measureCheckbox, setMeasureCheckbox] = useState<string[]>([]);
  const [changeThreshold, setChangeThreshold] = useState<boolean>(false);
  const [allowChangeConfig, setAllowChangeConfig] = useState<boolean>(false);
  const [useLastConfig, setUseLastConfig] = useState<boolean>(false);
  const [isFirstRelease, setIsFirstRelease] = useState<boolean>(false);
  const [characteristicValuesValid, setCharacteristicValuesValid] = useState<boolean>(false)
  const [entityRelationshipTree, setEntityRelationshipTree] = useState<PreConfigEntitiesRelationship[]>([]);
  const [lastGoal, setLastGoal] = useState<Goal | undefined>(undefined);
  const [allowDynamicBalance, setAllowDynamicBalance] = useState<boolean>(false)

  const router = useRouter();

  async function checkForFirstRelease() {
    try {
      const result = await productQuery.getCurrentGoal(organizationId, productId);
      if (!result.data) setIsFirstRelease(true);
      setLastGoal(result.data as unknown as Goal);
    } catch (error) {
      console.error(error);
    }
  }

  async function createProductReleaseGoal() {
    if (useLastConfig) {
      const dataRelease: NewCreateReleaseData = {
        goal: lastGoal!.id,
        release_name: releaseInfoForm.name,
        start_at: releaseInfoForm.startDate,
        end_at: releaseInfoForm.endDate,
        description: releaseInfoForm.description || '',
      };

      const response = await productQuery.createProductRelease(organizationId, productId, dataRelease);
      await mutate(
        JSON.stringify({ url: `organizations/${organizationId}/products/${productId}/create/release/`, method: 'get' })
      );
      const releaseId = response?.data?.id;
      if (releaseId) {
        await router.push(
          `/products/${organizationId}-${productId}-${currentProduct.name.toLowerCase()}/releases/${releaseId}`
        );
        setAlertMessage('successOnCreation');
      }
      return;
    }

    const dataGoal: NewCreateGoalData = {
      changes: releaseInfoForm.changes,
      allow_dynamic: allowDynamicBalance
    };

    try {
      const responseGoal = await productQuery.createProductGoal(organizationId, productId, dataGoal as unknown as ReleaseGoal);

      const dataRelease: NewCreateReleaseData = {
        goal: responseGoal.data.id,
        release_name: releaseInfoForm.name,
        start_at: releaseInfoForm.startDate,
        end_at: releaseInfoForm.endDate,
        description: releaseInfoForm.description || '',
      };

      const responseRelease = await productQuery.createProductRelease(organizationId, productId, dataRelease);
      await mutate(
        JSON.stringify({ url: `organizations/${organizationId}/products/${productId}/create/release/`, method: 'get' })
      );

      const releaseId = responseRelease?.data?.id;

      if (releaseId) {
        await router.push(
          `/products/${organizationId}-${productId}-${currentProduct.name.toLowerCase()}/releases/${releaseId}`
        );
        setAlertMessage('successOnCreation');
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleChangeForm(field: string, value: string | string[] | Changes[]) {
    setReleaseInfoForm((form) => ({
      ...form,
      [field]: value
    }));
  }

  function goToNextStep(currentStep: number) {
    if (currentStep === CREATE_RELEASE_STEP.ReleaseInfoStep) {
      const { name, startDate, endDate } = releaseInfoForm;
      if (!name) {
        setAlertMessage('fillName');
        return false
      }
      if (Date.parse(startDate) > Date.parse(endDate)) {
        setAlertMessage('invalidDate');
        return false
      }
    }
    if (currentStep === CREATE_RELEASE_STEP.CharacteristicStep && !characteristicValuesValid) {
      setAlertMessage('characteristicValuesInvalid')
      return false;
    }
    return true;
  }

  function closeAlert() {
    setAlertMessage('');
  }

  function setCurrentConfig(configData: Characteristic[]) {
    const newConfigData = mergeCharacteristicData(configData, entityRelationshipTree);
    if (configData.length !== characteristicData.length && configData.length) {
      setCharacteristicCheckbox(configData.filter((c => c.weight > 0)).map((c: Characteristic) => c.key))
      const subCharacteristics = configData.flatMap((c: Characteristic) => c.subcharacteristics)
      setSubcharacterCheckbox(subCharacteristics.filter((sc => sc.weight > 0)).map((sc: Subcharacteristic) => sc.key))
      const measures = subCharacteristics.flatMap((sc: Subcharacteristic) => sc.measures)
      setMeasureCheckbox(measures.filter((m => m.weight > 0)).map((m: Measure) => m.key))
    }
    setReleaseInfoForm((form) => ({
      ...form,
      characteristics: configData.filter((c: Characteristic) => c.weight > 0).map((c: Characteristic) => c.key)
    }))
    setCharacteristicData(newConfigData);
  }

  async function loadCurrentConfig() {
    try {
      if (currentProduct) {
        const result = (await productQuery.getProductCurrentPreConfig(
          organizationId,
          productId
        )).data as unknown as PreConfigRoot;
        setCurrentConfig(result?.data?.characteristics ?? mockedData.data.characteristics);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function toggleChangeThreshold() {
    setChangeThreshold(!changeThreshold);
  }

  function toggleAllowChangeConfig() {
    setAllowChangeConfig(!allowChangeConfig);
  }

  function getNextStep(activeStep: number, configPage: number) {
    if (activeStep === CREATE_RELEASE_STEP.CharacteristicStep && configPage === 2) {
      return changeThreshold ? CREATE_RELEASE_STEP.ThresholdStep : CREATE_RELEASE_STEP.ReleaseGoalStep;
    }
    if (activeStep === CREATE_RELEASE_STEP.CharacteristicStep) {
      return CREATE_RELEASE_STEP.CharacteristicStep;
    }
    return activeStep + 1;
  }

  function getPreviousStep(activeStep: number, configPage: number) {
    if (activeStep === CREATE_RELEASE_STEP.ReleaseGoalStep) {
      if (useLastConfig) {
        setUseLastConfig(false);
        return CREATE_RELEASE_STEP.ReleaseSelectorStep;
      }
      return changeThreshold ? CREATE_RELEASE_STEP.ThresholdStep : CREATE_RELEASE_STEP.CharacteristicStep;
    }
    if (activeStep === CREATE_RELEASE_STEP.CharacteristicStep && configPage !== 0) {
      return CREATE_RELEASE_STEP.CharacteristicStep;
    }
    return activeStep - 1;
  }

  async function sendConfigJson() {
    const responseCharacterFiltered = characteristicData?.filter((charcterValue) =>
      characteristicCheckbox.includes(charcterValue.key)
    );
    const responseSubcharacterFiltered = responseCharacterFiltered?.map((charcterValue) => ({
      ...charcterValue,
      subcharacteristics: charcterValue.subcharacteristics.filter((subcharcterValue) =>
        subcharacterCheckbox.includes(subcharcterValue.key)
      )
    }));
    const finalData = responseSubcharacterFiltered?.map((charcterValue) => ({
      ...charcterValue,
      subcharacteristics: charcterValue.subcharacteristics.map((subcharcterValue) => ({
        ...subcharcterValue,
        measures: subcharcterValue.measures.filter((measureValue) => measureCheckbox.includes(measureValue.key))
      }))
    })) as Characteristic[];

    await productQuery
      .postPreConfig(organizationId, productId, { name: currentProduct?.name ?? '', data: { characteristics: finalData } })
  };

  function finishReleasePlanning() {
    sendConfigJson().catch(() => setAlertMessage('errorOnCreation'));
    createProductReleaseGoal().catch(() => setAlertMessage('errorOnCreation'));
  }
  async function loadEntityRelationshipTree() {
    try {
      const entityRelationshipTreeResult = (await entityRelationshipTreeService.getEntityRelationshipTree())
        .data as unknown as PreConfigEntitiesRelationship[];
      setEntityRelationshipTree(entityRelationshipTreeResult);
    } catch (error) {
      console.error(error);
    }
  }

  function resetStates() {
    setReleaseInfoForm({
      endDate: defaultEndDate,
      startDate: defaultStartDate,
      changes: [],
      characteristics: [],
      name: '',
      description: ''
    } as ReleaseInfoForm);
    setAllowChangeConfig(false);
    setChangeThreshold(false);
    loadEntityRelationshipTree();
    loadCurrentConfig();
    checkForFirstRelease();
  }

  useEffect(() => {
    resetStates()
  }, [productId]);

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value = {
    releaseInfoForm,
    alertMessage,
    handleChangeForm,
    finishReleasePlanning,
    goToNextStep,
    closeAlert,
    productId,
    organizationId,
    currentProduct,
    isFirstRelease,
    setCurrentConfig,
    configPageData: {
      characteristicCheckbox,
      setCharacteristicCheckbox,
      subcharacterCheckbox,
      setSubcharacterCheckbox,
      characteristicData,
      setMeasureCheckbox,
      measureCheckbox,
      setCharacteristicValuesValid
    },
    changeThreshold,
    toggleChangeThreshold,
    getNextStep,
    getPreviousStep,
    allowChangeConfig,
    toggleAllowChangeConfig,
    setUseLastConfig,
    resetStates,
    lastGoal,
    setAllowDynamicBalance
  };

  return <CreateReleaseContext.Provider value={value}>{children}</CreateReleaseContext.Provider>;
}

export function useCreateReleaseContext(): CreateReleaseContextData {
  return useContext(CreateReleaseContext);
}
