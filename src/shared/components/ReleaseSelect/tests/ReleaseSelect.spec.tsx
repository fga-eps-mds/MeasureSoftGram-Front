import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReleaseSelect from '../ReleaseSelect';

const releases = [
  { id: 1, release_name: 'R1', start_at: '2026-01-01', end_at: '2026-01-31', created_by: 'user', product: 1 },
  { id: 2, release_name: 'R2', start_at: '2026-02-01', end_at: '2026-02-28', created_by: 'user', product: 1 }
];

describe('<ReleaseSelect />', () => {
  it('lista da release mais nova para a mais antiga e marca a atual', () => {
    render(<ReleaseSelect releases={releases} value={2} currentReleaseId={2} onChange={jest.fn()} />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Release' }));
    const options = within(screen.getByRole('listbox')).getAllByRole('option');

    expect(options.map((option) => option.textContent)).toEqual(['R2 (atual)', 'R1']);
  });

  it('avisa a release escolhida', () => {
    const onChange = jest.fn();
    render(<ReleaseSelect releases={releases} value={2} currentReleaseId={2} onChange={onChange} />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Release' }));
    fireEvent.click(screen.getByRole('option', { name: 'R1' }));

    expect(onChange).toHaveBeenCalledWith(1);
  });
});
