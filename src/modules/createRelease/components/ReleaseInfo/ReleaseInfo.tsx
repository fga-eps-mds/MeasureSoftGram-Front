import React from 'react';

import { Box, Breadcrumbs, Link, TextField, Typography } from '@mui/material';
import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import { useSnackbar } from 'notistack';
import * as Styles from './styles';


function ReleaseInfo(props: any) {
  const { setActiveStep } = props;
  const { releaseInfoForm, handleChangeForm, } =
    useCreateReleaseContext();

  const { endDate, name, description, startDate } = releaseInfoForm;
  const { enqueueSnackbar } = useSnackbar()
  const handleSnackbarError = () => {
    enqueueSnackbar('Preencha as informações da release', { variant: 'error' })
  }
  return (
    <>
      <Styles.Header>
        <h1 style={{ color: '#33568E', fontWeight: '500' }}>Planejamento de Release</h1>
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
            fontWeight: '800'
          }} onClick={() => {
            setActiveStep(0);
          }} color="text.primary">Criar Release</Link>
          <Link sx={{
            cursor: 'pointer',
            textDecoration: 'none',
          }} onClick={() => {
            handleSnackbarError()
          }} color="text.secondary">Definir configuração do modelo</Link>
          <Link sx={{
            cursor: 'pointer',
            textDecoration: 'none',
          }} onClick={() => {
            handleSnackbarError()
          }} color="text.secondary">Balancear características</Link>

        </Breadcrumbs>
      </Styles.Header>

      <Styles.Body>
        <Box>
          <h2 style={{ color: '#538BA3', fontWeight: '500' }}>Configurações básicas</h2>

          <TextField
            label="Apelido da release"
            style={{ marginBottom: '24px' }}
            value={name}
            required
            onChange={(e) => {
              handleChangeForm('name', e.target.value);
            }}
            inputProps={{
              'data-testid': 'apelido-release'
            }}
            fullWidth
          />

          <TextField
            label="Descrição da release"
            style={{ marginBottom: '24px' }}
            value={description}
            multiline
            minRows={3}
            onChange={(e) => {
              if (e.target.value.length <= 512) {
                handleChangeForm('description', e.target.value);
              } else {
                enqueueSnackbar('A descrição deve ter no máximo 512 caracteres', { variant: 'error' })
              }
            }}
            inputProps={{
              'data-testid': 'apelido-release'
            }}
            fullWidth
          />

          <Box display="flex">
            <TextField
              label="Data de ínicio da release"
              type="date"
              required
              value={startDate}
              style={{ marginRight: '16px' }}
              onChange={(e) => {
                handleChangeForm('startDate', e.target.value);
              }}
              inputProps={{
                'data-testid': 'inicio-release'
              }}
              sx={{ flex: 1 }}
            />

            <TextField
              label="Data de fim da release"
              type="date"
              required
              value={endDate}
              onChange={(e) => {
                handleChangeForm('endDate', e.target.value);
              }}
              inputProps={{
                'data-testid': 'fim-release'
              }}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>
      </Styles.Body>
    </>
  );
}

export default ReleaseInfo;
