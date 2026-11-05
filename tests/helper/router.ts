import { createMockedRoute } from '@tests/jestSetup';
import { useRouter } from '@hooks/useRouter';

function setRouteQuery(query: Object) {
  (useRouter as jest.Mock).mockImplementation(() => createMockedRoute(query));
}

export default setRouteQuery;
