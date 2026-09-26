import { grafanaService } from '../grafana';
import api from '../api';

jest.mock('../api');

describe('grafanaService', () => {
  it('getDashboardUrl calls api.get with correct URL and product_id param', async () => {
    await grafanaService.getDashboardUrl('my-uid', 42);
    expect(api.get).toHaveBeenCalledWith('/v1/grafana/dashboard/my-uid/', {
      params: { product_id: 42 },
    });
  });

  it('getDashboardUrl includes repository_id param when provided', async () => {
    await grafanaService.getDashboardUrl('my-uid', 42, 7);
    expect(api.get).toHaveBeenCalledWith('/v1/grafana/dashboard/my-uid/', {
      params: { product_id: 42, repository_id: 7 },
    });
  });

  it('getDashboardUrl omits repository_id when undefined', async () => {
    await grafanaService.getDashboardUrl('my-uid', 1, undefined);
    expect(api.get).toHaveBeenCalledWith('/v1/grafana/dashboard/my-uid/', {
      params: { product_id: 1 },
    });
  });
});
