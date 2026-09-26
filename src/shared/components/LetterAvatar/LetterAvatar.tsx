import React from 'react';
import { Avatar, Box } from '@mui/material';
import * as Styles from './styles';

function stringAvatar(name: string) {
  if (name === undefined) return '?';
  const nameFormated = name.toUpperCase().split(/[ \-_]/g);
  if (nameFormated.length > 1) return `${nameFormated[0][0]}${nameFormated[1][0]}`;
  return `${name.split(' ')[0][0]}`;
}

interface Props {
  name: string;
  icon?: JSX.Element;
}

function LetterAvatar({ name, icon }: Props) {
  return (
    <Box sx={{ maxHeight: '40px' }}>
      <Avatar sx={{ bgcolor: '#38618A' }}>{stringAvatar(name)}</Avatar>
      {icon && <Styles.IconContainer>{icon}</Styles.IconContainer>}
    </Box>
  );
}

export default LetterAvatar;
