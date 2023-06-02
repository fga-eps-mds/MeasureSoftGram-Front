import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchButton from '../SearchButton';

describe('SearchButton', () => {
  test('calls onInput callback when input changes', () => {
    const mockOnInput = jest.fn();
    render(<SearchButton label="Search" onInput={mockOnInput} />);
    const inputElement = screen.getByRole('textbox');
    fireEvent.input(inputElement, { target: { value: 'test' } });
    expect(mockOnInput).toHaveBeenCalledTimes(1);
    expect(mockOnInput).toHaveBeenCalledWith('test');
  });
});
