import 'jest-canvas-mock';
import * as hooks from 'next/router';
import { NextRouter } from 'next/router';

export const createMockedRoute = (query?: Object) => {
  return query as unknown as NextRouter;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.fetch = jest.fn();

jest.mock('next/config', () => () => ({ publicRuntimeConfig: {} }));
jest.spyOn(hooks, 'useRouter').mockImplementation(() => createMockedRoute());
