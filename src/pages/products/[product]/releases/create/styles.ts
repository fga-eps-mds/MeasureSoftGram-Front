import styled from 'styled-components';

export const Header = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;

  margin-bottom: 24px;
  & > h1 {
    font-size: 42px;
    font-weight: 400;
  }

  & > p {
    font-size: 16px;
  }
`;

export const Body = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;

  h2 {
    font-size: 22px;
    font-weight: normal;
  }

  & > div:first-child {
    margin-bottom: 56px;
  }
`;
