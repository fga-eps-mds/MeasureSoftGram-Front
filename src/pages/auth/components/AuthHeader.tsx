import { Box, Divider, Typography } from '@mui/material';
import React, { memo, ReactElement } from 'react';

export const AuthHeader = memo(
  ({ title, subTitle, loginButton }: { title: string; subTitle: string; loginButton: ReactElement }) => (
    <Box display="flex" flexDirection="column" gap="2rem">
      <Typography variant="h4" fontWeight="bold">
        {title}
      </Typography>

      <Divider variant="fullWidth" sx={{ ':after': { borderColor: '#113D4C' }, ':before': { borderColor: '#113D4C' } }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: '300' }}>{subTitle}</Typography>
      </Divider>

      <Box marginBottom="2rem" display="flex" justifyContent="center">
        {loginButton}
      </Box>
    </Box>
  )
);
AuthHeader.displayName = 'AuthHeader';
