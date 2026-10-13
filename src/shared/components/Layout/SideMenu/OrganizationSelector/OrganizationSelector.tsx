import React from 'react';
import { BsFillBuildingFill } from 'react-icons/bs';
import LetterAvatar from '@components/LetterAvatar';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useSideMenuContext } from '@contexts/SidebarProvider/SideMenuProvider';
import { Organization } from '@customTypes/organization';
import { useProviderTranslation as useTranslation } from '@hooks/useProviderTranslation';
import SideMenuItem from '../SideMenuItem';
import MSGSelectBox from '../../../../../components/idv/inputs/MSGSelectBox';
import { useProviderTerms } from '@hooks/useProviderTerms';

function OrganizationSelector() {
  const { terms } = useProviderTerms();
  const { organizationList, setCurrentOrganizations, currentOrganization } = useOrganizationContext();
  const { isCollapsed, toggleCollapse } = useSideMenuContext();

  const onChange = (value: Organization) => {
    if (organizationList) {
      const selectedOrganization = organizationList.find(organization => organization.id === value.id);
      if (selectedOrganization) {
        setCurrentOrganizations([selectedOrganization]);
      } else {
        setCurrentOrganizations([]);
      }
    }
  };

  const { t } = useTranslation('sidebar');

  return (
    <>
      {!isCollapsed ?
        <MSGSelectBox
          label={t('organization.placeholder')}
          width="98%"
          options={organizationList ?? []}
          onChange={onChange}
          value={currentOrganization?.id}
        /> :
        <SideMenuItem
          startIcon={<LetterAvatar name={currentOrganization?.name ?? '?'} icon={<BsFillBuildingFill color="#ffffff" />} />}
          text={currentOrganization?.name ?? `Selecione ${terms.theOrganization}`}
          tooltip={t("tooltip.organization-selection")}
          onClick={() => toggleCollapse()}
          selected={false}
        />
      }
    </>
  );
}

export default OrganizationSelector;
