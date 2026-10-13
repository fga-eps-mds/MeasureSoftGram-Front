import { getI18nContext, getProviderTerms } from '@utils/providerTerminology';

describe('providerTerminology', () => {
  it('usa termos do GitLab para provider gitlab', () => {
    const terms = getProviderTerms('gitlab');
    expect(terms.Repository).toBe('Projeto');
    expect(terms.Organizations).toBe('Grupos');
    expect(terms.pullRequest).toBe('Merge Request');
    expect(terms.pullRequestShort).toBe('MR');
    expect(terms.providerName).toBe('GitLab');
  });

  it('usa termos do GitHub para provider github', () => {
    const terms = getProviderTerms('github');
    expect(terms.Repository).toBe('Repositório');
    expect(terms.Organization).toBe('Organização');
    expect(terms.pullRequestShort).toBe('PR');
  });

  it('usa termos padrão para credentials ou provider ausente', () => {
    expect(getProviderTerms('credentials').Repository).toBe('Repositório');
    expect(getProviderTerms(undefined).Organization).toBe('Organização');
  });

  it('retorna contexto i18n apenas para gitlab', () => {
    expect(getI18nContext('gitlab')).toBe('gitlab');
    expect(getI18nContext('github')).toBeUndefined();
  });
});
