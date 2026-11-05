import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Landing from '../Landing';
import { generateMetadata, getLandingMeta } from '../metadata';
import { EXTERNAL_LINKS } from '../constants';

const mockPush = jest.fn();

jest.mock('@hooks/useRouter', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

const META_KEY_PREFIX = 'meta.';
const HERO_KEY_PREFIX = 'hero.';
const HERO_TITLE = 'Meça a qualidade do seu software de forma objetiva';
const OG_IMAGE = 'https://msgram.lappis.rocks/images/png/logo.png';

describe('Landing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza as secoes principais da landing', () => {
    render(<Landing />);

    expect(screen.getByText('hero.title')).toBeInTheDocument();
    expect(screen.getByText('howItWorks.title')).toBeInTheDocument();
    expect(screen.getByText('integrations.title')).toBeInTheDocument();
    expect(screen.getByText('value.title')).toBeInTheDocument();
    expect(screen.getByText('publications.title')).toBeInTheDocument();
    expect(screen.getByText('community.title')).toBeInTheDocument();
  });

  it('o CTA principal do hero leva o usuario para /auth', () => {
    render(<Landing />);

    const ctas = screen.getAllByRole('button', { name: 'hero.primaryCta' });
    fireEvent.click(ctas[0]);

    expect(mockPush).toHaveBeenCalledWith('/auth');
  });

  it('expoe os links externos publicos esperados', () => {
    render(<Landing />);

    const docsLinks = screen.getAllByRole('link', { name: 'nav.docs' });
    expect(docsLinks[0]).toHaveAttribute('href', EXTERNAL_LINKS.docs);
    expect(docsLinks[0]).toHaveAttribute('target', '_blank');
  });

  it('getLandingMeta resolve o meta a partir das traducoes em pt (sem chave crua)', () => {
    const resolvedMeta = getLandingMeta();

    expect(resolvedMeta.metaTitle).toBe('MeasureSoftGram');
    expect(resolvedMeta.metaTitle).not.toContain(META_KEY_PREFIX);
    expect(resolvedMeta.metaDescription).not.toContain(META_KEY_PREFIX);
    expect(resolvedMeta.metaDescription.length).toBeGreaterThan(20);
    expect(resolvedMeta.heroTitle).toBe(HERO_TITLE);
    expect(resolvedMeta.heroTitle).not.toContain(HERO_KEY_PREFIX);

    // og:image precisa ser uma URL absoluta para o crawler buscar a imagem.
    expect(resolvedMeta.ogImage).toBe(OG_IMAGE);
  });

  it('getLandingMeta usa os defaults quando o namespace landing nao traz as strings', () => {
    const resolvedMeta = getLandingMeta({});

    expect(resolvedMeta.metaTitle).toBe('MeasureSoftGram');
    expect(resolvedMeta.metaDescription).toBe(
      'Meca a qualidade do seu software de forma objetiva, com base em metricas coletadas do seu proprio pipeline.'
    );
    // heroTitle nao existe nas traducoes: usa o metaTitle como fallback.
    expect(resolvedMeta.heroTitle).toBe('MeasureSoftGram');
    expect(resolvedMeta.ogImage).toBe(OG_IMAGE);
  });

  it('generateMetadata expoe title, description, Open Graph e Twitter Card para o preview do link', () => {
    const { metaTitle, metaDescription, heroTitle } = getLandingMeta();
    const expectedTitle = `${metaTitle} - ${heroTitle}`;
    const metadata: any = generateMetadata();

    expect(metadata.title).toBe(expectedTitle);
    expect(metadata.description).toBe(metaDescription);
    expect(metadata.openGraph).toEqual({
      title: expectedTitle,
      description: metaDescription,
      type: 'website',
      url: 'https://msgram.lappis.rocks/',
      images: [OG_IMAGE],
      siteName: metaTitle
    });
    expect(metadata.twitter).toEqual({
      card: 'summary_large_image',
      title: expectedTitle,
      description: metaDescription,
      images: [OG_IMAGE]
    });
  });
});
