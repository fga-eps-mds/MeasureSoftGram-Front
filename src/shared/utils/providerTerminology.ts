export type TerminologyProvider = 'github' | 'gitlab' | 'credentials';

export interface ProviderTerms {
  providerName: string;
  repository: string;
  repositories: string;
  Repository: string;
  Repositories: string;
  organization: string;
  organizations: string;
  Organization: string;
  Organizations: string;
  theOrganization: string;
  yourOrganization: string;
  thisOrganization: string;
  anOrganization: string;
  pullRequest: string;
  pullRequestShort: string;
}

const GITHUB_TERMS: ProviderTerms = {
  providerName: 'GitHub',
  repository: 'repositório',
  repositories: 'repositórios',
  Repository: 'Repositório',
  Repositories: 'Repositórios',
  organization: 'organização',
  organizations: 'organizações',
  Organization: 'Organização',
  Organizations: 'Organizações',
  theOrganization: 'a organização',
  yourOrganization: 'sua organização',
  thisOrganization: 'esta organização',
  anOrganization: 'uma organização',
  pullRequest: 'Pull Request',
  pullRequestShort: 'PR'
};

const GITLAB_TERMS: ProviderTerms = {
  providerName: 'GitLab',
  repository: 'projeto',
  repositories: 'projetos',
  Repository: 'Projeto',
  Repositories: 'Projetos',
  organization: 'grupo',
  organizations: 'grupos',
  Organization: 'Grupo',
  Organizations: 'Grupos',
  theOrganization: 'o grupo',
  yourOrganization: 'seu grupo',
  thisOrganization: 'este grupo',
  anOrganization: 'um grupo',
  pullRequest: 'Merge Request',
  pullRequestShort: 'MR'
};

// Sem provedor de código (login por credenciais) mantém-se o vocabulário padrão (GitHub) da plataforma.
const NEUTRAL_TERMS: ProviderTerms = GITHUB_TERMS;

export function getProviderTerms(provider?: string | null): ProviderTerms {
  if (provider === 'gitlab') return GITLAB_TERMS;
  if (provider === 'github') return GITHUB_TERMS;
  return NEUTRAL_TERMS;
}

/** Valor de `context` do i18next: chaves `<key>_gitlab` sobrescrevem a chave base. */
export function getI18nContext(provider?: string | null): string | undefined {
  return provider === 'gitlab' ? 'gitlab' : undefined;
}
