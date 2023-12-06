import { ReleaseGoal } from '@customTypes/product';
import { responsivePropType } from '@mui/system';
import { productQuery } from '..';
import api from '../api';

jest.mock('../api');

describe('ProductQuery', () => {
  it('getAllProducts should call api.get with the right URL', async () => {
    const organizationId = '1';
    await productQuery.getAllProducts(organizationId);
    expect(api.get).toHaveBeenCalledWith(`/organizations/${organizationId}/products/`);
  });

  it('getProductById should call api.get with the right URL', async () => {
    const organizationId = '1';
    const id = '2';
    await productQuery.getProductById(organizationId, id);
    expect(api.get).toHaveBeenCalledWith(`/organizations/${organizationId}/products/${id}/`);
  });

  it('updateProduct should call api.get with the right URL', async () => {
    const organizationId = 1;
    const id = '2';
    await productQuery.updateProduct(id, { name: 'teste', organizationId: organizationId });
    expect(api.put).toHaveBeenCalledWith(`/organizations/${organizationId}/products/${id}/`, {
      name: 'teste',
      organizationId: 1
    });
  });

  it('getAllRepositories should call api.get with the right URL', async () => {
    const organizationId = '1';
    const productId = '2';
    await productQuery.getAllRepositories(organizationId, productId);
    expect(api.get).toHaveBeenCalledWith(`/organizations/${organizationId}/products/${productId}/repositories`);
  });

  it('getProductMeasuresHistory should call api.get with the right URL', async () => {
    const organizationId = '1';
    const productId = '2';
    await productQuery.getProductMeasuresHistory(organizationId, productId);
    expect(api.get).toHaveBeenCalledWith(`organizations/${organizationId}/repository/${productId}/history/measures/`);
  });

  it('postPreConfig should call api.post with the right URL and data', async () => {
    const organizationId = '1';
    const productId = '2';
    const data = {
      name: 'test',
      data: {
        characteristics: [],
        test: 'test'
      }
    };

    await productQuery.postPreConfig(organizationId, productId, data);

    expect(api.post).toHaveBeenCalledWith(
      `/organizations/${organizationId}/products/${productId}/create/pre-config/`,
      data
    );
  });

  it('getProductCurrentPreConfig should call api.get with the right URL', async () => {
    const organizationId = '1';
    const productId = '2';
    await productQuery.getProductCurrentPreConfig(organizationId, productId);
    expect(api.get).toHaveBeenCalledWith(`organizations/${organizationId}/products/${productId}/current/pre-config/`);
  });

  it('getPreConfigEntitiesRelationship should call api.get with the right URL', async () => {
    const organizationId = '1';
    const projectId = '2';
    await productQuery.getPreConfigEntitiesRelationship(organizationId, projectId);
    expect(api.get).toHaveBeenCalledWith(
      `organizations/${organizationId}/products/${projectId}/entity-relationship-tree/`
    );
  });

  it('createProductReleaseGoal should call api.post with the right URL and data', async () => {
    const organizationId = '1';
    const productId = '2';
    const data = {
      release_name: 'release teste',
      start_at: new Date().toISOString(),
      end_at: new Date().toISOString(),
      changes: []
    } as unknown as ReleaseGoal;
    await productQuery.createProductGoal(organizationId, productId, data);
    expect(api.post).toHaveBeenCalledWith(`organizations/${organizationId}/products/${productId}/create/goal/`, data);
  });

  it('getCharacteristicsLatestValues should call api.get with the right URL', async () => {
    const organizationId = '1';
    const productId = '2';
    const repositoryId = '3';
    await productQuery.getCharacteristicsLatestValues(organizationId, productId, repositoryId);
    expect(api.get).toHaveBeenCalledWith(
      `organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/latest-values/characteristics/`
    );
  });

  it('getSubcharacteristicsLatestValues should call api.get with the right URL', async () => {
    const organizationId = '1';
    const productId = '2';
    const repositoryId = '3';
    await productQuery.getSubcharacteristicsLatestValues(organizationId, productId, repositoryId);
    expect(api.get).toHaveBeenCalledWith(
      `organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/latest-values/subcharacteristics/`
    );
  });

  it('getMeasuresLatestValues should call api.get with the right URL', async () => {
    const organizationId = '1';
    const productId = '2';
    const repositoryId = '3';
    await productQuery.getMeasuresLatestValues(organizationId, productId, repositoryId);
    expect(api.get).toHaveBeenCalledWith(
      `organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/latest-values/measures/`
    );
  });

  // create test to getMetricsLatestValues
  it('getMetricsLatestValues should call api.get with the right URL', async () => {
    const organizationId = '1';
    const productId = '2';
    const repositoryId = '3';
    await productQuery.getMetricsLatestValues(organizationId, productId, repositoryId);
    expect(api.get).toHaveBeenCalledWith(
      `organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/latest-values/metrics/`
    );
  });
  it('should return a proper AxiosRequestConfig object', () => {
    const organizationId = '1';
    const productId = '2';
    const expectedResult = {
      url: `organizations/${organizationId}/products/${productId}/create/release/`,
      method: 'get'
    };

    expect(productQuery.getReleaseList(organizationId, productId)).toEqual(expectedResult);
  });

  it('getCurrentReleaseGoal should call api.get with the right URL', async () => {
    const organizationId = '1';
    const productId = '2';
    await productQuery.getCurrentReleaseGoal(organizationId, productId);
    expect(api.get).toHaveBeenCalledWith(`organizations/${organizationId}/products/${productId}/current/goal/`);
  });

  it('getCompareGoalAccomplished should call api.get with the right URL', async () => {
    const organizationId = '1';
    const productId = '2';
    const releaseId = 3;
    await productQuery.getCompareGoalAccomplished(organizationId, productId, releaseId);
    expect(api.get).toHaveBeenCalledWith(`organizations/${organizationId}/products/${productId}/all/goal/`, {
      params: { release_id: releaseId }
    });
  });

  it('getProductRepositoriesTsqmiHistory should call api.get with the right URL', async () => {
    const organizationId = '1';
    const productId = '2';
    await productQuery.getProductRepositoriesTsqmiHistory(organizationId, productId);
    expect(api.get).toHaveBeenCalledWith(
      `organizations/${organizationId}/products/${productId}/repositories-tsqmi-historical-values/`
    );
  });

  it('getCurrentGoal should call api.get with the right URL', async () => {
    const organizationId = '1';
    const id = '2';
    const releaseId = 3;
    await productQuery.getCurrentGoal(organizationId, id, releaseId);
    expect(api.get).toHaveBeenCalledWith(`organizations/${organizationId}/products/${id}/current/goal/`, {
      params: { release_id: releaseId }
    });
  });

  it('createProduct should call api.get with the right URL', async () => {
    const organizationId = 1;
    await productQuery.createProduct({ name: 'teste', organizationId: organizationId });
    expect(api.post).toHaveBeenCalledWith(`/organizations/${organizationId}/products/`, {
      name: 'teste',
      organizationId: organizationId
    });
  });

  it('deleteProduct should call api.get with the right URL', async () => {
    const organizationId = '1';
    const id = '2';
    await productQuery.deleteProduct(id, organizationId);
    expect(api.delete).toHaveBeenCalledWith(`/organizations/${organizationId}/products/${id}/`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
