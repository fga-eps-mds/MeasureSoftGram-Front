import React from 'react';
import { FiBarChart2, FiGitBranch, FiPaperclip, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '@contexts/Auth';
import { Avatar } from '@mui/material';
import SideMenuItem from './SideMenuItem/SideMenuItem';
import SideMenuWrapper from './SideMenuWrapper';

const MenuItems = [
  {
    startIcon: <FiBarChart2 fontSize={28} />,
    text: 'Visão Geral',
    tooltip: 'Visão Geral do Produto'
  },
  {
    startIcon: <FiGitBranch fontSize={28} />,
    text: 'Repositórios',
    tooltip: 'Repositórios do Produto'
  },
  {
    startIcon: <FiPaperclip fontSize={28} />,
    text: 'Releases',
    tooltip: 'Releases de cada repositório'
  }
];

function SideMenu() {
  const { session } = useAuth();

  return (
    <SideMenuWrapper
      menuItems={MenuItems.map((item) => (
        <SideMenuItem key={item.text} startIcon={item.startIcon} text={item.text} tooltip={item.tooltip} />
      ))}
      footer={
        <SideMenuItem
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