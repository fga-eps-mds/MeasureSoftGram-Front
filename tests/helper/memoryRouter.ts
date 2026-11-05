// Router em memória para os specs que precisam seguir a navegação (o `next-router-mock` não cobre o App Router).
const memoryRouter = {
  asPath: '/',
  pathname: '/',
  query: {} as Record<string, string | string[] | undefined>,
  isReady: true,
  push: jest.fn((url: string) => {
    memoryRouter.asPath = url;
  }),
  replace: jest.fn((url: string) => {
    memoryRouter.asPath = url;
  }),
  back: jest.fn(),
  prefetch: jest.fn(),
  refresh: jest.fn(),
  setCurrentUrl(url: string) {
    memoryRouter.asPath = url;
  }
};

export const useRouter = () => memoryRouter;

export default memoryRouter;
