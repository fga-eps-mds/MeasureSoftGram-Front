import React from 'react';
import Head from 'next/head';
import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import { GetServerSideProps } from 'next';
import { productQuery } from '@services/product';
import { ReleaseGoal } from '@customTypes/product';
import CompareGoalsChart from '@components/CompareGoalsChart';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const product = context?.params?.product as string;
    const releaseId = context?.params?.release as number;

    const organizationId = product.split('-')[0];
    const productId = product.split('-')[1];

    const response = await productQuery.getCompareGoalAccomplished(organizationId, productId, releaseId);

    if (!response?.data?.[0]?.id) {
      return {
        redirect: {
          permanent: false,
          destination: '/products'
        },
        props: {}
      };
    }

    return {
      props: {
        release: response?.data?.[0]
      }
    };
  } catch (err) {
    console.log('log', context);
    return {
      redirect: {
        permanent: false,
        destination: `/products/${context?.params?.product}`
      },
      props: {}
    };
  }
};

interface ReleaseProps {
  release: ReleaseGoal;
}
const Release: NextPageWithLayout = ({ release }: ReleaseProps) => {
  console.log(release);
  return (
    <>
      <Head>
        <title>{release?.release_name || 'release'}</title>
      </Head>
      <Box display="flex" alignItems="center">
        <Box display="flex" alignItems="center" gap="1rem">
          <Typography fontSize="32px" fontWeight="400">
            Release
          </Typography>
          <Typography fontSize="32px" fontWeight="400" color="GrayText">
            {release?.release_name}
          </Typography>
        </Box>
      </Box>
      <CompareGoalsChart release={release} />
    </>
  );
};

Release.getLayout = getLayout;

export default Release;
