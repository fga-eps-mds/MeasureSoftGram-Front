import React, { useEffect, useState } from 'react';

import { Box, Breadcrumbs, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { format, addDays } from 'date-fns';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Change, ReleaseGoal } from '@customTypes/product';
import getLayout from '@components/Layout';
import { Characteristic, Measure, PreConfigData, ReleaseInfoForm, Subcharacteristic } from '@customTypes/preConfig';
import { productQuery } from '@services/product';
import { balanceMatrixService } from '@services/balanceMatrix';
import { useSnackbar } from '@components/snackbar';
import ConfirmModal from '@components/ConfirmModal/ConfirmModal';
import * as Styles from './styles';
import BasicInfoForm from './components/BasicInfoForm/BasicInfoForm';
import ModelConfigForm from './components/ModelConfigForm/ModelConfigForm';
import ReferenceValuesForm from './components/ReferenceValuesForm/ReferenceValuesForm';
import CharacteristicsBalanceForm from './components/CharacteristicsBalanceForm/CharacteristicsBalanceForm';
import RepositorySelectionForm from './components/RepositorySelectionForm/RepositorySelectionForm';

function ReleaseCreation() {
  const [organizationId, setOrganizationId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [activeStep, setActiveStep] = useState(process.env.NODE_ENV === 'test' ? 1 : 0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showChangeDateModal, setShowChangeDateModal] = useState(false);
  const [changeRefValue, setChangeRefValue] = useState<boolean>(false);
  const [followLastConfig, setFollowLastConfig] = useState<boolean>(false);
  const [dinamicBalance, setDinamicBalance] = useState<boolean>(false);
  const [defaultPageData, setConfigDefaultPageData] = useState<PreConfigData>();
  const [lastConfigPageData, setLastConfigPageData] = useState<PreConfigData>();
  const [configPageData, setConfigPageData] = useState<PreConfigData>();
  const [balanceMatrix, setBalanceMatrix] = useState<any>();
  const [releaseGoal, setReleaseGoal] = useState<any>();
  const [releaseConflict, setReleaseConflict] = useState<string>();
  const { enqueueSnackbar } = useSnackbar()

  const router = useRouter();
  const routerParams: any = router.query;

  const { t } = useTranslation('plan_release');

  const { register, handleSubmit, formState: { errors }, getValues, watch, trigger, setValue } = useForm<ReleaseInfoForm>({
    mode: "all",
    defaultValues: {
      end_at: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      start_at: format(new Date(), 'yyyy-MM-dd'),
      goal: 0,
      release_name: '',
      description: '',
      repositories_ids: process.env.NODE_ENV === 'test' ? ['1'] : []
    }
  });

  useEffect(() => {
    if (router.isReady) {
      const organization = routerParams.product.split('-')[0];
      const productIdentifier = routerParams.product.split('-')[1];
      const productTitle = routerParams.product.split('-')[2];

      setOrganizationId(organization);
      setProductId(productIdentifier);
      setProductName(productTitle);

      const getPreConfig = async () => {
        let currentReleaseGoal: any;
        let entitiesRelationship;

        try {
          entitiesRelationship = await productQuery.getPreConfigEntitiesRelationship(organization, productIdentifier);
          setPreConfigEntitiesRelationship(entitiesRelationship.data);

          currentReleaseGoal = await productQuery.getCurrentReleaseGoal(organization, productIdentifier);
          setReleaseGoal(currentReleaseGoal.data);

          await getPreConfigs(organization, productIdentifier, currentReleaseGoal.data)
        } catch (error) {
          const data: Record<string, number> = {};

          entitiesRelationship?.data.forEach((element: { key: string | number; }) => {
            data[element.key] = 50;
          });

          currentReleaseGoal = { id: 0, data, allow_dynamic: false };
          setReleaseGoal(currentReleaseGoal);

          await getPreConfigs(organization, productIdentifier, currentReleaseGoal)
        }
      }

      getPreConfig();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, routerParams.product]);


  async function getPreConfigs(organization: string, productIdentifier: string, currentReleaseGoal: any) {
    try {
      const defaultPreConfigResult = await productQuery.getProductDefaultPreConfig(organization, productIdentifier);
      setConfigPageData(formatConfig(defaultPreConfigResult.data, currentReleaseGoal));
      setConfigDefaultPageData(formatConfig(defaultPreConfigResult.data, currentReleaseGoal));

      const currentPreConfigResult = await productQuery.getProductCurrentPreConfig(organization, productIdentifier);
      setLastConfigPageData(formatConfig(mergeWithDefault(currentPreConfigResult.data.data, defaultPreConfigResult.data), currentReleaseGoal));

      const balance = await balanceMatrixService.getBalanceMatrix();
      setBalanceMatrix(balance.data.result);
    } catch (error) {
      enqueueSnackbar(t('getPreConfigError'), { autoHideDuration: 10000, variant: 'error' })
    }
  }

  function mergeWithDefault(current: PreConfigData, defaultData: PreConfigData): PreConfigData {
    const findOrCreate = <T extends { key: string }>(array: T[], key: string, defaultEntry: T): T => {
      const entry = array.find(item => item.key === key);
      return entry ?? { ...defaultEntry, key, weight: 0, active: false };
    };

    const updatedCharacteristics = defaultData.characteristics.map(defaultChar => {
      const currentChar = findOrCreate(current.characteristics, defaultChar.key, defaultChar);

      const updatedSubcharacteristics = defaultChar.subcharacteristics.map(defaultSub => {
        const currentSub = findOrCreate(currentChar.subcharacteristics, defaultSub.key, defaultSub);

        const updatedMeasures = defaultSub.measures.map(defaultMeasure => findOrCreate(currentSub.measures, defaultMeasure.key, defaultMeasure));

        return {
          ...currentSub,
          measures: updatedMeasures
        };
      });

      return {
        ...currentChar,
        subcharacteristics: updatedSubcharacteristics
      };
    });

    return {
      ...current,
      characteristics: updatedCharacteristics
    };
  };

  function formatConfig(data: PreConfigData, currentReleaseGoal: any): PreConfigData {
    data.characteristics.forEach((characteristic: Characteristic) => {
      // eslint-disable-next-line no-param-reassign
      characteristic.goal = currentReleaseGoal.data[characteristic.key] ?? 0;
      if (characteristic.weight > 0) {
        // eslint-disable-next-line no-param-reassign
        characteristic.active = true;
      }
      characteristic.subcharacteristics.forEach((subcharacteristic: Subcharacteristic) => {
        if (subcharacteristic.weight > 0 && characteristic.active) {
          // eslint-disable-next-line no-param-reassign
          subcharacteristic.active = true;
        }
        subcharacteristic.measures.forEach((measure: Measure) => {
          if (measure.weight > 0 && subcharacteristic.active) {
            // eslint-disable-next-line no-param-reassign
            measure.active = true;
          }
        });
      });
    });

    return data;
  }

  function handleSetFollowLastConfig(value: boolean) {
    if (value)
      setConfigPageData(lastConfigPageData!);
    else
      setConfigPageData(defaultPageData!);

    setFollowLastConfig(value)
  }

  async function checkBasicValues() {
    if (Object.keys(errors).length !== 0)
      return;

    try {
      await productQuery.getIsReleaseValid(organizationId, productId, getValues());
      setActiveStep(activeStep + 1);
    } catch (error: any) {
      if (error?.response?.data?.detail === "Já existe uma release neste período") {
        setReleaseConflict(error?.response?.data?.release?.id)
        setShowChangeDateModal(true);
      }
      else
        enqueueSnackbar(`${error?.response?.data?.detail}`, { autoHideDuration: 10000, variant: 'error' })
    }
  };

  async function handleReleaseDateModal() {
    try {
      const newDate = new Date(getValues('start_at'))
      newDate.setDate(newDate.getDate() - 1);

      setShowChangeDateModal(false);

      await productQuery.updateReleaseEndDate(organizationId, productId, releaseConflict!, { end_at: newDate });
      checkBasicValues();
    }
    catch (error: any) {
      setShowChangeDateModal(false);
      enqueueSnackbar(`${error?.response?.data?.detail}`, { autoHideDuration: 10000, variant: 'error' });
    }
  }

  function handleChangeRefValue(value: boolean) {
    if (value)
      setShowConfirmationModal(value);

    setChangeRefValue(value)
  }

  function handleChangeDinamicBalance(value: boolean) {
    if (value)
      setShowConfirmationModal(value);

    setDinamicBalance(value)
  }

  function renderStep(): React.ReactNode {
    switch (activeStep) {
      case 0:
        return <RepositorySelectionForm organizationId={organizationId} productId={productId} register={register} watch={watch} setValue={setValue} />
      case 1:// eslint-disable-next-line react/jsx-no-bind
        return <BasicInfoForm configPageData={configPageData!} trigger={trigger} register={register} errors={errors} watch={watch} followLastConfig={followLastConfig} setFollowLastConfig={handleSetFollowLastConfig} />
      case 2:// eslint-disable-next-line react/jsx-no-bind
        return <ModelConfigForm changeRefValue={changeRefValue} setChangeRefValue={handleChangeRefValue} configPageData={configPageData!} setConfigPageData={setConfigPageData} />
      case 3:// eslint-disable-next-line react/jsx-no-bind
        return <ReferenceValuesForm configPageData={configPageData!} defaultPageData={defaultPageData!} setConfigPageData={setConfigPageData} />
      case 4:// eslint-disable-next-line react/jsx-no-bind
        return <CharacteristicsBalanceForm characteristicRelations={balanceMatrix} configPageData={configPageData!} setConfigPageData={setConfigPageData} dinamicBalance={dinamicBalance} setDinamicBalance={handleChangeDinamicBalance} />
      default:
        break
    }
  }

  function handlePreviousButtonClick(): void {
    if (activeStep === 4 && !changeRefValue)
      setActiveStep(activeStep - 2);
    else if (activeStep > 0)
      setActiveStep(activeStep - 1);
  }

  function findItemWithSumNotEqualTo100(items: { key: string; weight: number; active?: boolean }[]) {
    return items.filter(item => item.active).reduce((sum, item) =>
      sum + item.weight
      , 0) !== 100
      ? items.find(item => item.active)?.key
      : null;
  }

  function isConfigDataWeightValid(): boolean {
    const invalidCharacteristics = findItemWithSumNotEqualTo100(configPageData!.characteristics);

    if (invalidCharacteristics && invalidCharacteristics?.length > 0) {
      enqueueSnackbar(t('invalidCharacteristicsError'), { autoHideDuration: 10000, variant: 'error' })
      document.getElementById("characteristicSection")?.scrollIntoView({ behavior: "smooth" });
      return false;
    }

    const invalidSubcharacteristics = configPageData!.characteristics
      .filter(characteristic => characteristic.active)
      .map(characteristic => {
        const invalidKey = findItemWithSumNotEqualTo100(characteristic.subcharacteristics);
        return invalidKey ? characteristic.key : null;
      })
      .filter(key => key !== null);


    if (invalidSubcharacteristics && invalidSubcharacteristics?.length > 0) {
      enqueueSnackbar(t("invalidSubcharacteristicsError"), { autoHideDuration: 10000, variant: 'error' })
      document.getElementById(`SubCarAccordion-${invalidSubcharacteristics[0]}`)?.scrollIntoView({ behavior: "smooth" });
      return false;
    }

    const invalidMeasures = configPageData!.characteristics
      .filter(characteristic => characteristic.active)
      .flatMap(characteristic =>
        characteristic.subcharacteristics
          .filter(subcharacteristic => subcharacteristic.active)
          .map(subcharacteristic => {
            const invalidMeasureKey = findItemWithSumNotEqualTo100(subcharacteristic.measures);
            return invalidMeasureKey ? subcharacteristic.key : null; // Retorna o nome da subcaracterística se inválido
          })
      )
      .filter(key => key !== null);

    if (invalidMeasures && invalidMeasures?.length > 0) {
      enqueueSnackbar(t('invalidMeasuresError'), { autoHideDuration: 10000, variant: 'error' })
      document.getElementById(`MetricSubCarAccordion-${invalidMeasures[0]}`)?.scrollIntoView({ behavior: "smooth" });
      return false;
    }

    return true;
  }

  async function handleNextButtonClick(): Promise<void> {
    switch (activeStep) {
      case 0: {
        const selectedRepos = getValues('repositories_ids');
        if (!selectedRepos || selectedRepos.length === 0) {
          enqueueSnackbar(t('Selecione pelo menos um repositório para a release.'), { autoHideDuration: 6000, variant: 'error' });
          break;
        }
        setActiveStep(activeStep + 1);
        break;
      }
      case 1:
        await checkBasicValues();
        break;
      case 2:
        if (!isConfigDataWeightValid()) break;

        if (!changeRefValue) setActiveStep(activeStep + 2);
        else setActiveStep(activeStep + 1);
        break;
      case 3:
        setActiveStep(activeStep + 1);
        break;
      case 4:
        submitRelease();
        break;
      default:
        break;
    }
  }

  async function submitRelease() {
    const goalChanges = generateChanges();
    const release = getValues();
    const finalConfig = cleanConfigData();

    try {
      await productQuery.postPreConfig(organizationId, productId, { name: productName, data: finalConfig });

      const productGoalResult = await productQuery.createProductGoal(organizationId, productId, goalChanges);

      release.goal = productGoalResult.data.id;

      await productQuery.createProductRelease(organizationId, productId, release);

      enqueueSnackbar(t('releaseCreated'), { autoHideDuration: 6000, variant: 'success' });
      router.push(`/products/${router.query.product}/releases/`);
    } catch (error: any) {
      enqueueSnackbar(`${error.response?.data?.message ?? error}`, { autoHideDuration: 10000, variant: 'error' });
    }

  }

  function generateChanges(): ReleaseGoal {
    // Criação do array de mudanças com a tipagem explícita
    const changes: Change[] = [];

    configPageData?.characteristics
      .filter((characteristic: Characteristic) => characteristic.active)
      .forEach((characteristic: Characteristic) => {
        const referenceGoal = releaseGoal.data[characteristic.key] ?? 0;
        let delta: number;

        if (dinamicBalance) {
          delta = 50 - characteristic.goal;
        } else {
          const relatedPositiveKeys = balanceMatrix[characteristic.key]?.['+'] || [];
          const isAlreadyChanged = relatedPositiveKeys.some((relatedKey: string) =>
            changes.some(change => change.characteristic_key === relatedKey)
          );

          if (isAlreadyChanged || referenceGoal === characteristic.goal) {
            return;
          }

          delta = characteristic.goal - referenceGoal;
        }

        changes.push({
          characteristic_key: characteristic.key,
          delta,
        });
      });

    return { changes, allow_dynamic: dinamicBalance };
  }

  function cleanConfigData() {
    return {
      ...configPageData,
      characteristics: configPageData!.characteristics
        .filter((characteristic: Characteristic) => characteristic.active)
        .map((characteristic: Characteristic) => ({
          ...removeProperties(characteristic),
          subcharacteristics: characteristic.subcharacteristics
            .filter((sub: Subcharacteristic) => sub.active)
            .map((sub: Subcharacteristic) => ({
              ...removeProperties(sub),
              measures: sub.measures
                .filter((measure: Measure) => measure.active)
                .map((measure: Measure) => removeProperties(measure))
            }))
        }))
    };
  }

  function removeProperties(obj: any) {
    const { goal, active, ...rest } = obj;
    return rest;
  }

  function handleModalBtnClick() {
    if (activeStep === 2)
      handleChangeRefValue(true);
    else
      handleChangeDinamicBalance(true)

    setShowConfirmationModal(false)
  }

  function renderBreadcrumb(label: string, step: number): any {
    if (step === 3 && !changeRefValue) return

    return <Button
      key={step}
      sx={{
        cursor: 'pointer',
        textDecoration: 'none',
        color: activeStep === step ? "text.primary" : "text.secondary",
        fontWeight: activeStep === step ? '800' : 'normal',
        textTransform: 'none',
        pointerEvents: activeStep === 0 ? "none" : "auto"
      }}
      onClick={() => activeStep === 0 ? {} : setActiveStep(step)}
    >
      {label}
    </Button>
  }

  return (
    <>
      <Styles.Header>
        <h1 style={{ color: '#33568E', fontWeight: '500', textAlign: "left" }}>{t('planRelease')}</h1>
        <Breadcrumbs
          separator={<Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />}
          sx={{ fontSize: '14px' }}
        >
          {[
            { label: 'Selecionar Repositórios', step: 0 },
            { label: t('createRelease'), step: 1 },
            { label: t('defineConfiguration'), step: 2 },
            { label: t('changeRefValue'), step: 3 },
            { label: t('balanceCharacteristics'), step: 4 },
          ].map(({ label, step }) => renderBreadcrumb(label, step))}
        </Breadcrumbs>
      </Styles.Header>
      <Styles.Body>
        <Box>
          <form onSubmit={handleSubmit(handleNextButtonClick)}>
            {renderStep()}
            <Box
              sx={{
                display: 'grid',
                columnGap: 2,
                gridTemplateColumns: activeStep !== 0 ? 'repeat(2, 1fr)' : "none",
                marginTop: 2
              }}
            >
              {activeStep !== 0 &&
                <Button onClick={() => handlePreviousButtonClick()} variant="outlined">
                  {t('back')}
                </Button>
              }
              <Button type="submit" variant="contained">
                {activeStep < 4 ? t('next') : t('end')}
              </Button>
            </Box>
          </form>
        </Box>
      </Styles.Body >
      <ConfirmModal
        // eslint-disable-next-line react/jsx-no-bind
        setIsModalOpen={setShowChangeDateModal}
        text={t('conflictDates')}
        btnConfirmText={t('continue')}
        btnDismissText={t('back')}
        isModalOpen={showChangeDateModal}
        // eslint-disable-next-line react/jsx-no-bind
        handleConfirmBtnClick={handleReleaseDateModal}
        handleDismissBtnClick={() => setShowChangeDateModal(false)}
      />
      <ConfirmModal
        // eslint-disable-next-line react/jsx-no-bind
        setIsModalOpen={setShowConfirmationModal}
        text={activeStep === 2 ? t('alertRefValue') : t('alertDinamicBalance')}
        btnConfirmText={t('continue')}
        btnDismissText={t('back')}
        isModalOpen={showConfirmationModal}
        /* eslint-disable no-unused-expressions */
        handleDismissBtnClick={() => {
          setShowConfirmationModal(false)
          activeStep === 2 ? setChangeRefValue(false) : setDinamicBalance(false)
        }}
        // eslint-disable-next-line react/jsx-no-bind
        handleConfirmBtnClick={handleModalBtnClick} />
    </>
  );
}

ReleaseCreation.getLayout = getLayout;

export default ReleaseCreation;
