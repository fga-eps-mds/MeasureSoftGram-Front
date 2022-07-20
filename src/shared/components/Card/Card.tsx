import React from 'react';
import { Card as Wrapper, CardContent, Typography } from '@mui/material';

interface Props {
  title: string;
  value: number;
}

const Card: React.FC<Props> = ({ title, value }) => (
  <Wrapper
    sx={{
      width: 300,
      height: 200,
      backgroundColor: '#113D4C',
      marginTop: '20px',
      borderRadius: '5px'
    }}
  >
    <CardContent>
      <Typography variant="h5" textAlign="center" color="white" component="div">
        {title}
      </Typography>
      <Typography variant="h2" textAlign="center" marginTop="20px" color="white">
        {value}
      </Typography>
    </CardContent>
  </Wrapper>
);

export default Card;
