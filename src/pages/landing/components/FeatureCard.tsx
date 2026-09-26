import React from 'react';
import { Box, Paper, Typography, SxProps, Theme } from '@mui/material';

interface FeatureCardProps {
  title: string;
  description: string;
  /** Conteudo do badge: numero do passo (How it works) ou icone (demais). */
  badge: React.ReactNode;
  /** Estilo extra do Paper (ex.: padding, layout em coluna). */
  paperSx?: SxProps<Theme>;
  /** Estilo extra do badge (tamanho, raio, cores). */
  badgeSx?: SxProps<Theme>;
  /** Estilo extra do titulo (ex.: fontSize maior). */
  titleSx?: SxProps<Theme>;
  /** Estilo extra da descricao (ex.: mb + flexGrow no card de comunidade). */
  descriptionSx?: SxProps<Theme>;
  /** Conteudo opcional renderizado apos a descricao (ex.: botao de CTA). */
  children?: React.ReactNode;
}

/**
 * Cartao compartilhado das secoes da landing: Paper com borda arredondada,
 * um badge (numero ou icone), titulo e descricao. Cada secao ajusta os
 * detalhes visuais via *Sx para preservar o layout original.
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  badge,
  paperSx,
  badgeSx,
  titleSx,
  descriptionSx,
  children
}) => (
  <Paper
    elevation={0}
    sx={{
      height: '100%',
      borderRadius: '16px',
      border: '1px solid #e6e9ef',
      backgroundColor: '#ffffff',
      ...paperSx
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2,
        ...badgeSx
      }}
    >
      {badge}
    </Box>
    <Typography sx={{ color: '#1f2d3d', fontWeight: 700, mb: 1, ...titleSx }}>
      {title}
    </Typography>
    <Typography sx={{ color: '#5a6472', fontSize: '0.95rem', ...descriptionSx }}>
      {description}
    </Typography>
    {children}
  </Paper>
);

export default FeatureCard;
