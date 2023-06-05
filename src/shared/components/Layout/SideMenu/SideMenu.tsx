import React from 'react';
import { FiBarChart2, FiGitBranch, FiPaperclip } from 'react-icons/fi';
import { useAuth } from '@contexts/Auth';
import { useProductContext } from '@contexts/ProductProvider';
import { useRouter } from 'next/router';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import SideMenuItem from './SideMenuItem/SideMenuItem';
import SideMenuWrapper from './SideMenuWrapper';
import UserMenu from './UserMenu';

type SideMenuItemType = {
  startIcon: React.ReactElement;
  text: string;
  tooltip: string; 
  path: string;
  disable: boolean; 
}

function SideMenu() {
  const { session } = useAuth();
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();
  const { currentRepository } = useRepositoryContext();
  const router = useRouter();

  const MenuItems : SideMenuItemType[] = [
    {
      startIcon: <FiBarChart2 fontSize={28} />,
      text: 'Visão Geral',
      tooltip: 'Visão Geral do Produto',
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}`,
      disable: !currentOrganization
    },
    {
      startIcon: <FiGitBranch fontSize={28} />,
      text: 'Repositórios',
      tooltip: 'Repositórios do Produto',
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/repositories`,
      disable: !currentProduct
    },
    {
      startIcon: <FiPaperclip fontSize={28} />,
      text: 'Releases',
      tooltip: 'Releases de cada repositório',
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/releases`,
      disable: !currentRepository
    }
  ];

  const hasAny = (item: string) : boolean => {
    let ans = false;
    if (item && item !== undefined) {
      ['prod', 'repo', 'relea'].forEach((it) => {
        if(item.toLowerCase().includes(it)) ans = true;
      })
    }

    return ans;
  }

  const compareContext = (item: SideMenuItemType) => {
    const last2routes = router.asPath.split('/').slice(-2)
    if (last2routes.includes('')) return false;
    const checks = last2routes.map<boolean>(
        (it) => {
          const nameCheck = item.text.toLowerCase().slice(0, 4);
          if (nameCheck === 'visã') return it.includes('product');
          return it.includes(nameCheck);
        });
    if (checks.includes(true)) {
      if(last2routes
        && last2routes.length > 1 
        && hasAny(last2routes[1]) || hasAny(last2routes[0])) {
          return true; 
      }
    }

    return false;
  }

  return (
    <SideMenuWrapper
      menuItems={
        currentProduct &&
        MenuItems.map((item) => (
          <SideMenuItem
            {...item}
            onClick={async () => {
              await router.push(item.path);
            }}
            inContext={compareContext(item)}
          />
        ))
      }
      footer={<UserMenu username={session?.username} />}
    />
  );
}

export default SideMenu;