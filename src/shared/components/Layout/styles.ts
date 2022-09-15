import styled from 'styled-components';

import { Container } from '@mui/material';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;

  min-height: 100vh;

  background-color: #f5f5f5;
`;

export const ContentContainer = styled(Container)`
  padding: 0;
`;
