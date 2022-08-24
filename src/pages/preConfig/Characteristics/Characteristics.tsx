import React, { useState } from 'react';
import { Box, Grid, InputAdornment, Slider, TextField, Typography } from '@mui/material';
import CheckboxButton from '@components/CheckboxButton/CheckboxButton';
import capitilizer from '@utils/capitilizer';
import mockedData from '../mockData.json';
import toPercentage from '../utils/toPercentage';

export const titleAndSubTitle = {
  title: 'Preencher pré configurações',
  subtitle: 'Mini explicação do que é caracteristica e como esse formulário pode demorar um tempo para ser preenchido'
};

const CHARACTERISTICS = mockedData.data.characteristics;

const Characteristics = () => {
  const [characteristics, setCharacteristics] = useState(CHARACTERISTICS);
  const [checkboxNames, setCheckboxNames] = useState<Array<string>>([]);

  const setWeight = (key: string) => (event: any) => {
    const value = toPercentage(event.target.value);

    const newObject = characteristics.map((characteristic) =>
      characteristic.key === key ? { ...characteristic, weight: value as number } : characteristic
    );

    setCharacteristics(newObject);
  };

  const addCharacteristic = (key: string) => {
    let namesArray = [...checkboxNames];

    if (checkboxNames.includes(key)) {
      namesArray = namesArray.filter((name) => name !== key);
    } else namesArray.push(key);

    setCheckboxNames(namesArray);
  };

  const renderCheckBoxes = () => (
    <Grid container marginBottom="64px">
      {CHARACTERISTICS.map((characteristic) => (
        <Grid item>
          <CheckboxButton
            label={characteristic.key}
            style={{ marginRight: '8px' }}
            onClick={() => {
              addCharacteristic(characteristic.key);
            }}
          />
        </Grid>
      ))}
    </Grid>
  );

  const renderSliders = () => (
    <Box>
      {characteristics.map((characteristic) => {
        if (checkboxNames.includes(characteristic.key)) {
          return (
            <Grid spacing={3} container columns={16}>
              <Grid item xs={3}>
                <Typography textAlign="start">
                  <strong>{capitilizer(characteristic.key)}</strong>
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <Slider value={characteristic.weight} onChange={setWeight(characteristic.key)} />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  sx={{ width: '96px', top: -4 }}
                  variant="standard"
                  value={characteristic.weight.toString()}
                  onChange={setWeight(characteristic.key)}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                />
              </Grid>
            </Grid>
          );
        }
        return <div />;
      })}
    </Box>
  );

  return (
    <Box display="flex" flexDirection="column" mt="25vh">
      <Typography variant="h6" sx={{ marginBottom: '16px' }}>
        Preencher pré configurações
      </Typography>
      {renderCheckBoxes()}
      {renderSliders()}
    </Box>
  );
};

export default Characteristics;
