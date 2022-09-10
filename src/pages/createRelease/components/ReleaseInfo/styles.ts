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
  h2 {
    font-size: 22px;
    font-weight: normal;
  }

  & > div:first-child {
    margin-bottom: 56px;
  }
`;
