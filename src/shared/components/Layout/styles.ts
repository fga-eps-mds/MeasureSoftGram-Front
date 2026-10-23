import styled from 'styled-components';

// Com o menu, a coluna do conteúdo é minmax(0, 1fr): com 1fr (minmax(auto, 1fr)), ela não ficava mais estreita que a
// largura intrínseca do conteúdo, e o breadcrumb, que quebra em linhas, alargava a página em tela estreita.
export const LayoutGrid = styled.div<{ $showSidebar?: boolean }>`
  display: grid;
  min-height: 100vh;

  ${(props) =>
    props.$showSidebar
      ? `
        grid-template-columns: min-content minmax(0, 1fr) min-content;
        grid-template-rows: 1fr;
        grid-template-areas: 'side-menu main-content right-side';
      `
      : `
        grid-template-columns: 1fr min-content;
        grid-template-rows: auto 1fr;
        grid-template-areas:
          'top-header top-header'
          'main-content right-side';
      `}
`;

// Abaixo do sm do MUI, o menu aberto fica por cima do conteúdo e sai da coluna: ela guarda a largura do menu
// recolhido, para o conteúdo não pular.
export const SideMenuArea = styled.div`
  grid-area: side-menu;

  @media (max-width: 599.95px) {
    min-width: 63px;
  }
`;

export const TopHeaderArea = styled.header`
  grid-area: top-header;
  height: 60px;
  background-color: #2b4d6f;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  color: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 10;
`;

export const HeaderLogo = styled.img`
  height: 40px;
  cursor: pointer;
`;

export const MainContentArea = styled.div`
  grid-area: main-content;
  background-color: #fafafa;
`;

export const RightSideArea = styled.div`
  grid-area: right-side;
`;
