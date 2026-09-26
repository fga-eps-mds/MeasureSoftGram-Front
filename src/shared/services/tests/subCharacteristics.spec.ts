import api from '../api';
import { subCharacteristics } from '../subCharacteristics';

jest.mock('../api');

describe('SubCharacteristics service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getRepository should call api.get with the correct URL', async () => {
    const organizationId = 'org-1';
    const productId = 'prod-1';
    const repositoryId = 'repo-1';
    const expectedResponse = { data: { id: repositoryId } };

    (api.get as jest.Mock).mockResolvedValue(expectedResponse);

    const response = await subCharacteristics.getRepository(organizationId, productId, repositoryId);

    expect(api.get).toHaveBeenCalledWith(
      `/v1/organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/`
    );
    expect(response).toBe(expectedResponse);
  });

  it('getHistoricalCharacteristics should call api.get with the correct URL', async () => {
    const props = {
      organizationId: 'org-1',
      productId: 'prod-1',
      repositoryId: 'repo-1',
      entity: 'characteristics'
    };
    const expectedResponse = { data: [{ date: '2026-05-30', value: 42 }] };

    (api.get as jest.Mock).mockResolvedValue(expectedResponse);

    const response = await subCharacteristics.getHistoricalCharacteristics(props);

    expect(api.get).toHaveBeenCalledWith(
      `/v1/organizations/${props.organizationId}` +
        `/products/${props.productId}/repositories/${props.repositoryId}` +
        `/historical-values/${props.entity}/`
    );
    expect(response).toBe(expectedResponse);
  });
});
