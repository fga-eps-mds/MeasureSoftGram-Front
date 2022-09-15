import styled from 'styled-components';

import { Button } from '@mui/material';

export const Wrapper = styled.div`
  height: 100vh;
  width: inherit;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  padding: 30px 12px;
  left: 0;

  background-color: white;

  position: fixed;
`;

export const Ul = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 30px 0 0 0;
`;

export const Li = styled.li`
  list-style-type: none;
  padding-bottom: 2px;

  &:not(:first-child) {
    margin-top: 8px;
  }
`;

export const Logo = styled.img`
  cursor: pointer;
`;

export const NavButton = styled(Button)`
  justify-content: flex-start;

  :disabled {
    background-color: #f2f2f2;
  }
`;
