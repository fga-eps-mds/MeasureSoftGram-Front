import styled from 'styled-components';

export const Wrapper = styled.div<{ $collapsed?: boolean | null }>`
  width: ${(props) => (props.$collapsed ? 'auto' : '320px')};
  height: 45px;
  border-radius: 10px;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0 4px;

  color: #474747;
  font-weight: 400;
  font-size: 1.2rem;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

export const IconContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 40px;
`;
