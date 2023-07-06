import React from 'react';

import { Box, Checkbox, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import undelineRemover from '@utils/undelineRemover';
import * as Styles from './styles';
import Skeleton from './Skeleton';

function ReleaseInfo() {
  const { releaseInfoForm, preConfigCharacteristics, handleChangeForm, handleSelectCharacteristics } =
    useCreateReleaseContext();

  if (!preConfigCharacteristics) return <Skeleton />;

  const { endDate, name, characteristics, startDate } = releaseInfoForm;

  return (
    <>
      <Styles.Header>
        <h1 style={{ color: '#33568E', fontWeight: '500' }}>Planejar Release</h1>
        <p>
          Na etapa inicial do planejamento da release é possível definir seu nome e as datas de início e fim, bem como
          selecionar as características a serem observadas durante o período planejado.
        </p>
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

        <Box>
          <h2 style={{ color: '#538BA3', fontWeight: '500' }}>Características a serem observadas no release</h2>

          <FormGroup onChange={(e) => handleSelectCharacteristics((e.target as HTMLInputElement).value)}>
            {preConfigCharacteristics.map((item) => (
              <FormControlLabel
                key={item}
                control={
                  <Checkbox
                    value={item}
                    name={item}
                    id={item}
                    checked={characteristics?.includes(item)}
                    inputProps={{
                      'data-testid': 'characteristic-release'
                    }}
                    color="secondary"
                  />
                }
                label={undelineRemover(item)}
              />
            ))}
          </FormGroup>
        </Box>
      </Styles.Body>
    </>
  );
}

export default ReleaseInfo;
