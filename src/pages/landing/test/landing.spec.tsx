import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { loadTranslations } from 'ni18n';
import Landing, { getStaticProps } from '../Landing';
import { EXTERNAL_LINKS } from '../constants';

const mockedLoadTranslations = loadTranslations as jest.MockedFunction<typeof loadTranslations>;

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// next/head depende do HeadManagerContext do App do Next para escrever no
// document.head, contexto ausente no ambiente de teste. Renderizamos os filhos
// num container inline para conseguir consultar as tags de meta resolvidas no
// servidor.
jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="head">{children}</div>
  ),
}));

// ni18n.loadTranslations cria uma instancia real do i18next, que depende do
// react-i18next (globalmente mockado no jestSetup). Mockamos a funcao para
// devolver um server state realista e exercitar a resolucao do meta no
// getStaticProps sem acoplar ao mock global de i18n.
jest.mock('ni18n', () => ({
  loadTranslations: jest.fn(async () => ({
    __ni18n_server__: {
      resources: {
        pt: {
          landing: {
            meta: {
              title: 'MeasureSoftGram',
              description:
                'Meca a qualidade do seu software de forma objetiva, com base em metricas coletadas do seu proprio pipeline.',
            },
            hero: { title: 'Meca a qualidade do seu software de forma objetiva' },
          },
        },
      },
      ns: ['landing'],
      lng: 'pt',
    },
  })),
}));

// Meta resolvido no servidor (via getStaticProps) e injetado como prop. O
// componente nao usa mais t() para o <head>, justamente para que o crawler de
// OpenGraph leia texto real no HTML renderizado pelo servidor.
const META_KEY_PREFIX = 'meta.';
const HERO_KEY_PREFIX = 'hero.';
const HERO_TITLE = 'Meca a qualidade do seu software de forma objetiva';

const meta = {
  metaTitle: 'MeasureSoftGram',
  metaDescription: 'Meca a qualidade do seu software de forma objetiva.',
  heroTitle: HERO_TITLE,
  ogImage: 'https://msgram.lappis.rocks/images/png/logo.png',
};

describe('Landing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza as secoes principais da landing', () => {
    render(<Landing meta={meta} />);

    expect(screen.getByText('hero.title')).toBeInTheDocument();
    expect(screen.getByText('howItWorks.title')).toBeInTheDocument();
    expect(screen.getByText('integrations.title')).toBeInTheDocument();
    expect(screen.getByText('value.title')).toBeInTheDocument();
    expect(screen.getByText('publications.title')).toBeInTheDocument();
    expect(screen.getByText('community.title')).toBeInTheDocument();
  });

  it('o CTA principal do hero leva o usuario para /auth', () => {
    render(<Landing meta={meta} />);

    const ctas = screen.getAllByRole('button', { name: 'hero.primaryCta' });
    fireEvent.click(ctas[0]);

    expect(mockPush).toHaveBeenCalledWith('/auth');
  });

  it('expoe os links externos publicos esperados', () => {
    render(<Landing meta={meta} />);

    const docsLinks = screen.getAllByRole('link', { name: 'nav.docs' });
    expect(docsLinks[0]).toHaveAttribute('href', EXTERNAL_LINKS.docs);
    expect(docsLinks[0]).toHaveAttribute('target', '_blank');
  });

  it('renderiza title e meta description com texto real (nao chave crua)', () => {
    const { container } = render(<Landing meta={meta} />);

    const expectedTitle = `${meta.metaTitle} - ${meta.heroTitle}`;

    const title = container.querySelector('title');
    expect(title?.textContent).toBe(expectedTitle);
    expect(title?.textContent).not.toContain(META_KEY_PREFIX);
    expect(title?.textContent).not.toContain(HERO_KEY_PREFIX);

    const description = container.querySelector('meta[name="description"]');
    expect(description).toHaveAttribute('content', meta.metaDescription);
    expect(description?.getAttribute('content')).not.toContain(META_KEY_PREFIX);
  });

  it('expoe as tags Open Graph e Twitter Card para o preview do link', () => {
    const { container } = render(<Landing meta={meta} />);

    const expectedTitle = `${meta.metaTitle} - ${meta.heroTitle}`;

    expect(container.querySelector('meta[property="og:title"]')).toHaveAttribute(
      'content',
      expectedTitle
    );
    expect(container.querySelector('meta[property="og:description"]')).toHaveAttribute(
      'content',
      meta.metaDescription
    );
    expect(container.querySelector('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'website'
    );
    expect(container.querySelector('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://msgram.lappis.rocks/'
    );
    expect(container.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      meta.ogImage
    );
    expect(container.querySelector('meta[property="og:site_name"]')).toHaveAttribute(
      'content',
      meta.metaTitle
    );

    expect(container.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image'
    );
    expect(container.querySelector('meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      expectedTitle
    );
    expect(container.querySelector('meta[name="twitter:description"]')).toHaveAttribute(
      'content',
      meta.metaDescription
    );
    expect(container.querySelector('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      meta.ogImage
    );
  });

  it('getStaticProps resolve o meta no servidor a partir das traducoes (sem chave crua)', async () => {
    const result: any = await getStaticProps({});

    const resolvedMeta = result.props.meta;

    // Texto real carregado do namespace landing, nao a chave i18n.
    expect(resolvedMeta.metaTitle).toBe('MeasureSoftGram');
    expect(resolvedMeta.metaTitle).not.toContain(META_KEY_PREFIX);
    expect(resolvedMeta.metaDescription).not.toContain(META_KEY_PREFIX);
    expect(resolvedMeta.metaDescription.length).toBeGreaterThan(20);
    expect(resolvedMeta.heroTitle).toBe(HERO_TITLE);
    expect(resolvedMeta.heroTitle).not.toContain(HERO_KEY_PREFIX);

    // og:image precisa ser uma URL absoluta para o crawler buscar a imagem.
    expect(resolvedMeta.ogImage).toBe(meta.ogImage);
  });

  it('getStaticProps usa os defaults quando o namespace landing nao traz as strings', async () => {
    // Simula um server state sem o namespace landing resolvido (build sem as
    // traducoes carregadas). Cada `??` do meta deve cair no valor default.
    mockedLoadTranslations.mockResolvedValueOnce({
      __ni18n_server__: { resources: {}, ns: ['landing'], lng: 'pt' },
    } as any);

    const result: any = await getStaticProps({});

    const resolvedMeta = result.props.meta;

    expect(resolvedMeta.metaTitle).toBe('MeasureSoftGram');
    expect(resolvedMeta.metaDescription).toBe(
      'Meca a qualidade do seu software de forma objetiva, com base em metricas coletadas do seu proprio pipeline.'
    );
    // heroTitle nao existe nas traducoes: usa o metaTitle como fallback.
    expect(resolvedMeta.heroTitle).toBe('MeasureSoftGram');
    expect(resolvedMeta.ogImage).toBe(meta.ogImage);
  });
});
