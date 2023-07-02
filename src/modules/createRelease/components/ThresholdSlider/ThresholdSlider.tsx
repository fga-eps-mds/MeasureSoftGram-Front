import React from 'react';
import { Box, Grid, Slider, TextField, Typography } from '@mui/material';
import capitalizer from '@utils/capitalizer';
import undelineRemover from '@utils/undelineRemover';

interface PreConfigSlidersProps {
  label: string;
  onChange: (min: number, max: number, key: string) => void;
  weight: number[];
}

const ThresholdSlider = ({ label, onChange, weight }: PreConfigSlidersProps) => {
  function changeSlider(e: Event) {
    const value = e.target!.value as unknown as number[];
    onChange(value[0], value[1], label);
  }

  return (
    <Box display="flex" flexDirection="column">
      <Typography textAlign="center">
        <strong>{capitalizer(undelineRemover(label))}</strong>
      </Typography>
      <Typography textAlign="center">Descrição do threshold específico</Typography>
      <Grid spacing={3} container columns={16}>
        <Grid item xs={2}>
          <TextField
            sx={{ top: -4 }}
            variant="standard"
            value={weight[0]}
            onChange={(e) => onChange(e.target.value as unknown as number, weight[1], label)}
          />
        </Grid>
        <Grid item xs={12}>
          <Slider value={weight} onChange={(e) => changeSlider(e)} max={1} step={0.1} />
        </Grid>
        <Grid item xs={2}>
          <TextField
            sx={{ top: -4 }}
            variant="standard"
            value={weight[1]}
            onChange={(e) => onChange(weight[1], e.target.value as unknown as number, label)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThresholdSlider;
