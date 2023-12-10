import { forwardRef } from 'react';
// icons
import { Icon } from '@iconify/react';
// @mui
import Box, { BoxProps } from '@mui/material/Box';
//
import { IconifyProps } from './types';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  icon: IconifyProps;
}

const Iconify = forwardRef<HTMLDivElement, Props>(({ icon, width = 20, sx, ...other }, ref) => (
  <Box
    ref={ref}
    component="div" // Mudar para 'div' para suportar ref
    className="component-iconify"
    sx={{ width, height: width, ...sx }}
    {...other}
  >
    <Icon icon={icon} /> {/* Renderizar Icon dentro de Box */}
  </Box>
));

export default Iconify;
