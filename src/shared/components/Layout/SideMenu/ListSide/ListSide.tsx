import React from 'react';

import {Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography} from '@mui/material/'
import LetterAvatar from '@components/LetterAvatar';
import { Organization } from '@customTypes/organization';
import { Product } from '@customTypes/product';

type Props = {
  orgs: Array<any>;
  handleSelection: (org: any) => void;
  title: string;
}; 

const ListSide = ({orgs, handleSelection, title}: Props) => {
  return (
   <Box sx={{ width: '100%', minWidth: 500, bgcolor: 'background.paper' }}>

      <Typography variant="h4" marginLeft="13px" > {title} </Typography>
      <List>
      {orgs.map((org) => { return (
        <ListItem disablePadding key={org.id}
          onClick={() => { handleSelection(org) }}>
          <ListItemButton>
            <ListItemIcon>
              <LetterAvatar name={org.name}/>
            </ListItemIcon>
            <ListItemText primary={org.name} />
          </ListItemButton>
        </ListItem>
      )})}
      </List>
    <Divider />
   </Box>
  )
}

export default ListSide;