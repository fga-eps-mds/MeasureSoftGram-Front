import React from 'react';
import { addDays, format } from 'date-fns';

import { Box, Checkbox, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { useCreateReleaseContext } from '@pages/createRelease/context/useCreateRelease';
import * as Styles from './styles';
import Skeleton from './Skeleton';

function ReleaseInfo() {
  const {
    releaseInfoForm,
    preConfigCharacteristics,
    handleChangeForm,
    handleSelectCharacteristics
  } = useCreateReleaseContext();

  if (!preConfigCharacteristics) return <Skeleton />

  const { endDate, name, characteristics, startDate } = releaseInfoForm;

  return (
    <>
      <Styles.Header>
        <h1>Definir release</h1>
        <p>Mini explicação sobre as configurações basicas e a seleção de caracteristicas</p>
      </Styles.Header>

      <Styles.Body>
        <Box>
          <h2>Configurações básicas</h2>

          <TextField
            label="Apelido da release"
            style={{ marginBottom: '24px' }}
            value={name}
            onChange={(e) => {handleChangeForm('name', e.target.value)}}
            fullWidth
          />

          <Box display="flex">
            <TextField
              defaultValue={format(new Date(), 'yyyy-MM-dd')}
              label="Data de ínicio da release"
              type="date"
              value={startDate}
              style={{ marginRight: '16px' }}
              onChange={(e) => {handleChangeForm('startDate', e.target.value)}}
              sx={{flex: 1}}
            />

            <TextField
              defaultValue={format(addDays(new Date(), 7), 'yyyy-MM-dd')}
              label="Data de fim da release"
              type="date"
              value={endDate}
              onChange={(e) => {handleChangeForm('endDate', e.target.value)}}
              sx={{flex: 1}}
            />
          </Box>
        </Box>

        <Box>
          <h2>Caracteristicas a serem calculadas na release</h2>

          <FormGroup
            onChange={(e) => handleSelectCharacteristics((e.target as HTMLInputElement).value)}
          >
            {preConfigCharacteristics.map(item => (
              <FormControlLabel
                key={item}
                control={
                  <Checkbox
                    value={item}
                    name={item}
                    id={item}
                    checked={characteristics?.includes(item)}
                  />
                }
                label={item}
              />
            ))}
          </FormGroup>
        </Box>
      </Styles.Body>
    </>
  );
};

export default ReleaseInfo;
