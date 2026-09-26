import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { LandingSection } from './LandingSection';
import { FeatureCard } from './FeatureCard';

const STEP_KEYS = ['register', 'connect', 'collect', 'visualize'] as const;

export const HowItWorksSection: React.FC = () => {
  const { t } = useTranslation('landing');

  return (
    <LandingSection
      id="how-it-works"
      title={t('howItWorks.title')}
      subtitle={t('howItWorks.subtitle')}
    >
      {STEP_KEYS.map((key, index) => (
        <Grid item xs={12} sm={6} md={3} key={key}>
          <FeatureCard
            title={t(`howItWorks.steps.${key}.title`)}
            description={t(`howItWorks.steps.${key}.description`)}
            paperSx={{ p: 3 }}
            badgeSx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: '#2B4D6F',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1.1rem'
            }}
            badge={index + 1}
          />
        </Grid>
      ))}
    </LandingSection>
  );
};

export default HowItWorksSection;
