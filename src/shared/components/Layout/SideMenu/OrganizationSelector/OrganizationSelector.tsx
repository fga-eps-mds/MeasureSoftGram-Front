import React from 'react';
import { BsFillBuildingFill } from 'react-icons/bs';
import { FiRepeat } from 'react-icons/fi';
import LetterAvatar from '@components/LetterAvatar';
import useBoolean from '@hooks/useBoolean';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import SideMenuItem from '../SideMenuItem';
import SideList from '../SideList';

function OrganizationSelector() {
  const { organizationList, setCurrentOrganizations, currentOrganization } = useOrganizationContext(); // Alterei para setCurrentOrganizations
  const { value: isOpen, setTrue: onClick, setFalse: onClose } = useBoolean(false);

  return (
    <>
      <SideMenuItem
        startIcon={<LetterAvatar name={currentOrganization?.name ?? '?'} icon={<BsFillBuildingFill />} />}
        text={currentOrganization?.name ?? 'Selecione a Organização'}
        endIcon={<FiRepeat />}
        tooltip="Seleção de Organização"
        onClick={onClick}
        selected={false}
      />
      <SideList
        itemType='organization'
        seeMorePath="/products"
        values={organizationList}
        open={isOpen}
        onClose={onClose}
        onClickItem={(organization) => setCurrentOrganizations([organization])} // Alterei para setCurrentOrganizations
      />
    </>
  );
}

export default OrganizationSelector;
