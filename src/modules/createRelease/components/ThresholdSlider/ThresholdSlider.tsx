import React from 'react';
import { Box, Grid, Slider, TextField, Typography } from '@mui/material';
import getThresholdInfo from '@modules/createRelease/utils/getThresholdInfo';

interface PreConfigSlidersProps {
  label: string;
  onChange: (min: number, max: number, key: string) => void;
  min: number;
  max: number;
}

const ThresholdSlider = ({ label, onChange, min, max }: PreConfigSlidersProps) => {
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
            value={min}
            onChange={(e) => onChange(Number(e.target.value), max, label)}
          />
        </Grid>
        <Grid item xs={12}>
          {(thresholdInfo?.range[1] ?? undefined) !== undefined && (
            <Slider
              value={[min, max]}
              onChange={(e) => changeSlider(e)}
              min={thresholdInfo?.range[0] ?? 0}
              max={thresholdInfo?.range[1] ?? 100}
              step={thresholdInfo?.step}
              data-testid="threshold-slider"
              sx={{
                color: '#7f7f7f',
                '&.Mui-checked': {
                  color: '#7f7f7f',
                },
              }}
            />
          )}
        </Grid>
        <Grid item xs={2}>
          <TextField
            disabled={thresholdInfo?.maxFixed ?? false}
            sx={{ top: -4 }}
            variant="standard"
            type="number"
            value={max}
            onChange={(e) => onChange(min, Number(e.target.value), label)}
            data-testid="threshold-slider-max"
          />
        </Grid>
      </Grid>
    </Box >
  );
};

export default ThresholdSlider;
