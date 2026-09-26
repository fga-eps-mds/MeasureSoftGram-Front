import api from '../api';

describe('API Interceptors', () => {
  let requestSuccess: any;
  let requestError: any;
  let responseSuccess: any;
  let responseError: any;

  const originalLocation = window.location;

  beforeAll(() => {
    requestSuccess = (api.interceptors.request as any).handlers[0].fulfilled;
    requestError = (api.interceptors.request as any).handlers[0].rejected;
    responseSuccess = (api.interceptors.response as any).handlers[0].fulfilled;
    responseError = (api.interceptors.response as any).handlers[0].rejected;

    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
    window.location.href = '';
  });

  describe('Request Interceptor', () => {
    it('deve adicionar o token de autorização no header se ele existir no localStorage', async () => {
      const tokenString = JSON.stringify('meu-token-falso');
      (Storage.prototype.getItem as jest.Mock).mockReturnValue(tokenString);

      const config = { headers: {} };
      const result = await requestSuccess(config);

      expect(Storage.prototype.getItem).toHaveBeenCalledWith('token');
      expect(result.headers.Authorization).toBe('Token meu-token-falso');
    });

    it('não deve adicionar o token se ele não existir no localStorage', async () => {
      (Storage.prototype.getItem as jest.Mock).mockReturnValue(null);

      const config = { headers: {} };
      const result = await requestSuccess(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('não deve quebrar a aplicação se config.headers não estiver definido', async () => {
      const tokenString = JSON.stringify('meu-token-falso');
      (Storage.prototype.getItem as jest.Mock).mockReturnValue(tokenString);

      const config = {};
      const result = await requestSuccess(config);

      expect(result.headers).toBeUndefined();
    });

    it('não deve tentar acessar localStorage se o window for undefined (ambiente de servidor)', async () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const config = { headers: {} };
      const result = await requestSuccess(config);

      expect(Storage.prototype.getItem).not.toHaveBeenCalled();
      expect(result.headers?.Authorization).toBeUndefined();

      global.window = originalWindow;
    });

    it('deve rejeitar a promise em caso de erro no request', async () => {
      const mockError = new Error('Erro genérico no request');
      await expect(requestError(mockError)).rejects.toThrow('Erro genérico no request');
    });
  });

  describe('Response Interceptor', () => {
    it('deve simplesmente retornar o response em caso de sucesso', () => {
      const mockResponse = { data: 'sucesso', status: 200 };
      const result = responseSuccess(mockResponse);

      expect(result).toEqual(mockResponse);
    });

    it('deve limpar o localStorage e redirecionar para /auth se o erro for 401', async () => {
      const mockError = { response: { status: 401 } };

      await expect(responseError(mockError)).rejects.toEqual(mockError);

      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('token');
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('session');
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('provider');
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('login_timestamp');
      expect(window.location.href).toBe('/auth');
    });

    it('não deve limpar o localStorage nem redirecionar se o status do erro não for 401', async () => {
      const mockError = { response: { status: 500 } };

      await expect(responseError(mockError)).rejects.toEqual(mockError);

      expect(Storage.prototype.removeItem).not.toHaveBeenCalled();
      expect(window.location.href).toBe('');
    });

    it('não deve tentar executar ações do browser se window for undefined no erro 401', async () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const mockError = { response: { status: 401 } };
      await expect(responseError(mockError)).rejects.toEqual(mockError);

      expect(Storage.prototype.removeItem).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });
});

describe('api client baseURL', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.SERVICE_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses NEXT_PUBLIC_API_URL when defined (client-side exposed var)', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.test/api/v1';

    const api = require('../api').default;

    expect(api.defaults.baseURL).toBe('https://api.example.test/api/v1');
  });

  it('falls back to SERVICE_URL when NEXT_PUBLIC_API_URL is absent', () => {
    process.env.SERVICE_URL = 'https://service.example.test/api/v1';

    const api = require('../api').default;

    expect(api.defaults.baseURL).toBe('https://service.example.test/api/v1');
  });

  it('prefers NEXT_PUBLIC_API_URL over SERVICE_URL when both are set', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://public.example.test/api/v1';
    process.env.SERVICE_URL = 'https://service.example.test/api/v1';

    const api = require('../api').default;

    expect(api.defaults.baseURL).toBe('https://public.example.test/api/v1');
  });
});
