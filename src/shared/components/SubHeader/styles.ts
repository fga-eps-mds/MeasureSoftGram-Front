import styled from 'styled-components';

export const Wrapper = styled.nav`
  min-height: 50px;

  background-color: #231b22;
`;

export const Button = styled.span`
  height: 50px;

  display: flex;
  align-items: center;

  color: white;

  border-bottom: 3px solid white;

  :not(:first-child) {
    margin-left: 20px;
  }
`;
