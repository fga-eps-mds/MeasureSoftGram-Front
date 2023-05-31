import React from 'react';

import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material/';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import LetterAvatar from '@components/LetterAvatar';

type Props = {
  values: Array<any>;
  open: boolean;
  onClose: () => void;
  onClickItem: (value: any) => void;
};

const SideList = ({ values, open, onClose, onClickItem }: Props) => (
  <Drawer anchor="left" open={open} onClose={onClose}>
    <Box sx={{ width: '500px', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton onClick={onClose}>
          <FiArrowLeft fontSize={30} />
        </IconButton>
        <Button variant="contained" startIcon={<FiPlus />}>
          Adicionar Organização
        </Button>
      </Box>
      <List>
        {values.map((value) => (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
            <Divider sx={{ width: 'calc(100% - 10px)', border: '1px solid rgba(0, 0, 0, 0.20)' }} />
            <ListItem
              disablePadding
              key={value.id}
              onClick={() => {
                onClickItem(value);
                onClose();
              }}
            >
              <ListItemButton>
                <ListItemIcon>
                  <LetterAvatar name={value.name} />
                </ListItemIcon>
                <ListItemText primary={value.name} />
              </ListItemButton>
            </ListItem>
          </Box>
        ))}
      </List>
    </Box>
  </Drawer>
);

export default SideList;
