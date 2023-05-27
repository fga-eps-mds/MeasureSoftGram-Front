import React, { useEffect, useRef, useState } from 'react';
import { BsFillBuildingFill } from 'react-icons/bs';
import { FiRepeat } from 'react-icons/fi';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import LetterAvatar from '@components/LetterAvatar';
import SideMenuItem from '../SideMenuItem';
import ListSide from '../ListSide/ListSide';

function OrganizationSelector() {
  const { organizationList, setCurrentOrganization, currentOrganization } = useOrganizationContext();
  const [selectedOrganization, setSelectedOrganization] = useState<number>();
  const [toggleOpen, setToggle] = useState(false);

  useEffect(() => {
    if (organizationList.length !== 0 && !currentOrganization) {
      setSelectedOrganization(0);
    }
  }, [currentOrganization, organizationList]);

  useEffect(() => {
    if (selectedOrganization !== undefined) setCurrentOrganization(organizationList[selectedOrganization]);
  }, [organizationList, selectedOrganization, setCurrentOrganization]);

  const handleClose = () => {
    setToggle(!toggleOpen);
  }

  return (
    <SideMenuItem 
      type='drawer'
      handleClose={handleClose} 
      startIcon={<LetterAvatar name={currentOrganization?.name} icon={<BsFillBuildingFill />} />}
      text={currentOrganization?.name ? currentOrganization.name : 'Selecione a organização'}
      endIcon={<FiRepeat />}
      tooltip="Seleção de organização"
      openState={toggleOpen}
      children={<ListSide title='Selecione sua Organização' orgs={organizationList} handleSelection={(item) => {setCurrentOrganization(item);}} />}
    />
  );
}

export default OrganizationSelector;