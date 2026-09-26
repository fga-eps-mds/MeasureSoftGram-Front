import React, { ReactElement } from 'react';
import { NextPageWithLayout } from '@pages/_app.next';
import { Button, Box, Typography } from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { AuthLayout } from '@layouts/auth';
import Image from 'next/image';
import logoImage from '@public/images/svg/logo.svg';

const AuthError: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <AuthLayout>
      <Box display="flex" flexDirection="column" alignItems="center" gap="2rem" textAlign="center">
        <Box sx={{ width: '60px', height: '60px', marginBottom: '0.5rem' }}>
          <Image src={logoImage} alt="Logo Measure" style={{ width: '100%', height: 'auto' }} />
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center" gap="0.5rem">
          {/* Ícone menos agressivo que o ErrorOutline em vermelho */}
          <SentimentDissatisfied sx={{ fontSize: '3rem', color: 'text.secondary' }} />

          <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
            Ops! Problema no redirecionamento
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Não conseguimos concluir o seu login com o GitHub neste momento. Isso geralmente acontece devido a uma falha temporária de comunicação.
          </Typography>
        </Box>

        {/* Caixa de dicas amigável com tons neutros */}
        <Box sx={{ backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', width: '100%' }}>
          <Typography variant="body2" color="text.primary" fontWeight="bold" textAlign="left" gutterBottom>
            O que você pode tentar:
          </Typography>

          <Box display="flex" flexDirection="column" gap="0.75rem" mt={1}>
            <Typography variant="body2" color="text.secondary" textAlign="left">
              <strong>1. Tente novamente:</strong> Volte para a tela inicial e repita o login. Na maioria das vezes, isso resolve o problema.
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="left">
              <strong>2. Verifique seu navegador:</strong> Extensões que bloqueiam pop-ups ou rastreadores podem interromper o redirecionamento do GitHub.
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="left">
              <strong>3. Aguarde um momento:</strong> Os serviços de autenticação podem estar passando por uma breve instabilidade.
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => {
            router.push('/auth');
          }}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: '600',
            textTransform: 'none',
            backgroundColor: '#24292e',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#1b1f23',
            },
          }}
        >
          Voltar para o Login
        </Button>
      </Box>
    </AuthLayout>
  );
};

AuthError.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default AuthError;
