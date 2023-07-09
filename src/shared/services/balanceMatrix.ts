/* eslint-disable class-methods-use-this */
import api from './api';

class BalanceMatrixService {
  getBalanceMatrix() {
    return api.get(`balance-matrix`);
  }
}

export const balanceMatrixService = new BalanceMatrixService();
Object.freeze(balanceMatrixService);
