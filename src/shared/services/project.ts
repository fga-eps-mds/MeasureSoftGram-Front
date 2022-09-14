/* eslint-disable class-methods-use-this */
import { PreConfigEntitiesRelationship, MeasuresHistory, ReleaseGoal, RepositoriesSqcHistory } from '@customTypes/project';
import { Data } from '@customTypes/preConfig';
import api from './api';

class ProjectQuery {
  async getProjectById(organizationId: string, id: string) {
    return api.get(`/organizations/${organizationId}/products/${id}/`);
  }

  async getAllProjects(organizationId: string) {
    return api.get(`/organizations/${organizationId}/repository/`);
  }

  async getProjectMeasuresHistory(organizationId: string, projectId: string) {
    const url = `organizations/${organizationId}/repository/${projectId}/history/measures/`;
    return api.get<MeasuresHistory>(url);
  }

  async getPreConfig(organizationId: string, productId: string) {
    return api.get(`/organizations/${organizationId}/products/${productId}/current/pre-config/`);
  }

  postPreConfig(organizationId: string, productId: string, data: { name: string; data: Data }) {
    api.post(`/organizations/${organizationId}/products/${productId}/create/pre-config/`, data);
  }

  async getPreConfigEntitiesRelationship(organizationId: string, projectId: string) {
    const url = `organizations/${organizationId}/products/${projectId}/entity-relationship-tree/`;
    return api.get<Array<PreConfigEntitiesRelationship>>(url);
  }

  async createProjectReleaseGoal(organizationId: string, projectId: string, data: ReleaseGoal) {
    const url = `organizations/${organizationId}/products/${projectId}/create/goal/`;
    return api.post(url, data);
  }

  async getProductRepositoriesSqcHistory(organizationId: string, productId: string) {
    const url = `organizations/${organizationId}/products/${productId}/repositories-sqc-historical-values/`;
    return api.get<RepositoriesSqcHistory>(url);
  }
}

export const projectQuery = new ProjectQuery();
Object.freeze(projectQuery);
