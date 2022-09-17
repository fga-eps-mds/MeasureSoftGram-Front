/* eslint-disable no-unused-vars */
import React from 'react';
import { Grid, InputAdornment, Slider, SliderProps, TextField, TextFieldProps, Typography } from '@mui/material';
import capitilizer from '@utils/capitilizer';
import undelineRemover from '@utils/undelineRemover';
import PRE_CONFIG_SLIDERS from './consts';

interface PreConfigSlidersProps {
  label: string;
  onChange: Function;
  weight: number;
}

const PreConfigSliders = ({ label, onChange, weight }: PreConfigSlidersProps) => (
  <Grid spacing={3} container columns={16}>
    <Grid item xs={3}>
      <Typography textAlign="start">
        <strong>{capitilizer(undelineRemover(label))}</strong>
      </Typography>
    </Grid>
    <Grid item xs={9}>
      <Slider
        data-testid={PRE_CONFIG_SLIDERS.TEST_ID.CONFIG_SLIDER}
        value={weight}
        onChange={onChange as SliderProps['onChange']}
      />
    </Grid>
    <Grid item xs={4}>
      <TextField
        data-testid={PRE_CONFIG_SLIDERS.TEST_ID.CONFIG_INPUT}
        sx={{ width: '96px', top: -4 }}
        variant="standard"
        value={weight}
        onChange={onChange as TextFieldProps['onChange']}
        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
      />
    </Grid>
  </Grid>
);

export default PreConfigSliders;
