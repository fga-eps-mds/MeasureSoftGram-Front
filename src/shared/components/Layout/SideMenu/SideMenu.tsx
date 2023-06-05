import React from 'react';
import { FiBarChart2, FiGitBranch, FiPaperclip } from 'react-icons/fi';
import { useAuth } from '@contexts/Auth';
import { useProductContext } from '@contexts/ProductProvider';
import { useRouter } from 'next/router';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import SideMenuItem, { SideMenuProps } from './SideMenuItem/SideMenuItem';
import SideMenuWrapper from './SideMenuWrapper';
import UserMenu from './UserMenu';
import { last } from 'lodash';

type SideMenuItem = {
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

  const MenuItems : SideMenuItem[] = [
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

  return (
    <SideMenuWrapper
      menuItems={
        currentProduct &&
        MenuItems.map((item) => (
          <SideMenuItem
            {...item}
            onClick={() => {
              router.push(item.path);
            }}
          />
        ))
      }
      footer={<UserMenu username={session?.username} />}
    />
  );
}

export default SideMenu;
