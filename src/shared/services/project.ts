/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-return-await */
import { Data } from '@customTypes/preConfig';
import { MeasuresHistory } from '@customTypes/project';
import api from './api';

class ProjectQuery {
  constructor() {}

  async getProjectById(organization_id: string, id: string) {
    const response = await api.get(`/organizations/${organization_id}/repository/${id}/`);
    return response;
  }

  async getAllProjects(organization_id: string) {
    const response = await api.get(`/organizations/${organization_id}/repository/`);
    return response;
  }

  async getProjectMeasuresHistory(organization_id: string, project_id: string) {
    const url = `organizations/${organization_id}/repository/${project_id}/history/measures/`;
    return await api.get<MeasuresHistory>(url);
  }

  async getPreConfig(organization_id: string, product_id: string) {
    return await api.get(`/organizations/${organization_id}/products/${product_id}/current/pre-config/`);
  }

  postPreConfig(organization_id: string, product_id: string, data: { name: string; data: Data }) {
    api.post(`/organizations/${organization_id}/products/${product_id}/create/pre-config/`, data);
  }
}

export const projectQuery = new ProjectQuery();
Object.freeze(projectQuery);
