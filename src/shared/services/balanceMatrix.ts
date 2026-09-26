/* eslint-disable class-methods-use-this */
import api from './api';

class BalanceMatrixService {
  getBalanceMatrix() {
    return api.get(`/v1/balance-matrix`);
  }
}

export const balanceMatrixService = new BalanceMatrixService();
Object.freeze(balanceMatrixService);
