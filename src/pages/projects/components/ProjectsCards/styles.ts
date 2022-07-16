import styled from 'styled-components';

export const Wrapper = styled.div`
  cursor: pointer;

  border: 1px solid black;
  border-radius: 2px;

  :hover {
    border: 1px solid blue;
  }
`;

export const Circle = styled.div`
  height: 30px;
  width: 30px;

  margin-right: 20px;

  background-color: orange;

  border-radius: 50%;
`;
