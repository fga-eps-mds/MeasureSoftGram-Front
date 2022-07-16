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
}

export const projectQuery = new ProjectQuery();
Object.freeze(projectQuery);
