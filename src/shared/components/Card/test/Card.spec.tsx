import '@testing-library/jest-dom';

import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Card from '../Card';

describe('<Card />', () => {
  it('should render Card', async () => {
    render(<Card id={1} name="Simbora" url="https://www.google.com" />);
  });
});
