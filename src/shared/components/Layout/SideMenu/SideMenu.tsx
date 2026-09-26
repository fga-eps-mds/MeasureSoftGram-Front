import React, { useEffect, useState } from 'react';
import {
  FiBarChart2,
  FiGitBranch,
  FiPaperclip,
  FiGrid,
  FiChevronDown,
  FiChevronUp,
  FiPieChart,
  FiTrendingUp,
} from 'react-icons/fi';
import { useAuth } from '@contexts/Auth';
import { useProductContext } from '@contexts/ProductProvider';
import { useRouter } from 'next/router';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import SideMenuItem from './SideMenuItem/SideMenuItem';
import SideMenuWrapper from './SideMenuWrapper';
import UserMenu from './UserMenu';

export type SideMenuItemType = {
  startIcon: React.ReactElement;
  endIcon?: React.ReactElement;
  text: string;
  tooltip: string;
  path: string;
  disable: boolean;
  selected: boolean;
};

function SideMenu() {
  const { session } = useAuth();
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();
  const router = useRouter();
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);

  useEffect(() => {
  }, [currentOrganization, currentProduct]);

  const { t } = useTranslation('sidebar')

  const MenuItems: SideMenuItemType[] = [
    {
      startIcon: <FiBarChart2 fontSize={28} />,
      text: t('sidebar-options.overview.text'),
      tooltip: t('sidebar-options.overview.tooltip'),
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}`,
      disable: !currentOrganization,
      selected: router.pathname === '/products/[product]'
    },
    {
      startIcon: <FiGitBranch fontSize={28} />,
      text: t('sidebar-options.repos.text'),
      tooltip: t('sidebar-options.repos.tooltip'),
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/repositories`,
      disable: !currentProduct,
      selected: router.query?.repository !== undefined || router.pathname === '/products/[product]/repositories'
    },
    {
      startIcon: <FiPaperclip fontSize={28} />,
      text: 'Releases',
      tooltip: t('sidebar-options.release.tooltip'),
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/releases`,
      disable: !currentProduct,
      selected: router.query?.release !== undefined
    },
  ];

  const dashboardSubItems: SideMenuItemType[] = [
    {
      startIcon: <FiPieChart fontSize={24} />,
      text: '1. Visão Geral de Qualidade',
      tooltip: 'Visão Geral de Qualidade',
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/dashboards/overview`,
      disable: !currentProduct,
      selected: router.pathname === '/products/[product]/dashboards/overview',
    },
    {
      startIcon: <FiTrendingUp fontSize={24} />,
      text: '2. Evolução Temporal',
      tooltip: 'Evolução Temporal',
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/dashboards/temporal`,
      disable: !currentProduct,
      selected: router.pathname === '/products/[product]/dashboards/temporal',
    },
  ];

  const isAnyDashboardSelected = router.pathname?.includes('/dashboards/') ?? false;

  return (
    <SideMenuWrapper
      key={`${currentOrganization?.id}-${currentProduct?.id}`}
      menuItems={
        currentProduct && (
          <>
            {MenuItems.map((item) => (
              <SideMenuItem
                key={item.text}
                {...item}
                onClick={() => {
                  void router.push(item.path);
                }}
              />
            ))}
            <SideMenuItem
              key="dashboards"
              startIcon={<FiGrid fontSize={28} />}
              endIcon={isDashboardMenuOpen ? <FiChevronUp fontSize={20} /> : <FiChevronDown fontSize={20} />}
              text="Dashboards"
              tooltip="Dashboards"
              path=""
              disable={!currentProduct}
              selected={isAnyDashboardSelected}
              onClick={() => setIsDashboardMenuOpen((prev) => !prev)}
            />

            {isDashboardMenuOpen &&
              dashboardSubItems.map((item) => (
                <Box key={item.text} sx={{ width: '100%', paddingLeft: '20px', boxSizing: 'border-box', overflow: 'hidden' }}>
                  <SideMenuItem
                    key={item.text}
                    {...item}
                    onClick={() => {
                      void router.push(item.path);
                    }}
                  />
                </Box>
              ))}
          </>
        )
      }
      footer={<UserMenu username={session?.username} />}
    />
  );
}

export default SideMenu;
