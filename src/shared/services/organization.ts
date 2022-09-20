/* eslint-disable class-methods-use-this */
import api from './api';

class Organization {
  getAllOrganization() {
    return api.get(`organizations/`);
  }
}

export const organization = new Organization();
Object.freeze(organization);
