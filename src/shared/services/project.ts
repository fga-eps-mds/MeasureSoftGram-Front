import { CurrentPreConfig, MeasuresHistory, ReleaseGoal } from '@customTypes/project';
import { Data } from '@customTypes/preConfig';
import api from './api';

class ProjectQuery {
  async getProjectById(organizationId: string, id: string) {
    return api.get(`/organizations/${organizationId}/products/${id}/`);
  }

  async getAllProjects(organizationId: string) {
    return api.get(`/organizations/${organizationId}/repository/`);
  }

  async getProjectMeasuresHistory(organization_id: string, project_id: string) {
    const url = `organizations/${organization_id}/repository/${project_id}/history/measures/`;
    return api.get<MeasuresHistory>(url);
  }

  async getPreConfig(organization_id: string, product_id: string) {
    return await api.get(`/organizations/${organization_id}/products/${product_id}/current/pre-config/`);
  }

  postPreConfig(organization_id: string, product_id: string, data: { name: string; data: Data }) {
    api.post(`/organizations/${organization_id}/products/${product_id}/create/pre-config/`, data);
  }

  async getProjectCurrentPreConfig(organizationId: string, projectId: string) {
    const url = `organizations/${organizationId}/products/${projectId}/current/pre-config/`;
    return api.get<CurrentPreConfig>(url);
  }

  async createProjectReleaseGoal(organizationId: string, projectId: string, data: ReleaseGoal) {
    const url = `organizations/${organizationId}/products/${projectId}/create/goal/`
    return api.post(url, data);
}

export const projectQuery = new ProjectQuery();
Object.freeze(projectQuery: ProjectQuery);
