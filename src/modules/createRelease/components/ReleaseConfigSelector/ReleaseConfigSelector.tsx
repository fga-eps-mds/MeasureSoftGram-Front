import React from 'react';
import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import { CREATE_RELEASE_STEP } from '@modules/createRelease/consts';
import * as Styles from './styles';
import { SelectorButton } from '../SelectorButton/SelectorButton';

interface ReleaseConfigSelectorProps {
  setActiveStep: (step: number) => void;
}

export default function ReleaseConfigSelector({ setActiveStep }: ReleaseConfigSelectorProps) {
  const { setUseLastConfig } = useCreateReleaseContext();

  const useLastConfig = () => {
    setActiveStep(CREATE_RELEASE_STEP.ReleaseGoalStep);
    setUseLastConfig(true);
  };

  return (
    <>
      <Styles.Header>
        <h1 style={{ color: '#33568E', fontWeight: '500' }}>Planejar Release</h1>
      </Styles.Header>
      <Styles.Body>
        <SelectorButton onClick={useLastConfig} label='Seguir última configuração' />
        <SelectorButton onClick={() => setActiveStep(CREATE_RELEASE_STEP.CharacteristicStep)} label='Alterar configuração' />
      </Styles.Body>
    </>
  );
}
