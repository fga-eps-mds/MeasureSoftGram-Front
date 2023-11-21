import React from 'react';

import { Box, Breadcrumbs, TextField, Typography } from '@mui/material';
import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import * as Styles from './styles';

function ReleaseInfo() {
  const { releaseInfoForm, handleChangeForm, } =
    useCreateReleaseContext();

  const { endDate, name, description, startDate } = releaseInfoForm;

  return (
    <>
      <Styles.Header>
        <h1 style={{ color: '#33568E', fontWeight: '500' }}>Planejar Release</h1>
        <Breadcrumbs separator={<Box
          component="span"
          sx={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: 'text.disabled',
          }}
        />} sx={{ fontSize: '14px' }}>

          <Typography color="text.primary">Criar Release</Typography>
          <Typography color="text.secondary">Definir configuração do modelo</Typography>
          <Typography color="text.secondary">Balancear Características</Typography>

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
              handleChangeForm('description', e.target.value);
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
