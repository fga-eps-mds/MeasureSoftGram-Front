import React, { useEffect, useState } from 'react';
import { BsFillBuildingFill } from 'react-icons/bs';
import { FiRepeat } from 'react-icons/fi';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import LetterAvatar from '@components/LetterAvatar';
import SideMenuItem from '../SideMenuItem';

function OrganizationSelector() {
  const { organizationList, setCurrentOrganization, currentOrganization } = useOrganizationContext();
  const [selectedOrganization, setSelectedOrganization] = useState<number>();

  /*useEffect(() => {
    if (organizationList.length !== 0 && !currentOrganization) {
      setSelectedOrganization(0);
    }
  }, [currentOrganization, organizationList]);*/

  useEffect(() => {
    if (selectedOrganization !== undefined) setCurrentOrganization(organizationList[selectedOrganization]);
  }, [organizationList, selectedOrganization, setCurrentOrganization]);

  return (
    <SideMenuItem
      startIcon={<LetterAvatar name={currentOrganization?.name} icon={<BsFillBuildingFill />} />}
      text={currentOrganization?.name}
      endIcon={<FiRepeat />}
      tooltip="Seleção de organização"
    />
  );
}

export default OrganizationSelector;