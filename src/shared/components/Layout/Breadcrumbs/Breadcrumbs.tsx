import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Breadcrumbs as BreadcrumbsMUI, Typography, Box } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { useProviderTranslation as useTranslation } from '@hooks/useProviderTranslation';

export function Breadcrumbs() {
  const { t } = useTranslation('breadcrumb');

  const router = useRouter();

  const getCrumbs = () => {
    // sem a barra final (trailingSlash: true) e sem query: no HTML gerado no build o caminho vem sem a barra, e a
    // diferença no último item fazia a hidratação falhar e o React renderizar a página inteira de novo
    const routePath = router.asPath.split(/[?#]/)[0].replace(/(.)\/+$/, '$1');
    const currentPath: string[] = [];
    const pathArray = routePath.split('/').slice(1);

    const paths = pathArray
      .map((path, index) => {
        currentPath.push(path);

        if (pathArray[0] === '') {
          return (
            <Typography color="text.primary" variant="subtitle1" key={path}>
              {t('products')}
            </Typography>
          );
        }

        const productName = path.replace(/^\d+-\d+-/, '');

        if (pathArray.length === index + 1)
          return (
            <Typography color="text.primary" variant="subtitle1" key={path}>
              {t(path)}
            </Typography>
          );

        return (
          <Typography key={path} variant="subtitle1">
            <Link href={`/${currentPath.join('/')}`}>{t(path) || decodeURIComponent(productName)}</Link>
          </Typography>
        );
      })

    paths.unshift(
      <Typography color="text.primary" variant="subtitle1" key="organizations">
        {t('organizations')}
      </Typography>
    );

    paths.unshift(
      <Link key="/home" href="/home">
        <Box
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <HomeOutlinedIcon
            sx={{
              cursor: "pointer",
              fontSize: "25px"
            }}
          />
        </Box>
      </Link>
    );

    return paths;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column"
      }}
    >
      <BreadcrumbsMUI
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: ".1rem",
          '.MuiBreadcrumbs-separator': {
            margin: "0px"
          }
        }}
      >
        {getCrumbs()}
      </BreadcrumbsMUI>
      <Box
        sx={{
          width: "100%",
          height: "1px",
          backgroundColor: "#000000",
          opacity: "60%",
          marginTop: "5px",
          borderRadius: ".5px"
        }}
      />
    </Box>
  );
}
