import React, { useState } from 'react';

import Equalizer from '@modules/createRelease/components/Equalizer';

import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import * as Styles from './styles';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

export default function ReleaseGoals() {
  const { releaseInfoForm } = useCreateReleaseContext();
  const { characteristics, endDate, name, startDate } = releaseInfoForm;
  const [ allowDynamicBalance, setAllowDynamicBalance ] = useState(false);
  const [ open, setOpen ] = useState(false);

  function handleChange (event: React.ChangeEvent<HTMLInputElement>){
    if (allowDynamicBalance) {
      setAllowDynamicBalance(false);
    }
    else {
      setOpen(true);
    }
  }

  function handleClose(): void {
    setOpen(false);
  }

  function handleConfirm(): void {
    setOpen(false);
    setAllowDynamicBalance(true);
  }

  return (
    <>
      <Styles.Header>
        <h1>Balancear a Meta de Qualidade</h1>
        <p>
          Mini explicação como funciona as metas da release (Configuração das caracteristicas, valor de uma
          caracteristica pode influenciar em outra, etc)
        </p>
        <Box>
          <Typography color="#FF4646"> <Checkbox checked={allowDynamicBalance} onChange={handleChange}/> Permitir o balanceamento dinâmico </Typography>
        </Box>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Permitir o balanceamento dinâmico</DialogTitle>
           <DialogContent>
            <Typography color="#FF4646"> O balanceamento das metas funciona com base em uma matriz de relacionamento entre as características de qualidade (link). Ao permitir o balanceamento dinâmico, o sistema faz com que essas relações sejam ignoradas, dessa forma, alguns objetivos definidos podem ser inalcançáveis. Deseja continuar mesmo assim? </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleConfirm} color="primary">
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
