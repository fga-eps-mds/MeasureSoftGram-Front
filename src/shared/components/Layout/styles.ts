import styled from 'styled-components';

import { Container } from '@mui/material';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;

  min-height: 100vh;

  background-color: #f5f5f5;
`;

export const ContentWrapper = styled.div`
  min-height: calc(100% - 60px);

  background-color: #fafafa;
`;

export const ContentContainer = styled(Container)`
  margin-left: 318px;
  padding: 0;
`;
