import React from 'react';
import { render, screen } from './test-utils';
import Header from '../components/Header';

describe('Header', () => {
  it('renders the header with logo', () => {
    render(<Header />);
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
  });
});
