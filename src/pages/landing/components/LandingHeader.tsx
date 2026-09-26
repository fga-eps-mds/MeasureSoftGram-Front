import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { AppBar, Toolbar, Box, Button, Container, Link as MuiLink } from '@mui/material';
import MSGButton from '../../../components/idv/buttons/MSGButton';
import { EXTERNAL_LINKS, APP_ENTRY_ROUTE } from '../constants';

const LOGO_SOURCE = '/images/svg/logo.svg';

export const LandingHeader: React.FC = () => {
  const { t } = useTranslation('landing');
  const router = useRouter();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e6e9ef' }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Image src={LOGO_SOURCE} alt="MeasureSoftGram" width={36} height={36} />
            <Box
              component="span"
              sx={{ color: '#2B4D6F', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.5px' }}
            >
              MeasureSoftGram
            </Box>
          </Box>

          <Box
            display={{ xs: 'none', md: 'flex' }}
            alignItems="center"
            gap={3}
          >
            <MuiLink href="#how-it-works" underline="none" sx={{ color: '#4a4a4a', fontWeight: 500 }}>
              {t('nav.howItWorks')}
            </MuiLink>
            <MuiLink href="#value" underline="none" sx={{ color: '#4a4a4a', fontWeight: 500 }}>
              {t('nav.value')}
            </MuiLink>
            <MuiLink href="#integrations" underline="none" sx={{ color: '#4a4a4a', fontWeight: 500 }}>
              {t('nav.integrations')}
            </MuiLink>
            <MuiLink href="#publications" underline="none" sx={{ color: '#4a4a4a', fontWeight: 500 }}>
              {t('nav.publications')}
            </MuiLink>
            <MuiLink
              href={EXTERNAL_LINKS.docs}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{ color: '#4a4a4a', fontWeight: 500 }}
            >
              {t('nav.docs')}
            </MuiLink>
          </Box>

          <Box display="flex" alignItems="center">
            <Box display={{ xs: 'block', sm: 'none' }}>
              <Button
                variant="contained"
                onClick={() => router.push(APP_ENTRY_ROUTE)}
                sx={{ backgroundColor: '#2B4D6F', '&:hover': { backgroundColor: '#165870' } }}
              >
                {t('nav.enter')}
              </Button>
            </Box>
            <Box display={{ xs: 'none', sm: 'block' }}>
              <MSGButton onClick={() => router.push(APP_ENTRY_ROUTE)} width={140}>
                {t('nav.enter')}
              </MSGButton>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default LandingHeader;
