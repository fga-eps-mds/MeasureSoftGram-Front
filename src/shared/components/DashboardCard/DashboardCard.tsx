import React, { ReactNode } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';

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

function StateMessage({
  icon,
  iconColor,
  iconBackground,
  title,
  description,
  action
}: {
  icon: string;
  iconColor: string;
  iconBackground: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap="10px" padding="24px" width="100%">
      <Box
        aria-hidden
        sx={{
          width: 48,
          height: 48,
          borderRadius: '24px',
          backgroundColor: iconBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography fontWeight="bold" fontSize="22px" color={iconColor}>
          {icon}
        </Typography>
      </Box>
      <Typography fontWeight="bold" fontSize="16px" color={DASHBOARD_COLORS.text} textAlign="center">
        {title}
      </Typography>
      {description && (
        <Typography fontSize="13px" color={DASHBOARD_COLORS.mutedText} textAlign="center" maxWidth="420px">
          {description}
        </Typography>
      )}
      {action}
    </Box>
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
    if (status === 'error') {
      return (
        <StateMessage
          icon="!"
          iconColor={DASHBOARD_COLORS.error}
          iconBackground={DASHBOARD_COLORS.errorBackground}
          title={errorTitle}
          description="Tente de novo em alguns instantes. Se o problema continuar, avise o administrador do produto."
          action={
            onRetry && (
              <Button
                variant="contained"
                disableElevation
                onClick={onRetry}
                sx={{ backgroundColor: DASHBOARD_COLORS.primary, fontWeight: 'bold', textTransform: 'none' }}
              >
                Tentar novamente
              </Button>
            )
          }
        />
      );
    }
    if (status === 'empty') {
      return (
        <StateMessage
          icon="i"
          iconColor={DASHBOARD_COLORS.primary}
          iconBackground={DASHBOARD_COLORS.infoBackground}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
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
      <Box display="flex" alignItems="center" gap="12px" minHeight="36px">
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
