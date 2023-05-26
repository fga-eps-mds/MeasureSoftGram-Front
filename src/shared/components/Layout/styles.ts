import styled from 'styled-components';

export const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: 'side-menu main-content';
  min-height: 100vh;
`;

export const SideMenuArea = styled.div`
  grid-area: side-menu;
`;

export const MainContentArea = styled.div`
  grid-area: main-content;
`;
