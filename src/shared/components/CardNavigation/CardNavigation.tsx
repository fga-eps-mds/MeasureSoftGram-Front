import React from 'react';
import Link from 'next/link';

import { Box, Button, Typography, Divider } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';


interface Props {
  id: string;
  name: string;
  url: string;
  description: string;
}

const CardNavigation: React.FC<Props> = ({ id, name, url, description }) => (
  <Button key={id} variant="outlined" style={{ textAlign: 'left', width: '100%', justifyContent: 'space-between' }}>
    <Link href={url} passHref>
      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" padding="10px">
        <Box display="flex" flexDirection="column" width="100%">
          <Typography variant="subtitle1" style={{ color: '#2B4D6F', fontWeight: 'bold' }}>
            {name}
          </Typography>

          <Divider style={{ backgroundColor: 'grey', margin: '10px 0' }} />

          <Typography variant="body2" color="textSecondary">
            {description}
          </Typography>
        </Box>

        <Box
          width="3em"
          display="flex"
          alignItems="center"
          justifyContent="center"
          marginLeft="2em"
        >
          <ChevronRight fontSize="large" />
        </Box>
      </Box>
    </Link>
  </Button>
);

export default CardNavigation;
