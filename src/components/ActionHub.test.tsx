import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionHub } from './ActionHub';

describe('ActionHub Component', () => {
  const mockAddLog = vi.fn();

  it('should render headers and lists', () => {
    render(
      <ActionHub
        carbonLogs={[]}
        onAddLog={mockAddLog}
        mapsApiKey=""
        isDemoMode={true}
        isLoaded={true}
      />
    );

    expect(screen.getByText('Action Hub & Offset Exchange')).toBeInTheDocument();
    expect(screen.getByText('Eco-Awareness Milestones')).toBeInTheDocument();
    expect(screen.getByText('Community Advocacy Tasks')).toBeInTheDocument();
  });

  it('should render offset forms and respect keyboard selection on map nodes', () => {
    render(
      <ActionHub
        carbonLogs={[]}
        onAddLog={mockAddLog}
        mapsApiKey=""
        isDemoMode={true}
        isLoaded={true}
      />
    );

    expect(screen.getByLabelText('Selected Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Simulated Offset Credits (Tons)')).toBeInTheDocument();

    const texasNode = screen.getByLabelText('Select offset project West Texas Wind Grid Expansion');
    expect(texasNode).toBeInTheDocument();

    // Trigger keyboard space bar selector
    fireEvent.keyDown(texasNode, { key: ' ', code: 'Space' });
    expect(screen.getByLabelText('Selected Project')).toHaveValue('wind_texas');
  });
});
