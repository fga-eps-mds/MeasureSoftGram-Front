import React, { useState } from 'react';
import Link from 'next/link';
import { Avatar, Box, Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { FaCog } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { SideMenuProvider } from '@contexts/SidebarProvider/SideMenuProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useAuth } from '@contexts/Auth';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import SideMenu from './SideMenu';
import Breadcrumbs from './Breadcrumbs';

import * as Styles from './styles';

interface Props {
  children?: React.ReactNode;
  rightSide?: React.ReactNode;
  disableBreadcrumb?: boolean;
}

function HeaderUserMenu() {
  const { session, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation('sidebar');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          color: '#f5f5f5',
          textTransform: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: '#38618a',
          },
        }}
      >
        <Avatar sx={{ width: 32, height: 32, backgroundColor: '#000' }} />
        <Box sx={{ fontWeight: 500, fontSize: '15px' }}>{session?.username ?? '???'}</Box>
        <FiChevronDown fontSize={20} />
      </Button>
      <Menu
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            router.push('/config');
          }}
        >
          <ListItemIcon>
            <FaCog fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('select.config')}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            void logout();
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('select.end-session')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

function Layout({ children, rightSide, disableBreadcrumb = false }: Props) {
  const { productsList } = useProductContext();
  const { organizationList } = useOrganizationContext();

  const showSidebar = !!(
    (productsList && productsList.length > 0) ||
    (organizationList && organizationList.some((org) => org.products && org.products.length > 0))
  );

  return (
    <Styles.LayoutGrid $showSidebar={showSidebar}>
      {showSidebar ? (
        <Styles.SideMenuArea>
          <SideMenuProvider>
            <SideMenu />
          </SideMenuProvider>
        </Styles.SideMenuArea>
      ) : (
        <Styles.TopHeaderArea>
          <Link href="/home">
            <Styles.HeaderLogo src="/images/svg/logo_white.svg" alt="MeasureSoftGram" />
          </Link>
          <HeaderUserMenu />
        </Styles.TopHeaderArea>
      )}
      <Styles.MainContentArea>
        {!disableBreadcrumb && <Breadcrumbs />}
        {children}
      </Styles.MainContentArea>
      <Styles.RightSideArea>{rightSide}</Styles.RightSideArea>
    </Styles.LayoutGrid>
  );
}

export default Layout;
