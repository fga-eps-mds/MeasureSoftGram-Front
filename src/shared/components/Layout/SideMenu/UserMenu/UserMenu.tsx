import React from 'react';
import { Avatar, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useAuth } from '@contexts/Auth';
import { FiChevronRight } from 'react-icons/fi';
import { Logout } from '@mui/icons-material';
import SideMenuItem from '../SideMenuItem/SideMenuItem';

interface Props {
  username: string | undefined;
}

function UserMenu({ username }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { logout } = useAuth();

  return (
    <>
      <SideMenuItem
        startIcon={<Avatar sx={{ width: 34, height: 34, backgroundColor: '#000' }} />}
        text={username || '???'}
        tooltip="Menu de usuário"
        endIcon={<FiChevronRight fontSize={28} />}
        onClick={handleClick}
      />
      <Menu
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={logout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Finalizar Sessão</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default UserMenu;
