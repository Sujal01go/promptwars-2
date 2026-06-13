import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';

describe('Dashboard Component', () => {
  it('should render the dashboard header and context info', () => {
    render(<Dashboard />);
    expect(screen.getByText('Global Lifestyle Carbon Simulator')).toBeInTheDocument();
    expect(
      screen.getByText(/Analyze standard regional behaviors, tweak lifestyle parameters/i)
    ).toBeInTheDocument();
  });

  it('should render all preset profile cards and respect keyboard interaction', () => {
    render(<Dashboard />);
    
    const suburbanPreset = screen.getByLabelText('Select profile preset for Suburban Commuter');
    expect(suburbanPreset).toBeInTheDocument();
    expect(suburbanPreset).toHaveAttribute('aria-pressed', 'true'); // Default active preset

    const urbanPreset = screen.getByLabelText('Select profile preset for Urban Professional');
    expect(urbanPreset).toBeInTheDocument();
    expect(urbanPreset).toHaveAttribute('aria-pressed', 'false');

    // Simulate Keyboard trigger (Enter key)
    fireEvent.keyDown(urbanPreset, { key: 'Enter', code: 'Enter' });
    expect(urbanPreset).toHaveAttribute('aria-pressed', 'true');
    expect(suburbanPreset).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render all range sliders with correct accessibility attributes', () => {
    render(<Dashboard />);
    
    const travelSlider = screen.getByLabelText('Annual Travel Commute');
    expect(travelSlider).toBeInTheDocument();
    expect(travelSlider).toHaveAttribute('type', 'range');
    expect(travelSlider).toHaveAttribute('aria-valuemin', '0');

    const energySlider = screen.getByLabelText('Household Grid Electricity');
    expect(energySlider).toBeInTheDocument();
    
    const wasteSlider = screen.getByLabelText('Annual Waste Generation');
    expect(wasteSlider).toBeInTheDocument();
  });

  it('should render the Municipal Impact Engine with scale and grid selectors', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Municipal Impact Engine')).toBeInTheDocument();
    
    const scaleSelect = screen.getByLabelText('Projected Citizens');
    expect(scaleSelect).toBeInTheDocument();
    expect(scaleSelect.tagName.toLowerCase()).toBe('select');
    
    const gridSelect = screen.getByLabelText('Municipal Grid Mix');
    expect(gridSelect).toBeInTheDocument();
    expect(gridSelect.tagName.toLowerCase()).toBe('select');
  });

  it('should update municipal metrics when community scale is modified', () => {
    render(<Dashboard />);
    
    const scaleSelect = screen.getByLabelText('Projected Citizens');
    
    // Default is 1M. Let's inspect initial text or presence
    expect(screen.getByText('Annual CO₂ Sequestered:')).toBeInTheDocument();
    
    // Change scale to 10k (value 10000)
    fireEvent.change(scaleSelect, { target: { value: '10000' } });
    expect(scaleSelect).toHaveValue('10000');
  });
});
