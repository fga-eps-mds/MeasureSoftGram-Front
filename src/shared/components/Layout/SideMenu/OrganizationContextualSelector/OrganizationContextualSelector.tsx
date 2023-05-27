import { Organization } from '@customTypes/organization';
import { Button } from '@mui/material';
import React from 'react';
import {useOrganizationContext} from '@contexts/OrganizationProvider'
import ArrowCircleDown from '@mui/icons-material/ArrowCircleDown';


const OrganizationContextualSelector: React.FC = () => {
  const {currentOrganization} = useOrganizationContext();
  return <Button variant="outlined">
      startIcon={<ArrowCircleDown/>} 
      endIcon={<ArrowCircleDown/>}
        {currentOrganization? currentOrganization.name : 'Selecione uma Organização'} 
    </Button>;
}

export default OrganizationContextualSelector;