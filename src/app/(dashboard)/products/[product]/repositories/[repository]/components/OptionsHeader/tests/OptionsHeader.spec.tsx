import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import OptionsHeader from '../OptionsHeader';
import '@testing-library/jest-dom';

describe('OptionsHeader', () => {

  it('should render the title', () => {
    const isOpen = true;
    const { getByText } = render(
      <OptionsHeader
        title="Teste"
        isHistoricOpen={isOpen}
        setIsHistoricOpen={() => { }}
      />
    );
    expect(getByText('Teste')).toBeTruthy();
  });

  it('should call setIsHistoricOpen(true) when "Histórico" is clicked', () => {
    const setIsHistoricOpen = jest.fn();
    const { getByTestId } = render(
      <OptionsHeader
        title="Teste"
        isHistoricOpen={false}
        setIsHistoricOpen={setIsHistoricOpen}
      />
    );

    const historicButton = getByTestId('history-button');
    fireEvent.click(historicButton);
    expect(setIsHistoricOpen).toHaveBeenCalledWith(true);
  });

  it('should call setIsHistoricOpen(false) when "Cenário Atual" is clicked', () => {
    const setIsHistoricOpen = jest.fn();
    render(
      <OptionsHeader
        title="Teste"
        isHistoricOpen={false}
        setIsHistoricOpen={setIsHistoricOpen}
      />
    );
    const currentButton = screen.getByTestId('button-current-scenario');

    fireEvent.click(currentButton);
    expect(setIsHistoricOpen).toHaveBeenCalledWith(false);
  });

  it('"Histórico" button should render with class "contained" when isHistoricOpen is true', () => {
    const isOpen = true;
    const { getByTestId } = render(
      <OptionsHeader
        title="Teste"
        isHistoricOpen={isOpen}
        setIsHistoricOpen={() => { }}
      />
    );
    const historicButton = getByTestId('history-button');

    expect(historicButton).toHaveClass('MuiButton-contained');
  });

  it('"Cenário Atual" button should render with class "contained" when isHistoricOpen is false', () => {
    render(
      <OptionsHeader
        title="Teste"
        isHistoricOpen={false}
        setIsHistoricOpen={() => { }}
      />
    );
    const statusButton = screen.getByTestId('button-current-scenario');
    expect(statusButton).toHaveClass('MuiButton-contained');
  });

  it('should match snapshot', () => {
    const tree = render(
      <OptionsHeader
        title="Teste"
        isHistoricOpen={false}
        setIsHistoricOpen={() => { }}
      />
    );
    expect(tree).toMatchSnapshot();
  });
});
