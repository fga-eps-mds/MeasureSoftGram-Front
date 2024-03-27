import React, { useEffect } from 'react';
import { BsFillBuildingFill } from 'react-icons/bs';
import { FiRepeat } from 'react-icons/fi';
import LetterAvatar from '@components/LetterAvatar';
import useBoolean from '@hooks/useBoolean';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useSideMenuContext } from '@contexts/SidebarProvider/SideMenuProvider';
import SideMenuItem from '../SideMenuItem';
import SideList from '../SideList';
import { Organization } from '@customTypes/organization';

function OrganizationSelector() {
  const { organizationList, setCurrentOrganizations, currentOrganization, fetchOrganizations } = useOrganizationContext();
  const { isCollapsed, toggleCollapse } = useSideMenuContext();
  const { value: isOpen, setTrue: openMenu, setFalse: onClose } = useBoolean(false);

  const onClickItem = (organization: Organization) => {
    setCurrentOrganizations([organization]);
    onClose();
    console.log("Toggling collapse state from:", isCollapsed);
    toggleCollapse();
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrganizations();
    }
  }, [isOpen, fetchOrganizations]);

  return (
    <>
      <SideMenuItem
        startIcon={<LetterAvatar name={currentOrganization?.name ?? '?'} icon={<BsFillBuildingFill />} />}
        text={currentOrganization?.name ?? 'Selecione a Organização'}
        endIcon={<FiRepeat />}
        tooltip="Seleção de Organização"
        onClick={openMenu}
        selected={false}
      />
      <SideList
        itemType='organization'
        seeMorePath="/products"
        values={organizationList ?? []}
        open={isOpen}
        onClose={onClose}
        onClickItem={onClickItem}
      />
    </>
  );
}

export default OrganizationSelector;
