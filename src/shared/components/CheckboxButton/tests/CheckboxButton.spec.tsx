import '@testing-library/jest-dom';

import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import CheckboxButton from '../CheckboxButton';

const BUTTON_NAME = 'ButtonLabel';

describe('<CheckboxButton />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot com botão true', () => {
      const tree = render(<CheckboxButton label={BUTTON_NAME} checked />);
      expect(tree).toMatchSnapshot();
    });
    it('Deve corresponder ao Snapshot com botão false', () => {
      const tree = render(<CheckboxButton label={BUTTON_NAME} />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    it('Deve corresponder ao Snapshot com botão false', () => {
      const onClick = jest.fn();
      const { getByText } = render(<CheckboxButton label={BUTTON_NAME} onClick={onClick} />);

      fireEvent.click(getByText(BUTTON_NAME));

      expect(onClick).toBeCalled();
    });
  });
});
