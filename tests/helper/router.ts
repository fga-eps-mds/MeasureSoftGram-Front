import { createMockedRoute } from '@tests/jestSetup';
import * as hooks from 'next/router';

function setRouteQuery(query: Object) {
  jest.spyOn(hooks, 'useRouter').mockImplementation(() => createMockedRoute(query));
}

export default setRouteQuery;
