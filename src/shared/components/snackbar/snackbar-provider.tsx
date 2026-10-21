'use client';

import { useRef } from 'react';
import { SnackbarProvider as NotistackProvider, closeSnackbar } from 'notistack';
// @mui
import IconButton from '@mui/material/IconButton';
// ícones do MUI, já no bundle: os do Iconify vinham da API pública do Iconify na primeira vez que um aviso aparecia
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
//
import { StyledIcon, StyledNotistack } from './styles';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function SnackbarProvider({ children }: Props) {


  const notistackRef = useRef<any>(null);

  return (
    <NotistackProvider
      ref={notistackRef}
      maxSnack={5}
      preventDuplicate
      autoHideDuration={5000}
      TransitionComponent={undefined}
      variant="success" // Set default variant
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      iconVariant={{
        info: (
          <StyledIcon color="info">
            <InfoRoundedIcon sx={{ fontSize: 24 }} />
          </StyledIcon>
        ),
        success: (
          <StyledIcon color="success">
            <CheckCircleRoundedIcon sx={{ fontSize: 24 }} />
          </StyledIcon>
        ),
        warning: (
          <StyledIcon color="warning">
            <WarningRoundedIcon sx={{ fontSize: 24 }} />
          </StyledIcon>
        ),
        error: (
          <StyledIcon color="error">
            <ErrorRoundedIcon sx={{ fontSize: 24 }} />
          </StyledIcon>
        ),
      }}
      Components={{
        default: StyledNotistack,
        info: StyledNotistack,
        success: StyledNotistack,
        warning: StyledNotistack,
        error: StyledNotistack,
      }}
      // with close as default
      action={(snackbarId) => (
        <IconButton size="small" onClick={() => closeSnackbar(snackbarId)} sx={{ p: 0.5 }}>
          <CloseRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    >
      {children}
    </NotistackProvider>
  );
}
