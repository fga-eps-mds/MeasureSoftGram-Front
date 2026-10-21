import type { BackendModule, ReadCallback } from 'i18next';

type Resources = Record<string, object>;

const LOADERS: Record<string, () => Promise<{ default: Resources }>> = {
  en: () => import('./locales/en'),
  pt: () => import('./locales/pt')
};

const loaded: Record<string, Promise<Resources>> = {};

/** As traduções de um idioma, baixadas uma vez só (um chunk do webpack por idioma). */
export function loadLanguage(language: string): Promise<Resources> {
  const loader = LOADERS[language];
  if (!loader) return Promise.resolve({});
  if (!loaded[language]) {
    loaded[language] = loader()
      .then((module) => module.default)
      .catch((error) => {
        // sem rede agora: a próxima leitura tenta de novo
        delete loaded[language];
        throw error;
      });
  }
  return loaded[language];
}

/**
 * Backend do i18next com as traduções no bundle. O backend HTTP padrão do ni18n pedia um JSON por namespace e idioma
 * (26 requisições numa carga, servidas de /locales com max-age=0); aqui cada idioma é um chunk de /_next/static,
 * pedido uma vez e guardado em cache pelo navegador.
 */
const bundledBackend: BackendModule = {
  type: 'backend',
  init() {},
  read(language: string, namespace: string, callback: ReadCallback) {
    loadLanguage(language)
      .then((resources) => callback(null, (resources[namespace] ?? {}) as Parameters<ReadCallback>[1]))
      .catch((error) => callback(error, null));
  }
};

export default bundledBackend;
