import React from 'react';
import Link from 'next/link';

import { Box, Button, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';

import * as Styles from './styles';

interface Props {
  id: string;
  name: string;
  url: string;
}

const CardNavigation: React.FC<Props> = ({ id, name, url }) => (
  <Button key={id} variant="outlined">
    <Link href={url}>
      <Box display="flex" alignItems="center" padding="10px" /*<paddingX="10px" paddingY="5px"*/>
        <Styles.Circle />

        <Typography variant="subtitle1">{name}</Typography>

        {/*<Box display="flex" alignItems="center" marginLeft="15px">
          <ChevronRight />
        </Box>*/}
      </Box>
    </Link>
  </Button>
);

export default CardNavigation;
