import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { LandingSection } from './LandingSection';
import { FeatureCard } from './FeatureCard';
import {
  BrandIconProps,
  SonarBrandIcon,
  GitHubBrandIcon,
  ClaudeBrandIcon,
  GrafanaBrandIcon,
  VSCodeBrandIcon,
} from './brandIcons';

// Cada integracao aponta seu icone de marca (tingido na cor oficial via
// `brand`) e um `label` acessivel usado no <title>/aria-label do SVG. O texto
// de titulo/descricao vem do namespace `landing`. O cartao `ai` cobre os
// assistentes de IA conectados via MCP: o icone e o do Claude, mas a descricao
// deixa claro que qualquer cliente compativel com o Model Context Protocol
// (Claude, editores, etc.) fala com o MeasureSoftGram.
interface Integration {
  key: string;
  Icon: React.FC<BrandIconProps>;
  brand: string;
  label: string;
}

const INTEGRATIONS: Integration[] = [
  { key: 'sonar', Icon: SonarBrandIcon, brand: '#4E9BCD', label: 'SonarQube' },
  { key: 'github', Icon: GitHubBrandIcon, brand: '#181717', label: 'GitHub' },
  { key: 'ai', Icon: ClaudeBrandIcon, brand: '#D97757', label: 'Claude' },
  { key: 'grafana', Icon: GrafanaBrandIcon, brand: '#F46800', label: 'Grafana' },
  { key: 'vscode', Icon: VSCodeBrandIcon, brand: '#007ACC', label: 'Visual Studio Code' },
];

export const IntegrationsSection: React.FC = () => {
  const { t } = useTranslation('landing');

  return (
    <LandingSection
      id="integrations"
      title={t('integrations.title')}
      subtitle={t('integrations.subtitle')}
    >
      {INTEGRATIONS.map(({ key, Icon, brand, label }) => (
        <Grid item xs={12} sm={6} md={4} key={key}>
          <FeatureCard
            title={t(`integrations.items.${key}.title`)}
            description={t(`integrations.items.${key}.description`)}
            paperSx={{ p: 4 }}
            badgeSx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              backgroundColor: '#ffffff',
              border: '1px solid #e6e9ef',
              color: brand,
            }}
            titleSx={{ fontSize: '1.05rem' }}
            descriptionSx={{ fontSize: '0.95rem' }}
            badge={<Icon size={28} title={label} />}
          />
        </Grid>
      ))}
    </LandingSection>
  );
};

export default IntegrationsSection;
