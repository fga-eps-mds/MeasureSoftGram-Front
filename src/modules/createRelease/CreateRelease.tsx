import React, { useEffect, useState } from 'react';
import { Alert, Container, Snackbar } from '@mui/material';

import DrawerMenu from '@components/DrawerMenu';
import { ButtonType, Product } from '@customTypes/product';
import ConfigPage from '@modules/preConfig/ConfigPage';
import ReleaseInfo from './components/ReleaseInfo';
import ReleaseGoals from './components/ReleaseGoals';

import { CreateReleaseProvider, useCreateReleaseContext } from './context/useCreateRelease';
import FirstReleaseWarning from './components/FirstReleaseWarning';
import ReleaseConfigSelector from './components/ReleaseConfigSelector/ReleaseConfigSelector';
import ThresholdConfig from './components/ThresholdConfig/ThresholdConfig';
import { CREATE_RELEASE_STEP } from './consts';

interface CreateReleaseProps {
  open: boolean;
  handleClose: () => void;
}

interface CreateReleaseContainerProps {
  productId: string;
  organizationId: string;
  currentProduct: Product;
  open: boolean;
  handleClose: () => void;
}

function CreateRelease({ open, handleClose }: CreateReleaseProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [configPage, setConfigPage] = useState(0);
  const [configPageTitle, setConfigPageTitle] = useState<string>('');
  const configPageTitles = [
    'Definir peso das características',
    'Definir peso das subcaracterísticas',
    'Definir peso das medidas'
  ];

  const {
    successOnCreation,
    closeAlert,
    goToNextStep,
    createProductReleaseGoal,
    organizationId,
    productId,
    releaseInfoForm,
    configPageData,
    getNextStep,
    getPreviousStep,
    isFirstRelease
  } = useCreateReleaseContext();

  const renderStep = () =>
  ({
    0: <ReleaseInfo />,
    1: isFirstRelease ? <FirstReleaseWarning /> : <ReleaseConfigSelector setActiveStep={setActiveStep} />,
    2: (
      <ConfigPage
        page={configPage}
        isOpen
        onClose={handleClose}
        organizationId={organizationId}
        filteredCharacteristics={releaseInfoForm?.characteristics}
        productId={productId}
        title={configPageTitle}
      />
    ),
    3: (
      <ThresholdConfig
        onChange={() => { }}
        data={configPageData.characteristicData}
        tabs={configPageData.subcharacterCheckbox}
        checkboxValues={configPageData.measureCheckbox}
        setCheckboxValues={configPageData.setMeasureCheckbox}
      />
    ),
    4: <ReleaseGoals />
  }[activeStep]);

  const handleCloseModal = () => {
    handleClose();
    closeAlert();
  };

  const handleGoToNextStep = () => {
    if (!goToNextStep()) return;

    const newActiveStep = getNextStep(activeStep, configPage);
    if (activeStep === newActiveStep && newActiveStep === CREATE_RELEASE_STEP.CharacteristicStep) {
      setConfigPage(configPage + 1);
    }
    setActiveStep(newActiveStep);
  };

  const handleBackButton = () => {
    if (activeStep === CREATE_RELEASE_STEP.ReleaseInfoStep) {
      handleCloseModal();
      return;
    }

    const newActiveStep = getPreviousStep(activeStep, configPage);
    if (activeStep === newActiveStep && newActiveStep === CREATE_RELEASE_STEP.CharacteristicStep) {
      setConfigPage(configPage - 1);
    }
    setActiveStep(newActiveStep);
  };

  useEffect(() => {
    setConfigPageTitle(configPageTitles[configPage]);
  }, [configPage]);

  const handleNextButton = () =>
    activeStep === CREATE_RELEASE_STEP.ReleaseGoalStep ? createProductReleaseGoal() : handleGoToNextStep();

  const BUTTONS: Array<ButtonType> = [
    {
      label: 'Voltar',
      onClick: handleBackButton,
      backgroundColor: '#FFF',
      color: '#113D4C',
      variant: 'outlined',
    },
    {
      label: activeStep === CREATE_RELEASE_STEP.ReleaseGoalStep ? 'Finalizar' : 'Continuar',
      onClick: handleNextButton,
      backgroundColor: '#113D4C',
      color: '#fff',
      variant: 'contained',
      disabled: activeStep === CREATE_RELEASE_STEP.ReleaseSelectorStep && !isFirstRelease
    }
  ];

  const ALERTS = {
    success: <Alert severity="success">Release criada com sucesso!</Alert>,
    error: <Alert severity="error">Ocorreu um erro durante a criação da release.</Alert>
  };
  const handleOnCloseAlert = () => {
    if (successOnCreation === 'success') {
      handleClose();
      setActiveStep(0);
    }

    setTimeout(closeAlert, 3000);
  };

  useEffect(() => {
    if (successOnCreation === 'success') handleOnCloseAlert();
  }, [successOnCreation]);

  return (
    <>
      <DrawerMenu open={open} buttons={BUTTONS}>
        <Container>{renderStep()}</Container>
      </DrawerMenu>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={!!successOnCreation}
        onClose={handleOnCloseAlert}
      >
        {ALERTS[successOnCreation as keyof typeof ALERTS]}
      </Snackbar>
    </>
  );
}

function CreateReleaseContainer({
  productId,
  organizationId,
  open,
  handleClose,
  currentProduct
}: CreateReleaseContainerProps) {
  return (
    <CreateReleaseProvider productId={productId} organizationId={organizationId} currentProduct={currentProduct}>
      <CreateRelease open={open} handleClose={handleClose} />
    </CreateReleaseProvider>
  );
}

export default CreateReleaseContainer;
