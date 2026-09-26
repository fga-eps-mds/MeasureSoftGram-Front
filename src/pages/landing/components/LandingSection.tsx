import React from 'react';
import { Box, Container, Typography, Grid, SxProps, Theme } from '@mui/material';

interface LandingSectionProps {
  id: string;
  title: string;
  subtitle: string;
  /** Estilo extra aplicado ao Box raiz da secao (ex.: backgroundColor). */
  sx?: SxProps<Theme>;
  /** Cartoes da secao, renderizados dentro do Grid container. */
  children: React.ReactNode;
}

/**
 * Casca compartilhada das secoes da landing: Box <section>, Container,
 * cabecalho centralizado (titulo + subtitulo) e o Grid container que
 * agrupa os cartoes. Mantem o visual identico ao das secoes originais.
 */
export const LandingSection: React.FC<LandingSectionProps> = ({
  id,
  title,
  subtitle,
  sx,
  children
}) => (
  <Box component="section" id={id} sx={{ py: { xs: 6, md: 10 }, ...sx }}>
    <Container maxWidth="lg">
      <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{ color: '#1f2d3d', fontWeight: 800, mb: 1 }}
        >
          {title}
        </Typography>
        <Typography sx={{ color: '#5a6472', fontSize: '1.05rem' }}>
          {subtitle}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {children}
      </Grid>
    </Container>
  </Box>
);

export default LandingSection;
