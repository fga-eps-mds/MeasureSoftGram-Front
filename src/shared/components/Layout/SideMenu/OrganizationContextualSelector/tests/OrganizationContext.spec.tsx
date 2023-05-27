import '@testing-library/jest-dom';

import React from 'react';

import { render,  } from '@testing-library/react';
import OrganizationContextSelector from '../OrganizationContextualSelector';
import { Organization } from '@customTypes/organization';
import { OrganizationProvider, useOrganizationContext } from '@contexts/OrganizationProvider';
import api from '@services/api' 

// type OrgStor = Pick <Organization, 'id' | 'name'>;

let org: Organization;

describe('<OrganizationContextualSelector />', () => {
  beforeAll(() => {
    org = {name: 'Test Org', id: 'testId', key: 'keyTest', description:'desc', url: 'test', products: ['prod']}
    jest.spyOn(api, 'get').mockResolvedValue({
      "results": [org] 
    })
  });

  describe('Snapshot', () => {
    it('No organization must correspond to the Snapshot', () => {
      const tree = render(<OrganizationContextSelector />) ;
      expect(tree).toMatchSnapshot();
    });

    it('With organization must correspond to the Snapshot', () => {
      
      const tree = render(
        <OrganizationProvider>
          <OrganizationContextSelector />
        </OrganizationProvider>
      );
     const {setCurrentOrganization: setOrg} = useOrganizationContext();
      setOrg(org)
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Context Behaviour', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("Mustn't be rendered if the context isn't set", () => {
      const {queryByText} = render(
        <OrganizationProvider>
          <OrganizationContextSelector />
        </OrganizationProvider>
      );

      const {setCurrentOrganization: setOrg} = useOrganizationContext();
      setOrg({} as Organization);

      expect(queryByText('Selecione Organização')).toBeVisible();
      expect(queryByText('Selecione Organização')).toBeEnabled();
    });

    it("Renders with context info.", () => {
      const {queryByText} = render(
        <OrganizationProvider>
          <OrganizationContextSelector />
        </OrganizationProvider>
      );

      const {setCurrentOrganization: setOrg} = useOrganizationContext();
      setOrg(org);
;
      expect(queryByText(org.name)).toBeVisible();
      expect(queryByText(org.name)).toBeEnabled();
    });
  })
})