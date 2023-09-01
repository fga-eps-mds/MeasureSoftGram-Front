import '@testing-library/jest-dom';

import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ConfigsForm from '../ConfigsForm';
import mockedData from '../../../utils/mockedData.json';

const DATA = mockedData.data.characteristics;
const SUBTITLE_TEST = 'SUBTITLE';
const CHECKBOX_VALUES_CHAR = ['reliability', 'maintainability'];
const CHECKBOX_VALUES_SUBCHAR = ['testing_status', 'modifiability'];
const CHECKBOX_VALUES_MEASURE = ['passed_tests', 'test_builds'];

describe('<ConfigsForm />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot de characteristic', () => {
      const tree = render(
        <ConfigsForm
          type="characteristic"
          setCheckboxValues={jest.fn()}
          onChange={jest.fn()}
          setIsValuesValid={jest.fn()}
          subtitle={SUBTITLE_TEST}
          checkboxValues={CHECKBOX_VALUES_CHAR}
          data={DATA}
          disable={false}
        />
      );
      expect(tree).toMatchSnapshot();
    });
    it('Deve corresponder ao Snapshot de subcharacteristic', () => {
      const tree = render(
        <ConfigsForm
          type="subcharacteristic"
          setCheckboxValues={jest.fn()}
          onChange={jest.fn()}
          tabs={CHECKBOX_VALUES_CHAR}
          checkboxValues={CHECKBOX_VALUES_SUBCHAR}
          data={DATA}
          setIsValuesValid={jest.fn()}
          subtitle={SUBTITLE_TEST}
          disable={false}
        />
      );
      expect(tree).toMatchSnapshot();
    });
    it('Deve corresponder ao Snapshot de measure', () => {
      const tree = render(
        <ConfigsForm
          type="measure"
          setCheckboxValues={jest.fn()}
          onChange={jest.fn()}
          tabs={CHECKBOX_VALUES_SUBCHAR}
          checkboxValues={CHECKBOX_VALUES_MEASURE}
          data={DATA}
          setIsValuesValid={jest.fn()}
          subtitle={SUBTITLE_TEST}
          disable={false}
        />
      );
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    it('Deve chamar setCheckboxValues', () => {
      const setCheckboxValues = jest.fn();

      const { getByText, rerender } = render(
        <ConfigsForm
          type="characteristic"
          setCheckboxValues={setCheckboxValues}
          onChange={jest.fn()}
          setIsValuesValid={jest.fn()}
          subtitle={SUBTITLE_TEST}
          checkboxValues={CHECKBOX_VALUES_CHAR}
          data={DATA}
          disable={false}
        />
      );
      const button = getByText('reliability');
      fireEvent.click(button);

      expect(setCheckboxValues).toBeCalled();

      rerender(
        <ConfigsForm
          type="characteristic"
          setCheckboxValues={setCheckboxValues}
          onChange={jest.fn()}
          setIsValuesValid={jest.fn()}
          subtitle={SUBTITLE_TEST}
          checkboxValues={[CHECKBOX_VALUES_CHAR[1]]}
          data={DATA}
          disable={false}
        />
      );
      fireEvent.click(button);
      expect(setCheckboxValues).toBeCalledTimes(2);
    });

    it('Deve chamar o onChange quando o tab não estiver incluso', () => {
      const onChange = jest.fn();

      render(
        <ConfigsForm
          type="subcharacteristic"
          setCheckboxValues={jest.fn()}
          onChange={onChange}
          setIsValuesValid={jest.fn()}
          subtitle={SUBTITLE_TEST}
          checkboxValues={CHECKBOX_VALUES_SUBCHAR}
          tabs={[CHECKBOX_VALUES_CHAR[1]]}
          data={DATA}
          disable={false}
        />
      );

      expect(onChange).toBeCalled();
    });
  });
});
