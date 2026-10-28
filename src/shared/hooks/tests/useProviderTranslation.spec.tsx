import { renderHook } from '@testing-library/react';
import i18n from 'i18next';
import { useProviderTranslation } from '@hooks/useProviderTranslation';
import { useAuth } from '@contexts/Auth';

jest.mock('@contexts/Auth', () => ({ useAuth: jest.fn() }));

// O setup global devolve a chave em t(); aqui o t() é o de uma instância real do i18next,
// para validar a escolha da variante `_gitlab` de ponta a ponta.
const instance = i18n.createInstance();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: instance.t.bind(instance), i18n: instance })
}));

const renderT = () => renderHook(() => useProviderTranslation('repositories')).result.current.t;

describe('useProviderTranslation', () => {
  beforeAll(async () => {
    await instance.init({
      lng: 'pt',
      fallbackLng: 'pt',
      ns: ['repositories'],
      defaultNS: 'repositories',
      resources: {
        pt: {
          repositories: {
            title: 'Repositórios',
            title_gitlab: 'Projetos',
            only_base: 'Somente base',
            greeting: 'Olá {{name}}',
            greeting_gitlab: 'Olá, {{name}} (GitLab)'
          }
        }
      }
    });
  });

  it('usa a variante do GitLab em chamada sem opções', () => {
    (useAuth as jest.Mock).mockReturnValue({ provider: 'gitlab' });
    expect(renderT()('title')).toBe('Projetos');
  });

  it('usa o texto base com provider github', () => {
    (useAuth as jest.Mock).mockReturnValue({ provider: 'github' });
    expect(renderT()('title')).toBe('Repositórios');
  });

  it('usa o texto base com login por credenciais', () => {
    (useAuth as jest.Mock).mockReturnValue({ provider: 'credentials' });
    expect(renderT()('title')).toBe('Repositórios');
  });

  it('cai na chave base quando não existe variante do GitLab', () => {
    (useAuth as jest.Mock).mockReturnValue({ provider: 'gitlab' });
    expect(renderT()('only_base')).toBe('Somente base');
  });

  it('mescla o contexto com as opções do chamador', () => {
    (useAuth as jest.Mock).mockReturnValue({ provider: 'gitlab' });
    expect(renderT()('greeting', { name: 'Ana' })).toBe('Olá, Ana (GitLab)');
  });

  it('deixa o chamador sobrescrever o contexto', () => {
    (useAuth as jest.Mock).mockReturnValue({ provider: 'gitlab' });
    expect(renderT()('title', { context: undefined })).toBe('Repositórios');
  });

  it('aplica o contexto na forma t(chave, textoPadrao)', () => {
    (useAuth as jest.Mock).mockReturnValue({ provider: 'gitlab' });
    const t = renderT();
    expect(t('title', 'Padrão')).toBe('Projetos');
    expect(t('inexistente', 'Padrão')).toBe('Padrão');
  });
});
