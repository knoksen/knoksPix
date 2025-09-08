import React from 'react';
import { render, screen, renderWithUser } from './test-utils';
import StartScreen from '../components/StartScreen';

describe('StartScreen', () => {
  const mockOnFileSelect = jest.fn();
  const mockOnTakePhoto = jest.fn();

  beforeEach(() => {
    mockOnFileSelect.mockClear();
    mockOnTakePhoto.mockClear();
  });

  it('renders heading and description', () => {
    render(<StartScreen onFileSelect={mockOnFileSelect} onTakePhoto={mockOnTakePhoto} />);
    expect(screen.getByText(/AI-Powered Photo Editing/i)).toBeInTheDocument();
    expect(screen.getByText(/Retouch photos, apply creative filters/i)).toBeInTheDocument();
  });

  it('calls onFileSelect when upload button is clicked', async () => {
    const { user } = renderWithUser(
      <StartScreen onFileSelect={mockOnFileSelect} onTakePhoto={mockOnTakePhoto} />
    );
    
    const file = new File(['test image'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload an Image');
    await user.upload(input, file);
    
    expect(mockOnFileSelect).toHaveBeenCalledWith(expect.any(FileList));
  });

  it('calls onTakePhoto when take photo button is clicked', async () => {
    const { user } = renderWithUser(
      <StartScreen onFileSelect={mockOnFileSelect} onTakePhoto={mockOnTakePhoto} />
    );
    
    const button = screen.getByRole('button', { name: /take photo/i });
    await user.click(button);
    
    expect(mockOnTakePhoto).toHaveBeenCalled();
  });
});
