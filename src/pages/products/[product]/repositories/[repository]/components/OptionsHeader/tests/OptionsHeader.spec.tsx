import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import OptionsHeader from '../OptionsHeader';
import '@testing-library/jest-dom';


describe('OptionsHeader', () => {

  it('should render the title', () => {
    const { getByText } = render(
      <OptionsHeader
        title="Teste"
        isHistoricOpen={true}
        setIsHistoricOpen={() => { }}
      />
    );
    expect(getByText('Teste')).toBeTruthy();
  });

  it('should call setIsHistoricOpen(true) when "Histórico" is clicked', () => {
    const setIsHistoricOpen = jest.fn();
    const { getByText } = render(
      <OptionsHeader
        title="Teste"
        isHistoricOpen={false}
        setIsHistoricOpen={setIsHistoricOpen}
      />
    );
    const historicButton = getByText('Histórico');
    fireEvent.click(historicButton);
    expect(setIsHistoricOpen).toHaveBeenCalledWith(true);
  });

  it('should call setIsHistoricOpen(false) when "Cenário Atual" is clicked', () => {
    const setIsHistoricOpen = jest.fn();
    const { getByText } = render(
      <OptionsHeader
        title="Teste"
        isHistoricOpen={false}
        setIsHistoricOpen={setIsHistoricOpen}
      />
    );
    const currentButton = getByText('Cenário Atual');
    fireEvent.click(currentButton);
    expect(setIsHistoricOpen).toHaveBeenCalledWith(false);
  });

  it('"Histórico" button should render with class "contained" when isHistoricOpen is true', () => {
    const { getByText } = render(
      <OptionsHeader
        title="Teste"
        isHistoricOpen={true}
        setIsHistoricOpen={() => { }}
      />
    );
    const statusButton = getByText('Histórico');
    expect(statusButton).toHaveClass('MuiButton-contained');
  });

  it('"Cenário Atual" button should render with class "contained" when isHistoricOpen is false', () => {
    const { getByText } = render(
      <OptionsHeader
        title="Teste"
        isHistoricOpen={false}
        setIsHistoricOpen={() => { }}
      />
    );
    const statusButton = getByText('Cenário Atual');
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
