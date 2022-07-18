import { MeasuresHistory } from '@types/project';
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
    const response = await api.get<MeasuresHistory>(url);
    return response;
  }
}

export const projectQuery = new ProjectQuery();
Object.freeze(projectQuery);
