import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import getLayout from '@components/Layout';
import { productQuery } from '@services/product';
import { IReleasesWithGoalAndAccomplished } from '@customTypes/product';
import { Box } from '@mui/system';
import { Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { formatDate } from '@utils/formatDate';
// import SimpleLineChart from './components/CurveGraph/CurveGraph';
import dynamic from 'next/dynamic';
import * as Styles from './styles';

const SimpleLineChart = dynamic(() => import('./components/CurveGraph/CurveGraph'));

const Release: any = () => {
  const router = useRouter();
  const routerParams: any = router.query;

  const [rpXrr, setRpXrr] = useState<IReleasesWithGoalAndAccomplished | undefined>();
  const [planejado, setPlanejado] = useState<number[]>([]);
  const [release, setRelease] = useState<any>();

  useEffect(() => {
    if (router.isReady) {
      const organizationId = routerParams.product.split('-')[0];
      const productId = routerParams.product.split('-')[1];
      const releaseId = routerParams.release;

      productQuery.getReleasesAndPlannedXAccomplishedByID(
        organizationId, productId, releaseId
      ).then((res) => {
        setRpXrr(res.data);
        setPlanejado([
          (res.data.planned.reliability || 0),
          (res.data.planned.maintainability || 0),
        ]);
        setRelease(res.data.release);
      });
    }
  }, [router.isReady]);

  const xLabels = [
    'Reliability',
    'Maintainability',
  ];

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
              <Typography fontSize="32px" fontWeight="500" color="#33568E">
                {release?.release_name}
              </Typography>
            </Box>
            Duração da release
            <Typography fontSize="14px" fontWeight="300">
              {formatDate(release?.start_at)} - {formatDate(release?.end_at)}
            </Typography>
          </Box>
        </Box>
        {
          rpXrr !== undefined && Object.keys(rpXrr?.accomplished).map((repositorio: string) => (
            <Styles.ContainerGraph>
              <Typography fontSize="24px" fontWeight="400">
                {repositorio}
              </Typography>
              <SimpleLineChart planejado={planejado} realizado={rpXrr?.accomplished[repositorio]} labels={xLabels} />
            </Styles.ContainerGraph>
          ))
        }
      </Container>
    </>
  );
};

Release.getLayout = getLayout;

export default Release;
