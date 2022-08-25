/* eslint-disable no-unused-vars */
import React from 'react';
import { Grid, Slider, SliderProps, TextField, TextFieldProps, Typography } from '@mui/material';
import capitilizer from '@utils/capitilizer';
import titleFormater from '@utils/titleFormater';

interface PreConfigSlidersProps {
  label: string;
  onChange: Function;
  weight: number;
}

const PreConfigSliders = ({ label, onChange, weight }: PreConfigSlidersProps) => (
  <Grid spacing={3} container columns={16}>
    <Grid item xs={3}>
      <Typography textAlign="start">
        <strong>{capitilizer(titleFormater(label))}</strong>
      </Typography>
    </Grid>
    <Grid item xs={9}>
      <Slider value={weight} onChange={onChange as SliderProps['onChange']} />
    </Grid>
    <Grid item xs={4}>
      <TextField
        sx={{ width: '96px', top: -4 }}
        variant="standard"
        value={weight}
        onChange={onChange as TextFieldProps['onChange']}
      />
    </Grid>
  </Grid>
);

export default PreConfigSliders;
