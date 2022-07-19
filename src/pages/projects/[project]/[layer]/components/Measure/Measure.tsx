import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const Measure = () => (
  <Card
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
        medida
      </Typography>
      <Typography variant="h2" textAlign="center" marginTop="20px" color="white">
        55.5
      </Typography>
    </CardContent>
  </Card>
);

export default Measure;
