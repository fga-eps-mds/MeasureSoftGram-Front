import React from 'react';
import Head from 'next/head';
import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import { GetServerSideProps } from 'next';
import { productQuery } from '@services/product';
import { ReleaseGoal } from '@customTypes/product';
import CompareGoalsChart from '@components/CompareGoalsChart';
import { Box } from '@mui/system';
import { Container, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useRequest } from '@hooks/useRequest';
import { formatDate } from '@utils/formatDate';

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
        release: response?.data?.[0],
        organizationId,
        productId
      }
    };
  } catch (err) {
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
  organizationId: string;
  productId: string;
}
const Release: NextPageWithLayout = ({ release, organizationId, productId }: ReleaseProps) => {
  const router = useRouter();
  const { data: releaseList } = useRequest<ReleaseGoal[]>(
    productQuery.getReleaseList(organizationId, productId as string)
  );
  return (
    <>
      <Head>
        <title>{release?.release_name || 'release'}</title>
      </Head>
      <Container>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Box display="flex" alignItems="center" gap="1rem">
              <Typography fontSize="32px" fontWeight="400">
                Release
              </Typography>
              <Typography fontSize="32px" fontWeight="400" color="GrayText">
                {release?.release_name}
              </Typography>
            </Box>
            Duração da release
            <Typography fontSize="14px" fontWeight="300">
              {formatDate(release?.start_at)} - {formatDate(release?.end_at)}
            </Typography>
          </Box>

          <Box>
            <InputLabel id="demo-simple-select-label">Selecione a release</InputLabel>
            <Select
              variant="standard"
              value={release?.id}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Selecione a release"
              fullWidth
              onChange={(e) => router.push(`/products/${router?.query?.product}/releases/${e.target.value}`)}
            >
              {releaseList?.map((item) => (
                <MenuItem value={item?.id} key={item.id}>
                  {item?.release_name}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
        <CompareGoalsChart release={release} />
      </Container>
    </>
  );
};

Release.getLayout = getLayout;

export default Release;
