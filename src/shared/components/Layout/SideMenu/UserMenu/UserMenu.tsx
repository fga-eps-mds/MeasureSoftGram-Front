import React, { useState } from 'react';
import { Avatar, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useAuth } from '@contexts/Auth';
import { FiChevronRight } from 'react-icons/fi';
import { Logout } from '@mui/icons-material';
import { useRouter } from 'next/router';
// import { FaGear } from 'react-icons/fa6';
import { FaCog } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import SideMenuItem from '../SideMenuItem';

interface Props {
  username: string | undefined;
}

function UserMenu({ username }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { logout } = useAuth();
  const router = useRouter();

  const { t } = useTranslation('sidebar');

  return (
    <>
      <SideMenuItem
        startIcon={<Avatar sx={{ width: 34, height: 34, backgroundColor: '#000' }} />}
        text={username ?? '???'}
        tooltip={t("tooltip.user-menu")}
        endIcon={<FiChevronRight fontSize={28} />}
        onClick={handleClick}
        selected={false}
      />
      <Menu
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            router.push('/config');
          }}
        >
          <ListItemIcon>
            <FaCog fontSize="small" />
          </ListItemIcon>
          <ListItemText> {t("select.config")} </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            void logout();
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("select.end-session")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default UserMenu;
