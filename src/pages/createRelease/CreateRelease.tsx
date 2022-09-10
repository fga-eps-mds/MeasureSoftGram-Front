import React, { useState } from 'react'
import { Alert, Container, Snackbar } from '@mui/material';

import DrawerMenu from '@components/DrawerMenu';
import { ButtonType } from '@customTypes/project';
import ReleaseInfo from './components/ReleaseInfo';
import ReleaseGoals from './components/ReleaseGoals';

import { CreateReleaseProvider, useCreateReleaseContext } from './context/useCreateRelease';

interface CreateReleaseProps {
  open: boolean;
  handleClose: () => void;
}

interface CreateReleaseContainerProps {
  projectId: number;
  organizationId: number;
  open: boolean;
  handleClose: () => void;
}

function CreateRelease({ open, handleClose }: CreateReleaseProps) {
  const [activeStep, setActiveStep] = useState(0);

  const {
    successOnCreation,
    closeAlert,
    goToGoalsStep,
    createProjectReleaseGoal,
  } = useCreateReleaseContext();

  const renderStep = () => ({
      0: <ReleaseInfo/>,
      1: <ReleaseGoals />
    }[activeStep])

  const handleCloseModal = () => {
    handleClose()
    closeAlert()
  }

  const handleGoToGoalsStep = () => goToGoalsStep() ? setActiveStep(1) : () => {}

  const handleBackButton = () => activeStep ? setActiveStep(0) : handleCloseModal();

  const handleNextButton = () => activeStep ? createProjectReleaseGoal() : handleGoToGoalsStep();

  const BUTTONS: Array<ButtonType> = [
    {
      label: 'Voltar',
      onClick: handleBackButton,
      backgroundColor: '#FFF',
      color: '#113D4C',
      variant: 'outlined'
    },
    {
      label: activeStep ? 'Finalizar' : 'Continuar',
      onClick: handleNextButton,
      backgroundColor: '#113D4C',
      color: '#fff',
      variant: 'outlined'
    }
  ];

  const ALERTS = {
    success: (
      <Alert severity="success">Release criada com sucesso!</Alert>
    ),
    error: (
      <Alert severity="error">Ocorreu um erro durante a criação da release.</Alert>
    )
  }
  const handleOnCloseAlert = () => {
    if (successOnCreation === 'success') {
      handleClose()
      setActiveStep(0)
    }

    closeAlert()
  }

  return (
    <>
      <DrawerMenu open={open} buttons={BUTTONS}>
        <Container>
          {renderStep()}
        </Container>
      </DrawerMenu>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={!!successOnCreation}
        autoHideDuration={3000}
        onClose={handleOnCloseAlert}
      >
        {ALERTS[successOnCreation as keyof typeof ALERTS]}
      </Snackbar>
    </>
  )
}

function CreateReleaseContainer({
  projectId,
  organizationId,
  open,
  handleClose
}: CreateReleaseContainerProps) {
  return (
    <CreateReleaseProvider
      projectId={projectId.toString()}
      organizationId={organizationId.toString()}
    >
      <CreateRelease
        open={open}
        handleClose={handleClose}
      />
    </CreateReleaseProvider>
  )
}

export default CreateReleaseContainer;
