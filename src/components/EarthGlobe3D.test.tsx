import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EarthGlobe3D } from './EarthGlobe3D';

describe('EarthGlobe3D Component', () => {
  it('should render the canvas element with correct attributes', () => {
    render(<EarthGlobe3D />);
    const canvas = screen.getByRole('img');
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName.toLowerCase()).toBe('canvas');
    expect(canvas).toHaveAttribute(
      'aria-label',
      'Interactive 3D Earth globe showing carbon offset projects'
    );
  });

  it('should render the instruction badge text', () => {
    render(<EarthGlobe3D />);
    expect(screen.getByText('SPIN TO ROTATE GLOBE')).toBeInTheDocument();
  });

  it('should handle dragging actions on the canvas', () => {
    render(<EarthGlobe3D />);
    const canvas = screen.getByRole('img');
    
    // Simulate drag start, drag, and drag end
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 110 });
    fireEvent.mouseUp(canvas);
    
    expect(canvas).toBeInTheDocument(); // Canvas should remain intact
  });
});
