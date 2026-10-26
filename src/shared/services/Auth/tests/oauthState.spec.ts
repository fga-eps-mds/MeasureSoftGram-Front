import { consumeOAuthState, createOAuthState, OAUTH_STATE_KEY, OAUTH_STATE_TTL_MS } from '../oauthState';

describe('oauthState', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  describe('createOAuthState', () => {
    it('devolve um nonce de 128 bits em hexadecimal', () => {
      expect(createOAuthState('github')).toMatch(/^[0-9a-f]{32}$/);
    });

    it('gera um nonce diferente a cada tentativa', () => {
      expect(createOAuthState('github')).not.toBe(createOAuthState('github'));
    });

    it('guarda o nonce, o provedor e a página de retorno no sessionStorage', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1000);

      const nonce = createOAuthState('gitlab', '/products');

      expect(JSON.parse(sessionStorage.getItem(OAUTH_STATE_KEY) as string)).toEqual({
        nonce,
        provider: 'gitlab',
        returnTo: '/products',
        expiresAt: 1000 + OAUTH_STATE_TTL_MS
      });
    });

    it('não coloca a página de retorno no state', () => {
      expect(createOAuthState('github', '/products')).not.toContain('products');
    });

    it('lança erro quando o sessionStorage está indisponível', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });

      expect(() => createOAuthState('github')).toThrow();
    });
  });

  describe('consumeOAuthState', () => {
    it('devolve o provedor e a página de retorno quando o state confere', () => {
      const nonce = createOAuthState('github', '/products');

      expect(consumeOAuthState(nonce)).toEqual({ provider: 'github', returnTo: '/products' });
    });

    it('devolve returnTo nulo quando o login não informou página de retorno', () => {
      const nonce = createOAuthState('gitlab');

      expect(consumeOAuthState(nonce)).toEqual({ provider: 'gitlab', returnTo: null });
    });

    it('aceita o state uma única vez', () => {
      const nonce = createOAuthState('github');

      consumeOAuthState(nonce);

      expect(consumeOAuthState(nonce)).toBeNull();
      expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
    });

    it.each([
      ['ausente', null],
      ['vazio', ''],
      ['divergente', 'forjado']
    ])('rejeita state %s e descarta o registro', (_, received) => {
      createOAuthState('github');

      expect(consumeOAuthState(received)).toBeNull();
      expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
    });

    it('rejeita quando nenhum login foi iniciado nesta aba', () => {
      expect(consumeOAuthState('qualquer')).toBeNull();
    });

    it('rejeita state expirado', () => {
      const now = jest.spyOn(Date, 'now').mockReturnValue(1000);
      const nonce = createOAuthState('github');
      now.mockReturnValue(1000 + OAUTH_STATE_TTL_MS + 1);

      expect(consumeOAuthState(nonce)).toBeNull();
    });

    it('rejeita registro corrompido', () => {
      sessionStorage.setItem(OAUTH_STATE_KEY, '{corrompido');

      expect(consumeOAuthState('qualquer')).toBeNull();
      expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
    });

    it('rejeita provedor desconhecido no registro', () => {
      sessionStorage.setItem(
        OAUTH_STATE_KEY,
        JSON.stringify({ nonce: 'abc', provider: 'credentials', returnTo: null, expiresAt: Date.now() + 1000 })
      );

      expect(consumeOAuthState('abc')).toBeNull();
    });

    it.each(['//example.com', '/\\example.com', 'https://example.com', 'products'])(
      'descarta página de retorno fora do site (%s)',
      (returnTo) => {
        const nonce = createOAuthState('github', returnTo);

        expect(consumeOAuthState(nonce)).toEqual({ provider: 'github', returnTo: null });
      }
    );

    it('rejeita quando o sessionStorage está indisponível', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });

      expect(consumeOAuthState('qualquer')).toBeNull();
    });
  });
});
