import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';
import Link from '@mui/material/Link';

interface AuthFooterProps {
  text: string;
  link: string;
  changeAuthState: () => void;
}

export const AuthFooter = memo(({ text, link, changeAuthState }: AuthFooterProps) => (
  <Box display="flex" gap="0.25rem">
    <Typography sx={{ fontSize: '0.9rem' }}>{text}</Typography>
    {/*  eslint-disable-next-line jsx-a11y/anchor-is-valid */}
    <Link sx={{ fontSize: '0.9rem' }} component="button" href="#" onClick={changeAuthState}>
      {link}
    </Link>
  </Box>
));
AuthFooter.displayName = 'AuthFooter';
