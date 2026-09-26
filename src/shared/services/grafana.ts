import api from './api';

export interface GrafanaDashboardUrl {
  dashboard_uid: string;
  title: string;
  grafana_url: string;
  product_id: number;
  repository: { id: number; name: string } | null;
}

export const grafanaService = {
  getDashboardUrl: (uid: string, productId: number, repositoryId?: number) =>
    api.get<GrafanaDashboardUrl>(`/v1/grafana/dashboard/${uid}/`, {
      params: {
        product_id: productId,
        ...(repositoryId ? { repository_id: repositoryId } : {}),
      },
    }),
};
