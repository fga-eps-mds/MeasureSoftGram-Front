import React from 'react';
import Link from 'next/link';

import { Box, Button, IconButton, IconButtonProps, Typography } from '@mui/material';
import { ChevronRight, MoreVert } from '@mui/icons-material';

import * as Styles from './styles';

interface Props {
  id: number;
  name: string;
  url: string;
  onClickMoreVert: IconButtonProps['onClick'];
}

const CardNavigation: React.FC<Props> = ({ id, name, url, onClickMoreVert }) => (
  <Button key={id} variant="outlined">
    <Link href={url}>
      <Box display="flex" alignItems="center" paddingX="10px" paddingY="5px">
        <Styles.Circle />

        <Typography variant="subtitle1">{name}</Typography>

        <Box display="flex" alignItems="center" marginLeft="15px">
          <ChevronRight />
        </Box>
      </Box>
    </Link>
    <IconButton color="primary" onClick={onClickMoreVert}>
      <MoreVert />
    </IconButton>
  </Button>
);

export default CardNavigation;
