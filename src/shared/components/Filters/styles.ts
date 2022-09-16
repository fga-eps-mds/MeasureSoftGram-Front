import { Box } from '@mui/material';
import styled from 'styled-components';

export const FiltersTitle = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #f5f5f5;

  margin-bottom: 0.4rem;
  margin-top: 0.4rem;
  padding: 0;

  outline: 0;
  border: 0;
  transition: 0.2s all;
  cursor: pointer;

  &:hover {
    opacity: 0.6;
    border-radius: 2px;
    background-color: #f1f1f1;
  }

  span {
    font-weight: 700;
    font-size: 14px;
    line-height: 1rem;
    text-align: initial;
    color: #000000;

    padding: 0.4rem;
  }
`;

export const OptionContainer = styled(Box)``;

export const Option = styled(Box)`
  & > span:first-child {
    padding: 0.2rem;
    font-size: 12px;
  }

  span {
    font-weight: 400;
    font-size: 14px;
    line-height: 1rem;
  }
`;
