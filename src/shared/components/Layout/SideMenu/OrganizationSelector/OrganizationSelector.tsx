import React, { useState } from 'react';

import { Box, MenuItem, SelectChangeEvent, IconButton } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import * as Styles from './styles';

function OrganizationSelector() {
  const [organization, setOrganization] = useState('fga-eps-mds');

  const handleChange = (event: SelectChangeEvent) => {
    setOrganization(event.target.value as string);
  };

  return (
    <Box mt="64px" display="flex" alignItems="center">
      <BusinessIcon />
      <Styles.DropDown value={organization} onChange={handleChange}>
        <MenuItem value="fga-eps-mds">fga-eps-mds</MenuItem>
      </Styles.DropDown>
      <IconButton disabled>
        <AddCircleIcon />
      </IconButton>
    </Box>
  );
}

export default OrganizationSelector;
