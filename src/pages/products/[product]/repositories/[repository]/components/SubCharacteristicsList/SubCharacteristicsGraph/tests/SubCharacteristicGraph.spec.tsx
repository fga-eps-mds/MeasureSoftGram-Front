import '@testing-library/jest-dom';

import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import SubCharacteristicsGraph from '../SubCharacteristicsGraph';

const SQC = {"id":302,"value":0.6641230995964292,"created_at":new Date("2022-08-28T18:04:48")}
const checkedOptions = {"reliability":true,"maintainability":true,"testing_status":true,"modifiability":true}
const repositoryHistoricalSubCharacteristics = [{"id":1,"key":"modifiability","name":"Modifiability","description":null,"history":[{"id":577,"subcharacteristic_id":1,"value":0.6454758461579367,"created_at":new Date("2022-08-01T18:31:00")}]}]

jest.mock('echarts-for-react', () => ({
  __esModule: true,
  ...jest.requireActual('echarts-for-react'),
  default: () => <div />
}));

describe('<SubCharacteristicsGraph />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <SubCharacteristicsGraph
          SQC={SQC}
          checkedOptions={checkedOptions}
          subCharacteristics={repositoryHistoricalSubCharacteristics}
        />
      )

      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    it('Deve corresponder ao Snapshot', () => {
      const { getByTestId } = render(
        <SubCharacteristicsGraph
          SQC={SQC}
          checkedOptions={checkedOptions}
          subCharacteristics={repositoryHistoricalSubCharacteristics}
        />
      )

      fireEvent.click(getByTestId('open-row'))

      expect(getByTestId('open')).toBeInTheDocument();
    });
  });
});
