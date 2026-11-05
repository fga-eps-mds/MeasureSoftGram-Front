import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Typography, Button } from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import { LandingSection } from './LandingSection';
import { FeatureCard } from './FeatureCard';
import { PUBLICATIONS } from '../constants';

// Secao de publicacoes: da acesso aos artigos cientificos que fundamentam o
// MeasureSoftGram. Titulo e autores vem das constantes (dados de citacao,
// neutros de idioma); o cabecalho da secao e o rotulo do CTA vem da i18n. O
// CTA abre o DOI no ACM em nova aba, com rel seguro (noopener).
export const PublicationsSection: React.FC = () => {
  const { t } = useTranslation('landing');

  return (
    <LandingSection
      id="publications"
      title={t('publications.title')}
      subtitle={t('publications.subtitle')}
      sx={{ backgroundColor: '#f4f7fb' }}
    >
      {PUBLICATIONS.map((pub) => (
        <Grid item xs={12} md={6} key={pub.key}>
          <FeatureCard
            title={pub.title}
            description={pub.authors}
            paperSx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
            badgeSx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              backgroundColor: '#e7eef6',
              color: '#2B4D6F',
            }}
            titleSx={{ fontSize: '1.1rem', lineHeight: 1.35 }}
            descriptionSx={{ fontSize: '0.95rem', mb: 1 }}
            badge={<ArticleOutlinedIcon />}
          >
            <Typography
              sx={{ color: '#5a6472', fontSize: '0.88rem', mb: 3, flexGrow: 1 }}
            >
              {pub.venue}, {pub.year}
            </Typography>
            <Button
              variant="outlined"
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<LaunchIcon />}
              sx={{
                borderColor: '#2B4D6F',
                color: '#2B4D6F',
                fontWeight: 600,
                '&:hover': { borderColor: '#165870', backgroundColor: '#eef3f8' },
              }}
            >
              {t('publications.cta')}
            </Button>
          </FeatureCard>
        </Grid>
      ))}
    </LandingSection>
  );
};

export default PublicationsSection;
