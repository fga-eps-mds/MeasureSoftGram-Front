import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from 'next/router';
import Head from "next/head";
import Image from "next/image";

import { NextPageWithLayout } from "@pages/_app.next";
import getLayout from "@components/Layout";
import { Container, Box, Typography } from "@mui/material";
import useRequireAuth from "@hooks/useRequireAuth";
import MSGButton from '../../components/idv/buttons/MSGButton';

const IMAGE_SOURCE = '/images/svg/logo.svg';

const Home: NextPageWithLayout = () => {
  useRequireAuth();
  const { t } = useTranslation('home');
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{t('title')} - MeasureSoftGram</title>
      </Head>
      <Container>
        <Box
          display="flex"
          flexDirection="column"
          height="100vh"
          justifyContent="center"
          alignItems="center"
          gap="12.5rem"
        >
          <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
            <Box sx={{ minWidth: '250px', maxWidth: '250px' }}>
              <Image src={IMAGE_SOURCE} alt="logo" height={250} width={250} />
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center" paddingLeft="1rem">
              <Typography style={{ color: "#5E5E5E", fontWeight: "bold", fontSize: "90px", letterSpacing: "2px" }}>
                {t('home-title')}
              </Typography>
              <Typography style={{ color: "#5E5E5E", fontSize: "18px", fontWeight: "bold", marginTop: "-15px" }}>
                {t('description')}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" width="85%">
            <MSGButton variant="secondary" width="35%" onClick={() => router.push('/about')}>
              {t('button.about')}
            </MSGButton>
            <MSGButton width="35%" onClick={() => router.push('/products')}>
              {t('button.start')}
            </MSGButton>
          </Box>
        </Box>
      </Container>
    </>
  );
};

Home.getLayout = getLayout;
Home.disableBreadcrumb = true;

export default Home;
