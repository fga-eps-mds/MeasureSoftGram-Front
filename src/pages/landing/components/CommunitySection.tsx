import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Grid, Button } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GitHubIcon from '@mui/icons-material/GitHub';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { EXTERNAL_LINKS, APP_ENTRY_ROUTE } from '../constants';
import { LandingSection } from './LandingSection';
import { FeatureCard } from './FeatureCard';

export const CommunitySection: React.FC = () => {
  const { t } = useTranslation('landing');
  const router = useRouter();

  const cards = [
    {
      key: 'docs',
      Icon: MenuBookIcon,
      onClick: () => window.open(EXTERNAL_LINKS.docs, '_blank', 'noopener,noreferrer')
    },
    {
      key: 'repos',
      Icon: GitHubIcon,
      onClick: () => window.open(EXTERNAL_LINKS.repositories, '_blank', 'noopener,noreferrer')
    },
    {
      key: 'app',
      Icon: DashboardIcon,
      onClick: () => router.push(APP_ENTRY_ROUTE)
    }
  ];

  return (
    <LandingSection
      id="community"
      title={t('community.title')}
      subtitle={t('community.subtitle')}
    >
      {cards.map(({ key, Icon, onClick }) => (
        <Grid item xs={12} md={4} key={key}>
          <FeatureCard
            title={t(`community.${key}.title`)}
            description={t(`community.${key}.description`)}
            paperSx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}
            badgeSx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              backgroundColor: '#2B4D6F',
              color: '#ffffff'
            }}
            titleSx={{ fontSize: '1.1rem' }}
            descriptionSx={{ fontSize: '0.98rem', mb: 3, flexGrow: 1 }}
            badge={<Icon />}
          >
            <Button
              variant="text"
              onClick={onClick}
              sx={{ color: '#2B4D6F', fontWeight: 600, px: 0 }}
            >
              {t(`community.${key}.cta`)}
            </Button>
          </FeatureCard>
        </Grid>
      ))}
    </LandingSection>
  );
};

export default CommunitySection;
