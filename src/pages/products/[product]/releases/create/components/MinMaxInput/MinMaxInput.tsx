import { TextField, Grid, Box, Typography, Tooltip } from "@mui/material";

interface MinMaxInputInputProps {
  label: string;
  minInputValue: any;
  maxInputValue: any;
  setMinInputValue: any;
  setMaxInputValue: any;
  minThreshold: number;
  maxThreshold: number;
  minFixed?: boolean;
  maxFixed?: boolean;
  tooltip?: any;
}

export default function MinMaxInput({ label, minInputValue, maxInputValue, setMinInputValue, setMaxInputValue, minThreshold, maxThreshold, tooltip, minFixed, maxFixed }: MinMaxInputInputProps) {
  return <Grid container sx={{ paddingX: 2, minWidth: "600px" }} gap={1} marginBottom='10px'>
    <Grid item md={7} display="flex" alignItems="center">
      <Box sx={{ width: '100%' }}>
        <Typography>{label}</Typography>
        <Tooltip title={tooltip}>
          <Typography variant="caption">Min {minThreshold}, Max {maxThreshold}</Typography>
        </Tooltip>
      </Box>
    </Grid>
    <Grid item md={2} display="flex" alignItems="center">
      <TextField
        sx={{ minWidth: "80px" }}
        data-testid={`min-${label}`}
        disabled={minFixed}
        type="number"
        variant="outlined"
        label="Min"
        value={minInputValue}
        onChange={setMinInputValue}
        fullWidth
        InputProps={{
          inputProps: {
            max: maxInputValue, min: minThreshold
          }
        }}
      />
    </Grid>
    <Grid item md={2} display="flex" alignItems="center">
      <TextField
        sx={{ minWidth: "80px" }}
        disabled={maxFixed}
        data-testid={`max-${label}`}
        type="number"
        variant="outlined"
        label="Max"
        value={maxInputValue}
        onChange={setMaxInputValue}
        fullWidth
        InputProps={{
          inputProps: {
            max: maxThreshold, min: minInputValue
          }
        }}
      />
    </Grid>
  </Grid>
}
