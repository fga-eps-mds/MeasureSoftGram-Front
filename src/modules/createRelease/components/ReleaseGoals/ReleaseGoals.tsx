import React, { useEffect } from 'react';

import Equalizer from '@modules/createRelease/components/Equalizer';

import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography
} from '@mui/material';
import * as Styles from './styles';
import useDynamicBalance from './hook/useDynamicBalance';

export default function ReleaseGoals(props: any) {
  const { setActiveStep } = props;
  const { releaseInfoForm, setAllowDynamicBalance } = useCreateReleaseContext();
  const { characteristics, endDate, name, startDate } = releaseInfoForm;
  const { open, allowDynamicBalance, handleChange, handleClose, handleConfirm } = useDynamicBalance();

  useEffect(() => {
    setAllowDynamicBalance(allowDynamicBalance);
  }, [allowDynamicBalance]);

  return (
    <>
      <Styles.Header>
        <h1 style={{ color: '#33568E', fontWeight: '500' }}>Planejamento de Release</h1>
        <h2 style={{ color: '#33568E', fontWeight: '300' }}>Balancear a Meta de Qualidade</h2>
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
          <Link onClick={() => {
            setActiveStep(1);
          }} sx={{
            cursor: 'pointer',
            textDecoration: 'none',
          }} color="text.secondary">Definir configuração do modelo</Link>
          <Link sx={{
            cursor: 'pointer',
            textDecoration: 'none',
          }} color="text.primary">Balancear Pesos</Link>

        </Breadcrumbs>
        <p>
          Nesta etapa é possível estabelecer metas para as características que serão observadas na release. É
          importante ressaltar que essas características de qualidade estão inter-relacionadas, ou seja, ao modificar a
          meta de uma característica, as demais também serão afetadas.
        </p>
        <p>
          Ao clicar em 'Permitir o balanceamento dinâmico', as alterações feitas em uma característica não afetarão
          automaticamente as demais, permitindo uma flexibilidade maior no planejamento da release.
        </p>
        <Box>
          <Typography color="#FF4646">
            <Checkbox checked={allowDynamicBalance} onChange={handleChange} name="allowDynamicBalanceCheckbox"
              sx={{
                color: '#474747',
                '&.Mui-checked': {
                  color: '#474747',
                },
              }} />
            Permitir o balanceamento dinâmico
          </Typography>
        </Box>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Permitir o balanceamento dinâmico</DialogTitle>
          <DialogContent>
            <Typography color="#FF4646">
              O balanceamento das metas funciona com base em uma matriz de relacionamento entre as características de
              qualidade{' '}
              <Link
                href="https://www.sce.carleton.ca/faculty/wainer/papers/art%253A10.1007%252Fs13198-016-0546-8.pdf"
                underline="hover"
                target="_blank"
              >
                (link)
              </Link>
              . Ao permitir o balanceamento dinâmico, o sistema faz com que essas relações sejam ignoradas, dessa forma,
              alguns objetivos definidos podem ser inalcançáveis. Deseja continuar mesmo assim?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleConfirm} color="primary" name="confirmButton">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Styles.Header>

      <Styles.Body>
        <div>
          <strong>{name}</strong>
          <p>
            {startDate} - {endDate}
          </p>
        </div>

        <Equalizer selectedCharacteristics={characteristics} allowDynamicBalance={allowDynamicBalance} />
      </Styles.Body>
    </>
  );
}
