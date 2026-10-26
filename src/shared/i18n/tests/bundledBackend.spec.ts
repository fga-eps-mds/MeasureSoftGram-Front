import bundledBackend, { loadLanguage } from '../bundledBackend';
import pt from '../locales/pt';

const read = (language: string, namespace: string) =>
  new Promise<{ error: unknown; data: unknown }>((resolve) => {
    bundledBackend.read(language, namespace, (error, data) => resolve({ error, data }));
  });

describe('bundledBackend', () => {
  it('entrega o namespace pedido a partir das traduções do bundle', async () => {
    const { error, data } = await read('pt', 'sidebar');

    expect(error).toBeNull();
    expect(data).toEqual(pt.sidebar);
  });

  it('carrega cada idioma uma vez só, para todos os namespaces', async () => {
    const [first, second] = await Promise.all([loadLanguage('en'), loadLanguage('en')]);

    expect(first).toBe(second);
    expect(Object.keys(first)).toEqual(
      expect.arrayContaining(['translation', 'sidebar', 'breadcrumb', 'repositories'])
    );
  });

  it('devolve vazio para namespace ou idioma que não existe, sem erro', async () => {
    expect(await read('pt', 'inexistente')).toEqual({ error: null, data: {} });
    expect(await read('fr', 'sidebar')).toEqual({ error: null, data: {} });
  });

  it('tem os mesmos arquivos de public/locales nos dois idiomas', async () => {
    // eslint-disable-next-line global-require
    const fs = require('fs');
    const files = (language: string) =>
      fs
        .readdirSync(`public/locales/${language}`)
        .map((file: string) => file.replace('.json', ''))
        .sort();

    expect(Object.keys(await loadLanguage('pt')).sort()).toEqual(files('pt'));
    expect(Object.keys(await loadLanguage('en')).sort()).toEqual(files('en'));
  });
});
