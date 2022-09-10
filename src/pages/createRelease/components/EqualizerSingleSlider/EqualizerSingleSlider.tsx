import React from 'react'
import { Box, Slider, Tooltip } from "@mui/material";

interface EqualizerSingleSliderProps {
  index: number;
  name: string;
  disabled: boolean;
  value: number;
  // eslint-disable-next-line no-unused-vars
  onChange: (newValue: number) => void;
  // eslint-disable-next-line no-unused-vars
  onChangeCommitted: (newValue: number) => void;
}

const EqualizerSingleSlider = ({
  index,
  name,
  value,
  disabled,
  onChange,
  onChangeCommitted
}: EqualizerSingleSliderProps) => (
    <Box textAlign='center'>
      <Box height={300}>
        <Slider
          data-testid="single-slider"
          orientation="vertical"
          value={value}
          disabled={disabled}
          min={0}
          max={100}
          onChange={(_, newValue) => onChange(newValue as number)}
          onChangeCommitted={(_, newValue) => onChangeCommitted(newValue as number)}
        />
      </Box>
      <Tooltip
        title={<span style={{ fontSize: '16px' }}>{name}</span>}
        arrow
        placement="top"
      >
        <p>C{index}</p>
      </Tooltip>
    </Box>
  )


export default EqualizerSingleSlider;
