import React, { ReactElement } from 'react';
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { Box } from '@mui/material';
import { loadTranslations } from 'ni18n';
import { NextPageWithLayout } from '@pages/_app.next';
import { ni18nConfig } from '../../../n18n.config';
import { LandingHeader } from './components/LandingHeader';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ValuePropsSection } from './components/ValuePropsSection';
import { IntegrationsSection } from './components/IntegrationsSection';
import { PublicationsSection } from './components/PublicationsSection';
import { CommunitySection } from './components/CommunitySection';
import { LandingFooter } from './components/LandingFooter';
import { SITE_URL, OG_IMAGE_PATH } from './constants';

// Locale usado para resolver as tags do <head> no servidor. O crawler de
// OpenGraph (WhatsApp, Slack, redes sociais) le o HTML renderizado pelo
// servidor, onde o `t()` do react-i18next ainda nao resolveu. Por isso o meta
// e montado a partir das strings carregadas em build time, e nao via hook.
const META_LOCALE = 'pt';

interface LandingMeta {
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  ogImage: string;
}

interface LandingProps {
  meta: LandingMeta;
}

const Landing: React.FC<LandingProps> = ({ meta }) => {
  const pageTitle = `${meta.metaTitle} - ${meta.heroTitle}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={meta.metaDescription} />

        {/* Open Graph: preview do link em WhatsApp, Slack, LinkedIn, etc. */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={meta.metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={meta.ogImage} />
        <meta property="og:site_name" content={meta.metaTitle} />

        {/* Twitter Card: preview do link no X/Twitter. */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={meta.metaDescription} />
        <meta name="twitter:image" content={meta.ogImage} />
      </Head>
      <Box component="main" sx={{ backgroundColor: '#ffffff' }}>
        <LandingHeader />
        <HeroSection />
        <HowItWorksSection />
        <ValuePropsSection />
        <IntegrationsSection />
        <PublicationsSection />
        <CommunitySection />
        <LandingFooter />
      </Box>
    </>
  );
};

// getLayout: a landing renderiza sem o layout autenticado padrao.
(Landing as NextPageWithLayout<LandingProps>).getLayout = function getLayout(page: ReactElement) {
  return page;
};

// Resolve as strings do <head> no servidor (build time). Sem isso, o crawler
// de OpenGraph receberia as chaves cruas ("meta.title - hero.title"), porque o
// react-i18next so resolve apos a hidratacao no cliente.
export const getStaticProps: GetStaticProps<LandingProps> = async () => {
  const serverState = await loadTranslations(ni18nConfig, META_LOCALE, 'landing');
  // __ni18n_server__ e o contrato interno do ni18n para hidratar o cliente.
  // eslint-disable-next-line no-underscore-dangle
  const landingResources: any = serverState?.__ni18n_server__?.resources?.[META_LOCALE]?.landing ?? {};

  const metaTitle = landingResources?.meta?.title ?? 'MeasureSoftGram';
  const metaDescription =
    landingResources?.meta?.description ??
    'Meca a qualidade do seu software de forma objetiva, com base em metricas coletadas do seu proprio pipeline.';
  const heroTitle = landingResources?.hero?.title ?? metaTitle;

  // og:image precisa ser uma URL absoluta para o crawler conseguir buscar.
  const ogImage = new URL(OG_IMAGE_PATH, SITE_URL).toString();

  return {
    props: {
      ...serverState,
      meta: {
        metaTitle,
        metaDescription,
        heroTitle,
        ogImage
      }
    }
  };
};

export default Landing;
