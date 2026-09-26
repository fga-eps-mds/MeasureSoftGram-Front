import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Box, Container, Typography, Stack, Button, Chip } from '@mui/material';
import MSGButton from '../../../components/idv/buttons/MSGButton';
import { EXTERNAL_LINKS, APP_ENTRY_ROUTE } from '../constants';

const LOGO_SOURCE = '/images/svg/logo.svg';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation('landing');
  const router = useRouter();

  return (
    <Box
      component="section"
      sx={{
        background: 'linear-gradient(180deg, #f4f7fb 0%, #ffffff 100%)',
        py: { xs: 6, md: 10 }
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 6 }}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box flex={1}>
            <Chip
              label={t('hero.badge')}
              sx={{
                mb: 2,
                backgroundColor: '#e7eef6',
                color: '#2B4D6F',
                fontWeight: 600
              }}
            />
            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: '#1f2d3d',
                fontWeight: 800,
                fontSize: { xs: '2.2rem', md: '3rem' },
                lineHeight: 1.15,
                mb: 2
              }}
            >
              {t('hero.title')}
            </Typography>
            <Typography
              sx={{ color: '#5a6472', fontSize: '1.15rem', mb: 4, maxWidth: 560 }}
            >
              {t('hero.subtitle')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <MSGButton onClick={() => router.push(APP_ENTRY_ROUTE)} width={220}>
                {t('hero.primaryCta')}
              </MSGButton>
              <Button
                variant="outlined"
                href={EXTERNAL_LINKS.docs}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  height: '50px',
                  borderColor: '#2B4D6F',
                  color: '#2B4D6F',
                  fontWeight: 500,
                  '&:hover': { borderColor: '#165870', backgroundColor: '#eef3f8' }
                }}
              >
                {t('hero.secondaryCta')}
              </Button>
            </Stack>
          </Box>

          <Box
            flex={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%' }}
          >
            <Box
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: '24px',
                backgroundColor: '#ffffff',
                boxShadow: '0 18px 40px rgba(43, 77, 111, 0.12)',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Image src={LOGO_SOURCE} alt="MeasureSoftGram" width={240} height={240} priority />
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default HeroSection;
