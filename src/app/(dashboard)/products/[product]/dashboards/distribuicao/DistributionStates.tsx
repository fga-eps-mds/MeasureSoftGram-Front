import React from 'react';
import { Box, Button } from '@mui/material';
import DashboardCard, { SkeletonBlock } from '@components/DashboardCard';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';

/** Textos do estado de erro (CA9): sem detalhes técnicos, com "Tentar novamente". */
export const DISTRIBUTION_ERROR_CARD_TITLE = 'Falha ao carregar';
export const DISTRIBUTION_ERROR_TITLE = 'Não foi possível carregar a distribuição';

const COLLECTION_GUIDE_URL = 'https://github.com/fga-eps-mds/MeasureSoftGram-Action';
const SKELETON_BAR_HEIGHTS = [26, 52, 96, 150, 170, 130, 70, 38, 18, 12];
const SKELETON_SUMMARY_ROWS = 12;

/** Guia de configuração da coleta: botão com contorno; com href, o MUI desenha um link. */
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

/** Esqueleto dos gráficos enquanto as análises carregam. */
export function ChartSkeleton() {
  return (
    <Box display="flex" alignItems="flex-end" gap="6px" height={180} paddingX="16px" overflow="hidden">
      {SKELETON_BAR_HEIGHTS.map((height) => (
        <SkeletonBlock key={height} width={32} height={height} />
      ))}
    </Box>
  );
}

/** Esqueleto do resumo estatístico: uma linha por estatística. */
export function SummarySkeleton() {
  return (
    <Box display="flex" flexDirection="column" gap="10px">
      {Array.from({ length: SKELETON_SUMMARY_ROWS }, (_, index) => (
        <SkeletonBlock key={index} width="100%" height={14} />
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
