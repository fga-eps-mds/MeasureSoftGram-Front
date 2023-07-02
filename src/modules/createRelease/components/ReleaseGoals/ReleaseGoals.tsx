import React from 'react';

import Equalizer from '@modules/createRelease/components/Equalizer';

import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import {
  Box,
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

export default function ReleaseGoals() {
  const { releaseInfoForm } = useCreateReleaseContext();
  const { characteristics, endDate, name, startDate } = releaseInfoForm;
  const { open, allowDynamicBalance, handleChange, handleClose, handleConfirm } = useDynamicBalance();

  return (
    <>
      <Styles.Header>
        <h1>Balancear a Meta de Qualidade</h1>
        <p>
          Nesta etapa, é possível estabelecer metas para as características que serão observadas na release. É
          importante ressaltar que essas características de qualidade estão inter-relacionadas, ou seja, ao modificar a
          meta de uma característica, as demais também serão afetadas.
        </p>
        <p>
          Ao clicar em 'Permitir o balanceamento dinâmico', as alterações feitas em uma característica não afetarão
          automaticamente as demais, permitindo uma flexibilidade maior no planejamento da release.
        </p>
        <Box>
          <Typography color="#FF4646">
            <Checkbox checked={allowDynamicBalance} onChange={handleChange} name="allowDynamicBalanceCheckbox" />
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
