import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { productQuery } from '@services/product';
import { Changes, Goal, PreConfigEntitiesRelationship, Product } from '@customTypes/product';
import { addDays, format } from 'date-fns';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import { Characteristic, Measure, PreConfigRoot, Subcharacteristic } from '@customTypes/preConfig';
import { entityRelationshipTreeService } from '@services/entityRelationshipTree';
import { CREATE_RELEASE_STEP } from '../consts';
import mockedData from '../utils/mockedData.json'
import { mergeCharacteristicData } from '../utils/mergeCharacteristicData';

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
  // eslint-disable-next-line no-unused-vars
  handleChangeForm: (field: string, value: string | Changes[]) => void;
  // eslint-disable-next-line no-unused-vars
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
  resetStates: () => void
  lastGoal?: Goal | undefined;
}

export const CreateReleaseContext = createContext({} as CreateReleaseContextData);

const defaultEndDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
const defaulStartDate = format(new Date(), 'yyyy-MM-dd');

export function CreateReleaseProvider({
  children,
  productId,
  organizationId,
  currentProduct
}: CreateReleaseProviderProps) {
  const [alertMessage, setAlertMessage] = useState('');
  const [releaseInfoForm, setReleaseInfoForm] = useState<ReleaseInfoForm>({
    endDate: defaultEndDate,
    startDate: defaulStartDate,
    changes: [],
    characteristics: [],
    name: ''
  } as ReleaseInfoForm);
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
      setAlertMessage('successOnCreation');
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
      characteristics: configData.map((c: Characteristic) => c.key)
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
    const isSameReleaseGoal = lastGoal &&
      releaseInfoForm.startDate === (lastGoal!.start_at as string).slice(0, 10) &&
      releaseInfoForm.endDate === (lastGoal!.end_at as string).slice(0, 10) &&
      releaseInfoForm.name === lastGoal?.release_name

    if (isSameReleaseGoal) {
      setAlertMessage('sameReleaseGoal');
      return;
    }
    sendConfigJson().then(() => setAlertMessage('successOnCreation')).catch(() => setAlertMessage('errorOnCreation'))
    createProductReleaseGoal().catch(() => setAlertMessage('errorOnCreation'))
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
      startDate: defaulStartDate,
      changes: [],
      characteristics: [],
      name: ''
    } as ReleaseInfoForm)
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
    lastGoal
  };

  return <CreateReleaseContext.Provider value={value}>{children}</CreateReleaseContext.Provider>;
}

export function useCreateReleaseContext(): CreateReleaseContextData {
  return useContext(CreateReleaseContext);
}
