import React from 'react';
import { render, screen, renderWithUser } from './test-utils';
import FilterPanel from '../components/FilterPanel';

describe('FilterPanel', () => {
  const mockOnApplyFilter = jest.fn();

  beforeEach(() => {
    mockOnApplyFilter.mockClear();
  });

  it('renders preset filter buttons', () => {
    render(<FilterPanel onApplyFilter={mockOnApplyFilter} isLoading={false} />);
    expect(screen.getByText('Synthwave')).toBeInTheDocument();
    expect(screen.getByText('Anime')).toBeInTheDocument();
    expect(screen.getByText('Lomo')).toBeInTheDocument();
    expect(screen.getByText('Glitch')).toBeInTheDocument();
  });

  it('handles preset filter selection', async () => {
    const { user } = renderWithUser(
      <FilterPanel onApplyFilter={mockOnApplyFilter} isLoading={false} />
    );

    await user.click(screen.getByText('Synthwave'));
    await user.click(screen.getByText('Apply Filter'));

    expect(mockOnApplyFilter).toHaveBeenCalledWith(
      'Apply a vibrant 80s synthwave aesthetic with neon magenta and cyan glows, and subtle scan lines.'
    );
  });

  it('handles custom filter input', async () => {
    const { user } = renderWithUser(
      <FilterPanel onApplyFilter={mockOnApplyFilter} isLoading={false} />
    );

    const input = screen.getByPlaceholderText(/describe a custom filter/i);
    await user.type(input, 'Custom vintage filter');
    await user.click(screen.getByText('Apply Filter'));

    expect(mockOnApplyFilter).toHaveBeenCalledWith('Custom vintage filter');
  });

  it('disables controls when loading', () => {
    render(<FilterPanel onApplyFilter={mockOnApplyFilter} isLoading={true} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
    
    const input = screen.getByPlaceholderText(/describe a custom filter/i);
    expect(input).toBeDisabled();
  });
});
