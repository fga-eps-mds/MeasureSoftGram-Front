import type { Metadata } from 'next';
import pt from '../../../shared/i18n/locales/pt';
import { SITE_URL, OG_IMAGE_PATH } from './constants';

const DEFAULT_DESCRIPTION =
  'Meca a qualidade do seu software de forma objetiva, com base em metricas coletadas do seu proprio pipeline.';

interface LandingMeta {
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  ogImage: string;
}

// O meta sai no HTML do servidor (Open Graph / Twitter), por isso vem das traduções em pt no bundle, e não do i18next
// do navegador.
export function getLandingMeta(resources: Record<string, any> = pt): LandingMeta {
  const landing = resources?.landing ?? {};

  const metaTitle = landing?.meta?.title ?? 'MeasureSoftGram';
  const metaDescription = landing?.meta?.description ?? DEFAULT_DESCRIPTION;
  const heroTitle = landing?.hero?.title ?? metaTitle;
  const ogImage = new URL(OG_IMAGE_PATH, SITE_URL).toString();

  return { metaTitle, metaDescription, heroTitle, ogImage };
}

export function generateMetadata(): Metadata {
  const { metaTitle, metaDescription, heroTitle, ogImage } = getLandingMeta();
  const title = `${metaTitle} - ${heroTitle}`;

  return {
    title,
    description: metaDescription,
    openGraph: {
      title,
      description: metaDescription,
      type: 'website',
      url: SITE_URL,
      images: [ogImage],
      siteName: metaTitle
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      images: [ogImage]
    }
  };
}
