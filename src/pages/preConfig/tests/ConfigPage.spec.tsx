import '@testing-library/jest-dom';

import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import axios from 'axios';
import ConfigPage from '../ConfigPage';
import mockedData from '../utils/mockedData.json';

const NEXT = 'Avançar';
const END = 'Finalizar';
const CLOSE = 'Cancelar';

describe('<ConfigPage />', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    jest.spyOn(axios, 'get').mockImplementation(() => Promise.resolve({ status: 200, data: mockedData.data }));
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<ConfigPage isOpen onClose={jest.fn()} repoName="Test" />);
      expect(tree).toMatchSnapshot();
    });
  });
  describe('Comportamento', () => {
    it('Deve fechar somente ao avançar páginas', () => {
      const onClose = jest.fn();

      const { getByText } = render(<ConfigPage isOpen onClose={onClose} repoName="Test" />);

      fireEvent.click(getByText('reliability'));
      fireEvent.click(getByText(NEXT));

      fireEvent.click(getByText('testing status'));
      fireEvent.click(getByText(NEXT));

      fireEvent.click(getByText('passed tests'));
      fireEvent.click(getByText(END));

      expect(onClose).toBeCalled();
    });

    it('Deve fechar ao apertar cancela', () => {
      const onClose = jest.fn();

      const { getByText } = render(<ConfigPage isOpen onClose={onClose} repoName="Test" />);

      fireEvent.click(getByText(CLOSE));

      expect(onClose).toBeCalled();
    });
  });
});
