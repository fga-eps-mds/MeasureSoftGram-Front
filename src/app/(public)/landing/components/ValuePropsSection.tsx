import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import InsightsIcon from '@mui/icons-material/Insights';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { LandingSection } from './LandingSection';
import { FeatureCard } from './FeatureCard';

const ITEMS = [
  { key: 'model', Icon: TuneIcon },
  { key: 'dashboards', Icon: InsightsIcon },
  { key: 'releases', Icon: CompareArrowsIcon }
] as const;

export const ValuePropsSection: React.FC = () => {
  const { t } = useTranslation('landing');

  return (
    <LandingSection
      id="value"
      title={t('value.title')}
      subtitle={t('value.subtitle')}
      sx={{ backgroundColor: '#f4f7fb' }}
    >
      {ITEMS.map(({ key, Icon }) => (
        <Grid item xs={12} md={4} key={key}>
          <FeatureCard
            title={t(`value.items.${key}.title`)}
            description={t(`value.items.${key}.description`)}
            paperSx={{ p: 4 }}
            badgeSx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              backgroundColor: '#e7eef6',
              color: '#2B4D6F'
            }}
            titleSx={{ fontSize: '1.1rem' }}
            descriptionSx={{ fontSize: '0.98rem' }}
            badge={<Icon />}
          />
        </Grid>
      ))}
    </LandingSection>
  );
};

export default ValuePropsSection;
