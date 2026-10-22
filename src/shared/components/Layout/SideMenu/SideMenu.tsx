import React, { useEffect, useState } from 'react';
import {
  FiAlignLeft,
  FiBarChart,
  FiBarChart2,
  FiGitBranch,
  FiPaperclip,
  FiGrid,
  FiLink,
  FiChevronDown,
  FiChevronUp,
  FiPieChart,
  FiTrendingUp,
  FiShare2,
} from 'react-icons/fi';
import { useAuth } from '@contexts/Auth';
import { useProductContext } from '@contexts/ProductProvider';
import { useRouter } from 'next/router';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProviderTranslation as useTranslation } from '@hooks/useProviderTranslation';
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
    {
      startIcon: <FiShare2 fontSize={24} />,
      text: '3. Metamodelo',
      tooltip: 'Metamodelo',
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/dashboards/metamodelo`,
      disable: !currentProduct,
      selected: router.pathname === '/products/[product]/dashboards/metamodelo',
    },
    {
      startIcon: <FiAlignLeft fontSize={24} />,
      text: '4. Análise por Entidade',
      tooltip: 'Análise por Entidade',
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/dashboards/entidade`,
      disable: !currentProduct,
      selected: router.pathname === '/products/[product]/dashboards/entidade',
    },
    {
      startIcon: <FiBarChart fontSize={24} />,
      text: '5. Distribuição Estatística',
      tooltip: 'Distribuição Estatística',
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/dashboards/distribuicao`,
      disable: !currentProduct,
      selected: router.pathname === '/products/[product]/dashboards/distribuicao',
    },
    {
      startIcon: <FiLink fontSize={24} />,
      text: '6. Relações e Correlações',
      tooltip: 'Relações e Correlações',
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/dashboards/relacoes`,
      disable: !currentProduct,
      selected: router.pathname === '/products/[product]/dashboards/relacoes',
    },
  ];

  const isAnyDashboardSelected = router.pathname?.includes('/dashboards/') ?? false;

  // O menu navega com router.push, que não adianta o JS da página como o <Link> faz: sem o prefetch, cada aba
  // só começava a baixar o próprio código depois do clique. No `next dev` o prefetch não faz nada.
  const prefetchPaths = currentProduct ? [...MenuItems, ...dashboardSubItems].map((item) => item.path).join('\n') : '';
  useEffect(() => {
    if (!prefetchPaths) return undefined;
    const prefetchAll = () =>
      prefetchPaths.split('\n').forEach((path) => {
        router.prefetch?.(path)?.catch(() => {
          // sem prefetch, a página baixa no clique, como antes
        });
      });
    // só quando o navegador fica ocioso, como o <Link>: o código das outras abas não disputa a rede com a página aberta
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(prefetchAll, { timeout: 3000 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(prefetchAll, 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefetchPaths]);

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
