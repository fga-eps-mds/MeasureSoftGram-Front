import React, { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import MSGAlert from '../../../components/idv/feedback';

export type DashboardCardStatus = 'loading' | 'empty' | 'error' | 'ready';

export interface DashboardCardProps {
  title: string;
  status: DashboardCardStatus;
  /** Ação no canto do cabeçalho (um seletor, uma legenda), só quando há dados. */
  headerAction?: ReactNode;
  /** Esqueleto mostrado enquanto carrega. */
  loadingContent?: ReactNode;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  /** Título do estado de erro; o padrão serve para qualquer gráfico. */
  errorTitle?: string;
  /** Texto do selo de carregando, vazio ou erro, quando a tela pede um mais específico. */
  badgeLabel?: string;
  onRetry?: () => void;
  children?: ReactNode;
}

const STATUS_BADGES: Partial<Record<DashboardCardStatus, { label: string; color: string; background: string }>> = {
  loading: { label: 'Carregando', color: DASHBOARD_COLORS.primary, background: DASHBOARD_COLORS.infoBackground },
  empty: { label: 'Sem dados', color: DASHBOARD_COLORS.mutedText, background: DASHBOARD_COLORS.skeleton },
  error: { label: 'Erro', color: DASHBOARD_COLORS.error, background: DASHBOARD_COLORS.errorBackground }
};

export const dashboardCardSx = {
  backgroundColor: '#FFFFFF',
  border: `1px solid ${DASHBOARD_COLORS.cardBorder}`,
  borderRadius: '8px'
};

export function SkeletonBlock({ width, height }: { width: number | string; height: number }) {
  return (
    <Box
      data-testid="skeleton-block"
      sx={{ width, height, borderRadius: '4px', backgroundColor: DASHBOARD_COLORS.skeleton, flexShrink: 0 }}
    />
  );
}

/** Card dos dashboards nativos, com os estados de carregamento, sem dados e erro (CA5 da US07.01). */
export default function DashboardCard({
  title,
  status,
  headerAction,
  loadingContent,
  loadingMessage = 'Carregando os dados da release…',
  emptyTitle = 'Ainda não há análises nesta release',
  emptyDescription,
  emptyAction,
  errorTitle = 'Não foi possível carregar este gráfico',
  badgeLabel,
  onRetry,
  children
}: DashboardCardProps) {
  const badge = STATUS_BADGES[status];

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <>
          {loadingContent}
          <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
            {loadingMessage}
          </Typography>
        </>
      );
    }
    // mensagens de erro e de aviso do guia de IDV (CA4 da US07.01)
    if (status === 'error') {
      return (
        <MSGAlert
          severity="error"
          title={errorTitle}
          actionLabel={onRetry ? 'Tentar novamente' : undefined}
          onAction={onRetry}
        >
          Tente de novo em alguns instantes. Se o problema continuar, avise o administrador do produto.
        </MSGAlert>
      );
    }
    if (status === 'empty') {
      return (
        <MSGAlert severity="warning" title={emptyTitle} action={emptyAction}>
          {emptyDescription}
        </MSGAlert>
      );
    }
    return children;
  };

  return (
    <Paper
      elevation={0}
      component="section"
      aria-label={title}
      sx={{
        ...dashboardCardSx,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        minWidth: 0
      }}
    >
      {/* em tela estreita, a ação do cabeçalho (uma legenda) desce para baixo do título em vez de alargar o cartão */}
      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        gap="12px"
        minHeight="36px"
        data-testid="dashboard-card-header"
      >
        <Typography flex={1} fontWeight="bold" fontSize="18px" color={DASHBOARD_COLORS.cardTitle}>
          {title}
        </Typography>
        {badge ? (
          <Box sx={{ backgroundColor: badge.background, borderRadius: '12px', padding: '4px 10px' }}>
            <Typography fontWeight="bold" fontSize="12px" color={badge.color}>
              {badgeLabel ?? badge.label}
            </Typography>
          </Box>
        ) : (
          headerAction
        )}
      </Box>
      {renderContent()}
    </Paper>
  );
}
