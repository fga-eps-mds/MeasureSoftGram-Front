import { balanceMatrixService } from '..';
import api from '../api';

jest.mock('../api');

describe('BalanceMatrix', () => {
  it('should call api.get with the right URL', async () => {
    await balanceMatrixService.getBalanceMatrix();
    expect(api.get).toHaveBeenCalledWith('balance-matrix');
  });
});
