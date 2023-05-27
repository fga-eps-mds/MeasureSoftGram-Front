import React from 'react';
import { FiBarChart2, FiGitBranch, FiPaperclip, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '@contexts/Auth';
import { Avatar } from '@mui/material';
import SideMenuItem, { ContextControl } from './SideMenuItem/SideMenuItem';
import SideMenuWrapper from './SideMenuWrapper';
import { useProductContext } from '@contexts/ProductProvider';
import { useRouter } from 'next/router';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';

function SideMenu() {
  const { session } = useAuth();
  const {currentOrganization} = useOrganizationContext();
  const {currentProduct} = useProductContext();
  const {currentRepository} = useRepositoryContext();
  const router = useRouter();

  const MenuItems = [
    {
      startIcon: <FiBarChart2 fontSize={28} />,
      text: 'Visão Geral',
      tooltip: 'Visão Geral do Produto',
      type: 'route',
      depends: 'product',
      path: '/products',
    },
    {
      startIcon: <FiGitBranch fontSize={28} />,
      text: 'Repositórios',
      tooltip: 'Repositórios do Produto',
      type: 'route',
      depends: 'product',
      path: `/products/${router?.query?.products}/`,
    },
    {
      startIcon: <FiPaperclip fontSize={28} />,
      text: 'Releases',
      tooltip: 'Releases de cada repositório',
      type: 'route',
      depends: 'repository',
      path: `/products/${currentProduct?.id}-${currentProduct?.name}/releases`,
    }
  ];

  return (
    <SideMenuWrapper
      menuItems={currentProduct && MenuItems.map((item) => (
        <SideMenuItem 
          context={item.depends as ContextControl}
          key={item.text}
          handlePath={() => {
            if (!item.path.match('(undefined|null)'))
              router.push(item.path);
          }}
          openState={false} 
          optype={item.type === 'route' ? 'route': 'wrong'} 
          startIcon={item.startIcon} 
          text={item.text} tooltip={item.tooltip} />
      ))}
      footer={
        <SideMenuItem
          openState={false}
          context={'organization'}
          optype='route'
          startIcon={<Avatar sx={{ width: 34, height: 34, backgroundColor: '#000' }} />}
          text={session?.username || '???'}
          tooltip="Menu de usuário"
          endIcon={<FiChevronRight fontSize={28} />}
        />
      }
    />
  );
}

export default SideMenu;