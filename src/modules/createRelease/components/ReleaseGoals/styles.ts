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
  & > div:first-child {
    display: flex;

    & > p {
      margin: 0 0 0 16px;
    }
  }

  & > div:nth-child(2) {
    margin: 40px 0;
  }
`;
