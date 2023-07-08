import styled from 'styled-components';

export const Header = styled.div`
  margin-bottom: 64px;
  width: 600px;

  & > h1 {
    font-size: 42px;
    font-weight: 400;
  }

  & > p {
    font-size: 16px;
  }
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 45vh;

  justify-content: center;
  align-content: center;
  align-self: center;
`;
