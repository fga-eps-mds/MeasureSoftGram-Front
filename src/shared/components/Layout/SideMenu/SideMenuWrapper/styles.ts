import styled from 'styled-components';

export const Wrapper = styled.div`
  height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 4px;

  background-color: white;
  position: sticky;
  top: 0;
  left: 0;
  filter: drop-shadow(4px 0px 9px rgba(0, 0, 0, 0.25));
`;

export const ItemContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const CollapseButton = styled.div`
  width: 45px;
  height: 45px;

  position: absolute;
  top: 50%;
  right: 0;

  display: flex;
  justify-content: center;
  align-items: center;
  transform: translate(28%, -50%);

  border-radius: 50%;
  background-color: white;
  cursor: pointer;
  z-index: 1;

  &:hover {
    background-color: #f5f5f5;
  }
`;

export const Logo = styled.img`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 20px 0 20px 12px;
`;
