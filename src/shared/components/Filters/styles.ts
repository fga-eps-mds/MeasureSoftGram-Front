import { Box } from '@mui/material';
import styled from 'styled-components';

export const FiltersTitle = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #ffffff;
  margin: 0.4rem;

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
    font-size: 1rem;
    line-height: 1.5rem;
    color: #000000;

    padding: 0.4rem;
  }
`;

export const OptionContainer = styled(Box)``;

export const Option = styled(Box)`
  & > span:first-child {
    padding: 0.2rem;
    margin-left: 1rem;
  }

  p {
    font-weight: 400;
    font-size: 0.8rem;
    line-height: 1rem;
  }
`;
