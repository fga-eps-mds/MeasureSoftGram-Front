type OAuthProvider = Exclude<Providers, 'credentials'>;

export interface OAuthStateContext {
  provider: OAuthProvider;
  returnTo: string | null;
}

interface StoredOAuthState extends OAuthStateContext {
  nonce: string;
  expiresAt: number;
}

export const OAUTH_STATE_KEY = 'msgram_oauth_state';
// Mesma validade do code emitido pelo GitHub.
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const NONCE_BYTES = 16;
const OAUTH_PROVIDERS = new Set<OAuthProvider>(['github', 'gitlab']);

// getRandomValues, e nao randomUUID, porque este nao existe fora de contexto seguro.
const generateNonce = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(NONCE_BYTES)), (byte) => byte.toString(16).padStart(2, '0')).join('');

// '//host' e '/\host' o navegador trata como outro dominio.
const isInternalPath = (path: unknown): path is string =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\');

// O registro e apagado em qualquer leitura (uso unico). Storage indisponivel ou
// registro corrompido contam como ausencia de state: o callback e rejeitado.
const takeStoredState = (): StoredOAuthState | null => {
  try {
    const raw = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Gera o state do OAuth e guarda o contexto do login nesta aba. Lança erro se o sessionStorage estiver indisponível. */
export const createOAuthState = (provider: OAuthProvider, returnTo?: string): string => {
  const stored: StoredOAuthState = {
    nonce: generateNonce(),
    provider,
    returnTo: returnTo ?? null,
    expiresAt: Date.now() + OAUTH_STATE_TTL_MS
  };
  sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify(stored));

  return stored.nonce;
};

/** Valida o state recebido no callback. Devolve o contexto do login, ou null se o callback não foi iniciado por esta aba. */
export const consumeOAuthState = (received: string | null): OAuthStateContext | null => {
  const stored = takeStoredState();

  if (!received || stored?.nonce !== received) return null;
  if (Date.now() > stored.expiresAt || !OAUTH_PROVIDERS.has(stored.provider)) return null;

  return {
    provider: stored.provider,
    returnTo: isInternalPath(stored.returnTo) ? stored.returnTo : null
  };
};
