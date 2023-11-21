import React from 'react';
import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import { CREATE_RELEASE_STEP } from '@modules/createRelease/consts';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import TuneIcon from '@mui/icons-material/Tune';
import * as Styles from './styles';
import SelectorButton from '../SelectorButton';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';

interface ReleaseConfigSelectorProps {
  setActiveStep: (step: number) => void;
}

export default function ReleaseConfigSelector({ setActiveStep }: ReleaseConfigSelectorProps) {
  const { setUseLastConfig } = useCreateReleaseContext();

  const useLastConfig = () => {
    setActiveStep(CREATE_RELEASE_STEP.ReleaseGoalStep);
    setUseLastConfig(true);
  };

  const { enqueueSnackbar } = useSnackbar()

  const handleErrorSnack = () => {

    enqueueSnackbar("Você não pode ir para o balanceamento de características, antes de finalizar a definição da Configuração.", {
      variant: 'error'
    })

  }

  return (
    <>
      <Styles.Header>
        <h1 style={{ color: '#33568E', fontWeight: '500' }}>Planejamento de Release</h1>
        <h2 style={{ color: '#33568E', fontWeight: '300' }}>Definição de Configuração</h2>
        <Breadcrumbs separator={<Box
          component="span"
          sx={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: 'text.disabled',
          }}
        />} sx={{ fontSize: '14px' }}>


          <Link sx={{
            cursor: 'pointer',
            textDecoration: 'none',
          }} onClick={() => {
            setActiveStep(0);
          }} color="text.secondary">Criar Release</Link>

          <Link sx={{
            cursor: 'pointer',
            textDecoration: 'none',
          }} onClick={() => {
            setActiveStep(1);
          }} color="text.primary">Definir configuração do modelo</Link>

          <Link sx={{
            cursor: 'pointer',
            textDecoration: 'none',
          }} onClick={() => {
            handleErrorSnack()
          }} color="text.secondary">Balancear Características</Link>

        </Breadcrumbs>
      </Styles.Header>
      <Styles.Body>
        <SelectorButton onClick={useLastConfig} label='Seguir última configuração' startIcon={<SkipNextIcon />} sx={{ marginBottom: '30px' }} />
        <SelectorButton onClick={() => setActiveStep(CREATE_RELEASE_STEP.CharacteristicStep)} label='Alterar configuração' startIcon={<TuneIcon />} />
      </Styles.Body>
    </>
  );
}
