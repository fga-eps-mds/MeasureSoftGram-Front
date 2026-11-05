'use client';

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { LandingHeader } from './components/LandingHeader';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ValuePropsSection } from './components/ValuePropsSection';
import { IntegrationsSection } from './components/IntegrationsSection';
import { PublicationsSection } from './components/PublicationsSection';
import { CommunitySection } from './components/CommunitySection';
import { LandingFooter } from './components/LandingFooter';

const Landing: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box component="main" sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {mounted && (
        <>
          <LandingHeader />
          <HeroSection />
          <HowItWorksSection />
          <ValuePropsSection />
          <IntegrationsSection />
          <PublicationsSection />
          <CommunitySection />
          <LandingFooter />
        </>
      )}
    </Box>
  );
};

export default Landing;
