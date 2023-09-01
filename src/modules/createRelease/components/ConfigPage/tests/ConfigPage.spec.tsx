import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ConfigPage from '../ConfigPage';

const REPO_NAME = 'REPO_TITLE';

jest.mock('@services/product', () => ({
  productQuery: {
    getProductCurrentPreConfig: () => ({ data: { "id": 25, "name": "3", "data": { "characteristics": [{ "key": "reliability", "weight": 50, "subcharacteristics": [{ "key": "testing_status", "weight": 100, "measures": [{ "key": "passed_tests", "weight": 33 }, { "key": "test_builds", "weight": 33 }, { "key": "test_coverage", "weight": 34 }] }] }, { "key": "maintainability", "weight": 50, "subcharacteristics": [{ "key": "modifiability", "weight": 100, "measures": [{ "key": "non_complex_file_density", "weight": 33 }, { "key": "commented_file_density", "weight": 33 }, { "key": "duplication_absense", "weight": 34 }] }] }] }, "created_at": "2022-09-15T18:56:57-03:00" } }),
    getPreConfigEntitiesRelationship: () => ({
      data: [{
        key: 'reliability',
        id: 1,
        name: 'Confiabilidade',
        description: '',
        subcharacteristics: []
      }]
    }),
    createProductReleaseGoal: () => ({ data: [{ id: 1, release_name: 'r1', start_at: '', end_at: '', changes: [] }] })
  }
}));

jest.mock('@modules/createRelease/context/useCreateRelease', () => ({
  ...jest.requireActual('@modules/createRelease/context/useCreateRelease'),
  useCreateReleaseContext: () => ({
    configPageData: {
      characteristicCheckbox: [],
      setCharacteristicCheckbox: () => { },
      characteristicData: [],
      setCharacteristicValuesValid: (value: boolean) => { },
    },
    setCharacteristicValuesValid: (value: boolean) => { },
  })
}));

describe('<ConfigPage />', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <ConfigPage page={0} title={REPO_NAME} />
      );
      expect(tree).toMatchSnapshot();
    });
  });
});
