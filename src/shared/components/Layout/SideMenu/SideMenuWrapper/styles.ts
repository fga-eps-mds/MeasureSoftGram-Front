import styled from 'styled-components';

// A casca fica fixa na altura da tela e segura o botão de recolher, que sai pela direita do menu. A rolagem fica
// no Content: com o overflow aqui, o botão seria cortado.
// Em tela estreita, o menu aberto ($overlay) sai da coluna e fica por cima do conteúdo (zIndex.drawer do MUI).
export const Wrapper = styled.div<{ $overlay?: boolean }>`
  height: 100vh;

  border-right: 0.1px solid rgba(0, 0, 0, 0.5);
  background-color: #2b4d6f;
  position: ${(props) => (props.$overlay ? 'fixed' : 'sticky')};
  top: 0;
  left: 0;
  z-index: ${(props) => (props.$overlay ? 1200 : 'auto')};
  filter: drop-shadow(4px 0px 9px rgba(0, 0, 0, 0.25));
`;

export const Content = styled.div`
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 4px;
`;

export const ItemContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const CollapseButton = styled.div`
  width: 45px;
  height: 45px;

  position: absolute;
  top: 50%;
  right: -9px;
  color: #ffffff;

  display: flex;
  justify-content: center;
  align-items: center;
  transform: translate(28%, -50%);

  border-radius: 50%;
  background-color: #38618a;
  cursor: pointer;
  z-index: 1;

  border: 0.1px solid rgba(0, 0, 0, 0.5);

  &:hover {
    background-color: #4073a7;
  }
`;

export const Logo = styled.img`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 20px 5px;
`;
