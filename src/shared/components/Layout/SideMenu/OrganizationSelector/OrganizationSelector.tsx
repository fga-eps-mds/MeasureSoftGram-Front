import React, { useEffect, useState } from 'react';

import { Box, MenuItem, SelectChangeEvent, IconButton } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import { useOrganizationContext } from '@contexts/OrganizationProvider';

import * as Styles from './styles';

function OrganizationSelector() {
  const { organizationList, setCurrentOrganization, currentOrganization } = useOrganizationContext();

  const [selectedOrganization, setSelectedOrganization] = useState<number>();

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedOrganization(event.target.value);
  };

  /*useEffect(() => {
    if (organizationList.length !== 0 && !currentOrganization) {
      setSelectedOrganization(0);
    }
  }, [currentOrganization, organizationList]);*/

  useEffect(() => {
    if (selectedOrganization !== undefined) setCurrentOrganization(organizationList[selectedOrganization]);
  }, [organizationList, selectedOrganization, setCurrentOrganization]);

  return (
    <Box mt="64px" display="flex" alignItems="center">
      <BusinessIcon />
      <Styles.DropDown value={selectedOrganization || 0} onChange={handleChange}>
        {organizationList?.map((organization, id) => (
          <MenuItem value={id} key={organization.id}>
            {organization.name}
          </MenuItem>
        ))}
      </Styles.DropDown>
      <IconButton disabled>
        <AddCircleIcon />
      </IconButton>
    </Box>
  );
}

export default OrganizationSelector;
