/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';

import { Box, Typography, Link, IconButton } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import * as Styles from './styles';

const { CardBody } = Styles;

interface MainCardProps {
  title: {
    label: string;
    href?: string;
  };
  subTitle?: string;
}

const MainCard = ({ title, subTitle }: MainCardProps) => (
  <CardBody>
    <Box width="100%" flexDirection="row" display="flex">
      <Box width="100%">
        <Typography variant="h4" textAlign="start">
          <Link href={title.href}>{title.label}</Link>
        </Typography>
        <Typography textAlign="start" color="#7A7A7A">
          {subTitle}
        </Typography>
      </Box>
      <Box alignItems="flex-end">
        <IconButton>
          <MoreVert />
        </IconButton>
      </Box>
    </Box>
  </CardBody>
);

export default MainCard;
