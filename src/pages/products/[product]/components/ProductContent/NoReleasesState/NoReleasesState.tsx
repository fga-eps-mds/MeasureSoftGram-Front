import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography, Paper } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InsertLinkIcon from '@mui/icons-material/InsertLink';

interface Props {
  productName?: string;
}

const NoReleasesState: React.FC<Props> = ({ productName }) => {
  const router = useRouter();
  const { t } = useTranslation('overview');

  const handleGoToReleases = () => {
    if (router.query.product) {
      router.push(`/products/${router.query.product}/releases`);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        border: '1px solid #E0E0E0',
        borderRadius: '12px',
        padding: '24px',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Header section of the chart card */}
      <Box marginBottom="20px">
        <Typography variant="h6" fontWeight="bold" color="#1F2937" gutterBottom>
          {t('msg-chart-title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('msg-chart-subtitle')}
        </Typography>
      </Box>

      {/* Dashed inner container */}
      <Box
        sx={{
          width: '100%',
          minHeight: '400px',
          border: '1px dashed #D0D7DE',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          backgroundColor: '#FAFBFD',
        }}
      >
        {/* Circle Icon Container */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#EAEFF5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <ShowChartIcon sx={{ fontSize: 44, color: '#33568E' }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          fontWeight="bold"
          color="#1F2937"
          textAlign="center"
          marginBottom="12px"
        >
          {t('no-releases-title')}
        </Typography>

        {/* Description lines */}
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          maxWidth="550px"
          marginBottom="4px"
        >
          {t('no-releases-description-1')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          maxWidth="550px"
          marginBottom="24px"
        >
          {t('no-releases-description-2', { productName: productName || '' })}
        </Typography>

        {/* Action Button */}
        <Button
          variant="contained"
          onClick={handleGoToReleases}
          startIcon={<InsertLinkIcon />}
          sx={{
            backgroundColor: '#2B4D6F',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 600,
            padding: '8px 24px',
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: '#1E3752',
            },
          }}
        >
          {t('go-to-releases')}
        </Button>
      </Box>
    </Paper>
  );
};

export default NoReleasesState;
