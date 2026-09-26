import { Characteristic } from "@customTypes/product";
import { useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { StyledSlider } from "./styles";

export interface EqualizerSliderProps {
  characteristic: Characteristic;
}

export default function EqualizerSlider({ characteristic }: EqualizerSliderProps) {
  const { t } = useTranslation('release');

  const [value, setValue] = useState(0);

  useEffect(() => {
    const updateValue = +characteristic.value.toFixed(3);
    setValue(updateValue)
  }, [characteristic])

  return (
    <Grid container direction="column" width={120}>
      <Grid item xs={9} display='flex' justifyContent='center'>
        <StyledSlider
          aria-label={characteristic.name}
          orientation="vertical"
          value={value}
          min={0}
          max={1}
          valueLabelDisplay="off"
          data-testid='equalizer-slider'
        />
      </Grid>
      <Grid item xs={2} display='flex' alignItems="center" justifyContent='center'>
        <Typography fontSize="14px" align="center">
          {t(`characteristics.${characteristic.name}`)}
        </Typography>
      </Grid>
    </Grid>
  )
}
