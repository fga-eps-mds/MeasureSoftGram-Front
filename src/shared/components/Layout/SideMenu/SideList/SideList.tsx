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
import { useRouter } from 'next/router';

type Props = {
  values: Array<any>;
  open: boolean;
  onClose: () => void;
  onClickItem: (_value: any) => void;
  seeMorePath: string;
};

const SideList = ({ values, open, onClose, onClickItem, seeMorePath }: Props) => {
  const maxItems = 10;
  const filteredValues = values.slice(0, maxItems);
  const router = useRouter();

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: '500px', bgcolor: 'background.paper' }}>
        <Box
          sx={{ p: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <IconButton onClick={onClose}>
            <FiArrowLeft fontSize={30} />
          </IconButton>
          <Button variant="contained" startIcon={<FiPlus />}>
            Adicionar Organização
          </Button>
        </Box>
        <List>
          {filteredValues.map((value) => (
            <Box key={value.id} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
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
          <Button
            sx={{ marginTop: '5px', minHeight: '10vh', width: 'calc(100% - 10px)' }}
            onClick={() => {
              router.push(seeMorePath);
            }}
            variant="text"
          >
            VER MAIS...
          </Button>
        </List>
      </Box>
    </Drawer>
  );
};

export default SideList;
