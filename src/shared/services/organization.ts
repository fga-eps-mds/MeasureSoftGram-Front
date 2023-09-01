import { AxiosRequestConfig } from 'axios';

/* eslint-disable class-methods-use-this */
class OrganizationQuery {
  getAllOrganization(): AxiosRequestConfig {
    return {
      url: 'organizations/'
    };
  }
}

export const organizationQuery = new OrganizationQuery();
Object.freeze(organizationQuery);
