import styled from 'styled-components';

export const LayoutGrid = styled.div<{ $showSidebar?: boolean }>`
  display: grid;
  min-height: 100vh;

  ${(props) =>
    props.$showSidebar
      ? `
        grid-template-columns: 328px 1fr min-content;
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

export const SideMenuArea = styled.div`
  grid-area: side-menu;
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
