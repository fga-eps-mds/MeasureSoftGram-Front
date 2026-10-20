import React from 'react';
import { Box, Button } from '@mui/material';
import DashboardCard, { SkeletonBlock } from '@components/DashboardCard';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';

/** Textos da tela 04 do protótipo. */
export const DISTRIBUTION_ERROR_CARD_TITLE = 'Falha ao carregar';
export const DISTRIBUTION_ERROR_TITLE = 'Não foi possível carregar a distribuição';
export const NO_FILE_DATA_BADGE = 'Sem dados por arquivo';

const COLLECTION_GUIDE_URL = 'https://github.com/fga-eps-mds/MeasureSoftGram-Action';
const SKELETON_BAR_HEIGHTS = [170, 130, 96, 70, 52, 38, 26, 18, 12];

/** Guia de configuração da coleta: botão com contorno, como na tela 04; com href, o MUI desenha um link. */
export function CollectionGuideLink() {
  return (
    <Button
      variant="outlined"
      href={COLLECTION_GUIDE_URL}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        textTransform: 'none',
        fontWeight: 'bold',
        color: DASHBOARD_COLORS.primary,
        borderColor: DASHBOARD_COLORS.primary
      }}
    >
      Ver como configurar a coleta
    </Button>
  );
}

/** Esqueleto do histograma enquanto os arquivos carregam. */
export function ChartSkeleton() {
  return (
    <Box display="flex" alignItems="flex-end" gap="6px" height={180} paddingX="16px">
      {SKELETON_BAR_HEIGHTS.map((height) => (
        <SkeletonBlock key={height} width={40} height={height} />
      ))}
    </Box>
  );
}

/** Cartão de falha ao carregar, com o botão de tentar de novo. */
export function DistributionErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <DashboardCard
      title={DISTRIBUTION_ERROR_CARD_TITLE}
      status="error"
      errorTitle={DISTRIBUTION_ERROR_TITLE}
      onRetry={onRetry}
    />
  );
}
