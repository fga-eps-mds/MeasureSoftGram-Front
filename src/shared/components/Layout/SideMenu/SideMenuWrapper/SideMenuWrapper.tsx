import React, { useEffect } from 'react';
import Link from 'next/link';

import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Backdrop, Box, Divider } from '@mui/material';

import { useSideMenuContext } from '@contexts/SidebarProvider/SideMenuProvider';
import { useProviderTranslation as useTranslation } from '@hooks/useProviderTranslation';
import Translation from '@components/Translation/Translation';
import * as Styles from './styles';

import OrganizationSelector from '../OrganizationSelector';
import ProductsSelector from '../ProductsSelector';

const IMAGE_SOURCE = '/images/svg/logo_white.svg';

interface Props {
  menuItems?: React.ReactNode;
  footer?: React.ReactNode;
}

function SideMenuWrapper({ menuItems, footer }: Props) {
  const { isCollapsed, toggleCollapse, isOverlay, closeOverlay } = useSideMenuContext();
  const { t, i18n } = useTranslation('sidebar');

  useEffect(() => {
    if (!isOverlay) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeOverlay();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOverlay, closeOverlay]);

  return (
    <>
      {/* o fundo fecha o menu aberto por cima do conteúdo e impede que o clique fora acione o que está embaixo */}
      {isOverlay && (
        <Backdrop
          open
          data-testid="side-menu-backdrop"
          onClick={closeOverlay}
          sx={{ zIndex: (theme) => theme.zIndex.drawer - 1 }}
        />
      )}
      <Styles.Wrapper data-testid="side-menu" $overlay={isOverlay}>
        <Styles.CollapseButton data-testid="side-menu-collapse" onClick={toggleCollapse}>
          {isCollapsed ? <NavigateNextRoundedIcon fontSize="large" color="#f5f5f5" /> : <NavigateBeforeRoundedIcon fontSize="large" color="#f5f5f5" />}
        </Styles.CollapseButton>
        <Styles.Content data-testid="side-menu-content">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Link href="/home">
              <Styles.Logo src={IMAGE_SOURCE} height={50} />
            </Link>
            {!isCollapsed && <Translation t={t} i18n={i18n} />}
          </Box>
          <OrganizationSelector />
          <ProductsSelector />
          <Divider sx={{ width: '100%', my: '10px', border: '1px solid rgba(0, 0, 0, 0.30)' }} />
          <Styles.ItemContainer>{menuItems}</Styles.ItemContainer>
          <Divider sx={{ width: '100%', my: '2px', border: '1px solid rgba(0, 0, 0, 0.30)' }} />
          {footer}
        </Styles.Content>
      </Styles.Wrapper>
    </>
  );
}

export default SideMenuWrapper;
