import styled from 'styled-components';

export const Wrapper = styled.nav`
  min-height: 50px;

  background-color: #231b22;
`;

interface Button {
  isClicked: boolean;
}

export const Button = styled.span<Button>`
  height: 50px;

  cursor: pointer;

  display: flex;
  align-items: center;

  color: white;
  border-bottom: ${({ isClicked }) => (isClicked ? '3px solid white' : null)};

  :not(:first-child) {
    margin-left: 25px;
  }
`;
