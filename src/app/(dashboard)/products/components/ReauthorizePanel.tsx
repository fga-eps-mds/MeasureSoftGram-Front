import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import type { ProviderTerms } from '@utils/providerTerminology';

interface ReauthorizePanelProps {
  terms: ProviderTerms;
  isGitlab: boolean;
  onReauthorize: () => void;
  // dentro do cartão da lista (sem moldura própria) ou como cartão avulso
  embedded?: boolean;
}

const ReauthorizePanel = ({ terms, isGitlab, onReauthorize, embedded = false }: ReauthorizePanelProps) => {
  const content = (
    <>
      <Typography variant="h6" color="error" gutterBottom>
        {`Token do ${terms.providerName} expirado ou inválido`}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {`Para carregar os ${terms.repositories}, autorize o aplicativo novamente.`}
      </Typography>
      <Button
        variant="contained"
        onClick={onReauthorize}
        sx={isGitlab ? { backgroundColor: '#fc6d26', '&:hover': { backgroundColor: '#e24329' } } : undefined}
        color={isGitlab ? undefined : 'primary'}
      >
        {`Autorizar ${terms.providerName}`}
      </Button>
    </>
  );

  if (embedded) {
    return <Box padding="4rem" textAlign="center">{content}</Box>;
  }
  return (
    <Paper variant="outlined" sx={{ padding: '4rem', textAlign: 'center', borderRadius: '12px' }}>
      {content}
    </Paper>
  );
};

export default ReauthorizePanel;
