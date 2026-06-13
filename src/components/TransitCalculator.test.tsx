import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransitCalculator } from './TransitCalculator';

describe('TransitCalculator Component', () => {
  const mockAddLog = vi.fn();

  it('should render starting point and destination forms with correct labels', () => {
    render(
      <TransitCalculator
        onAddLog={mockAddLog}
        mapsApiKey=""
        isDemoMode={true}
        isLoaded={true}
        loadError={undefined}
      />
    );

    expect(screen.getByText('Google Maps Travel Emissions Simulator')).toBeInTheDocument();
    expect(screen.getByLabelText('Starting Point')).toBeInTheDocument();
    expect(screen.getByLabelText('Destination')).toBeInTheDocument();
  });

  it('should trigger autocomplete suggestion list in simulated mode', async () => {
    render(
      <TransitCalculator
        onAddLog={mockAddLog}
        mapsApiKey=""
        isDemoMode={true}
        isLoaded={true}
        loadError={undefined}
      />
    );

    const originInput = screen.getByLabelText('Starting Point');
    fireEvent.change(originInput, { target: { value: 'Stan' } });

    // Wait for simulated autocomplete suggestion box to show up
    await waitFor(() => {
      expect(screen.getByRole('listbox', { name: 'Starting point suggestions' })).toBeInTheDocument();
      expect(screen.getByText('Stanford Energy Hub, CA')).toBeInTheDocument();
    });
  });

  it('should switch selected transit mode on keyboard interaction', async () => {
    render(
      <TransitCalculator
        onAddLog={mockAddLog}
        mapsApiKey=""
        isDemoMode={true}
        isLoaded={true}
        loadError={undefined}
      />
    );

    // Simulate route calculation
    const originInput = screen.getByLabelText('Starting Point');
    const destInput = screen.getByLabelText('Destination');
    fireEvent.change(originInput, { target: { value: 'Stanford Energy Hub, CA' } });
    fireEvent.change(destInput, { target: { value: 'Googleplex, Mountain View, CA' } });

    const btn = screen.getByRole('button', { name: 'Analyze Transit Impact' });
    fireEvent.click(btn);

    // Wait for results to show up
    await waitFor(() => {
      expect(screen.getByText('Simulated Footprint Comparison:')).toBeInTheDocument();
    }, { timeout: 3000 });

    const suvOption = screen.getByLabelText('Gasoline SUV emissions profile');
    expect(suvOption).toBeInTheDocument();
    expect(suvOption).toHaveAttribute('aria-pressed', 'false');

    // Press Enter to select SUV transit mode
    fireEvent.keyDown(suvOption, { key: 'Enter', code: 'Enter' });
    expect(suvOption).toHaveAttribute('aria-pressed', 'true');
  });
});
