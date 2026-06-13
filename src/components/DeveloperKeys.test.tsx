import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeveloperKeys } from './DeveloperKeys';

describe('DeveloperKeys Modal Component', () => {
  it('should render the modal content and labels', () => {
    const handleClose = vi.fn();
    render(<DeveloperKeys onClose={handleClose} />);

    expect(screen.getByText('API Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/Google Gemini API Key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Google Maps API Key/i)).toBeInTheDocument();
  });

  it('should support closing when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<DeveloperKeys onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: '' }); // Uses SVG, select by tag or name
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
