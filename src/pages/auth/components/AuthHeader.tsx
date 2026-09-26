import { Box, Divider, Typography } from '@mui/material';
import React, { memo, ReactElement } from 'react';
import Image from 'next/image';
import myImage from '../../../../public/images/svg/logo.svg';

export const AuthHeader = memo(
  ({ loginButton, subTitle }: { loginButton: ReactElement, subTitle: string }) => (
    <Box display="flex" flexDirection="column" gap="1rem">
      <Box sx={{ width: '50px', height: '50px', margin: 'auto', marginBottom: '50px' }}>
        <Image src={myImage} alt="Logo Measure" style={{ width: '100%', height: 'auto' }} />
      </Box>

      <Box display="flex" marginBottom="1rem" justifyContent="center">
        {loginButton}
      </Box>

      <Box marginBottom="2rem">
        <Divider variant="fullWidth" sx={{ ':after': { borderColor: '#2B4D6F' }, ':before': { borderColor: '#2B4D6F' } }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: '300' }}>{subTitle}</Typography>
        </Divider>
      </Box>

    </Box>
  )
);
AuthHeader.displayName = 'AuthHeader';
