import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

export type MSGAlertSeverity = 'error' | 'warning' | 'success';

/** Versões claras das mensagens (Snackbar) do guia de IDV, na página IDV do Figma. */
export const MSG_ALERT_STYLES: Record<
  MSGAlertSeverity,
  { background: string; border: string; text: string; icon: string }
> = {
  error: { background: 'rgba(244, 129, 103, 0.30)', border: '#D13310', text: '#D13310', icon: '#FF5630' },
  warning: { background: 'rgba(223, 142, 22, 0.22)', border: '#DF8E16', text: '#C07910', icon: '#DF8E16' },
  success: { background: 'rgba(1, 169, 112, 0.31)', border: '#04724D', text: '#04724D', icon: '#04724D' }
};

const ICONS: Record<MSGAlertSeverity, typeof ErrorRoundedIcon> = {
  error: ErrorRoundedIcon,
  warning: WarningRoundedIcon,
  success: CheckCircleRoundedIcon
};

export interface MSGAlertProps {
  severity: MSGAlertSeverity;
  title?: string;
  children?: React.ReactNode;
  /** Ação à direita da mensagem, como "Tentar novamente". */
  actionLabel?: string;
  onAction?: () => void;
  /** Ação que já é um elemento (um link, por exemplo). */
  action?: React.ReactNode;
}

/** Mensagem de aviso, de erro ou de sucesso do guia de IDV. */
const MSGAlert: React.FC<MSGAlertProps> = ({ severity, title, children, actionLabel, onAction, action }) => {
  const style = MSG_ALERT_STYLES[severity];
  const Icon = ICONS[severity];

  return (
    <Box
      role={severity === 'error' ? 'alert' : 'status'}
      data-severity={severity}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '8px 8px 8px 12px',
        borderRadius: '8px',
        border: `1px solid ${style.border}`,
        backgroundColor: style.background,
        boxShadow: '0px 4px 16px rgba(145, 158, 171, 0.16)'
      }}
    >
      <Icon aria-hidden sx={{ color: style.icon, fontSize: 24, flexShrink: 0 }} />
      <Box flex={1} minWidth={0}>
        {title && (
          <Typography fontWeight={700} fontSize="14px" lineHeight="22px" color={style.text}>
            {title}
          </Typography>
        )}
        {children && (
          <Typography component="div" fontWeight={600} fontSize="14px" lineHeight="22px" color={style.text}>
            {children}
          </Typography>
        )}
      </Box>
      {action}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="small"
          sx={{ color: style.text, fontWeight: 700, textTransform: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default MSGAlert;
