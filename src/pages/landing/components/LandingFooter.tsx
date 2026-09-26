import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Box, Container, Typography, Stack, Link as MuiLink } from '@mui/material';
import { EXTERNAL_LINKS, APP_ENTRY_ROUTE } from '../constants';

const LOGO_SOURCE = '/images/svg/logo_white.svg';

export const LandingFooter: React.FC = () => {
  const { t } = useTranslation('landing');
  const router = useRouter();

  return (
    <Box component="footer" sx={{ backgroundColor: '#2B4D6F', color: '#ffffff', py: 5 }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Image src={LOGO_SOURCE} alt="MeasureSoftGram" width={32} height={32} />
            <Box>
              <Typography sx={{ fontWeight: 700 }}>MeasureSoftGram</Typography>
              <Typography sx={{ fontSize: '0.85rem', opacity: 0.8 }}>
                {t('footer.tagline')}
              </Typography>
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <MuiLink
              href={EXTERNAL_LINKS.docs}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: '#ffffff', fontWeight: 500 }}
            >
              {t('footer.docs')}
            </MuiLink>
            <MuiLink
              href={EXTERNAL_LINKS.repositories}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: '#ffffff', fontWeight: 500 }}
            >
              {t('footer.repos')}
            </MuiLink>
            <MuiLink
              component="button"
              type="button"
              onClick={() => router.push(APP_ENTRY_ROUTE)}
              underline="hover"
              sx={{ color: '#ffffff', fontWeight: 500 }}
            >
              {t('footer.enter')}
            </MuiLink>
          </Stack>
        </Stack>

        <Typography sx={{ mt: 4, fontSize: '0.8rem', opacity: 0.7 }}>
          {t('footer.rights')}
        </Typography>
      </Container>
    </Box>
  );
};

export default LandingFooter;
