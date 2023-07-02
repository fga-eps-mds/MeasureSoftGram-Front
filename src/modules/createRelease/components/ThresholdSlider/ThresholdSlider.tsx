import React from 'react';
import { Box, Grid, Slider, TextField, Typography } from '@mui/material';
import getThresholdInfo from '@modules/createRelease/utils/getThresholdInfo';

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

  const thresholdInfo = getThresholdInfo(label);

  return (
    <Box display="flex" flexDirection="column">
      <Typography textAlign="center">
        <strong>{thresholdInfo?.label ?? ''}</strong>
      </Typography>
      <Typography textAlign="center">{thresholdInfo?.description ?? ''}</Typography>
      <Grid spacing={3} container columns={16}>
        <Grid item xs={2}>
          <TextField
            disabled={thresholdInfo?.minFixed ?? false}
            sx={{ top: -4 }}
            type="number"
            variant="standard"
            value={weight[0]}
            onChange={(e) => onChange(e.target.value as unknown as number, weight[1], label)}
          />
        </Grid>
        <Grid item xs={12}>
          {(thresholdInfo?.range[1] ?? undefined) !== undefined && (
            <Slider
              value={weight}
              onChange={(e) => changeSlider(e)}
              min={thresholdInfo?.range[0] ?? 0}
              max={thresholdInfo?.range[1] ?? 100}
              step={thresholdInfo?.step}
            />
          )}
        </Grid>
        <Grid item xs={2}>
          <TextField
            disabled={thresholdInfo?.maxFixed ?? false}
            sx={{ top: -4 }}
            variant="standard"
            type="number"
            value={weight[1]}
            onChange={(e) => onChange(weight[0], e.target.value as unknown as number, label)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThresholdSlider;
