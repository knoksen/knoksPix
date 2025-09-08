import React from 'react';
import { render, screen, renderWithUser } from './test-utils';
import ImageUploader from '../components/ImageUploader';

describe('ImageUploader', () => {
  const mockOnUpload = jest.fn();

  beforeEach(() => {
    mockOnUpload.mockClear();
  });

  it('renders the upload area', () => {
    render(<ImageUploader onUpload={mockOnUpload} />);
    const uploadArea = screen.getByTestId('upload-area');
    expect(uploadArea).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    const { user } = renderWithUser(<ImageUploader onUpload={mockOnUpload} />);
    const fileInput = screen.getByLabelText(/click to select a file/i);
    
    const file = new File(['test image'], 'test.png', { type: 'image/png' });
    await user.upload(fileInput, file);

    expect(mockOnUpload).toHaveBeenCalledWith(file);
  });
});
