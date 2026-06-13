import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LearnCenter } from './LearnCenter';

describe('LearnCenter Component', () => {
  it('should render the main heading and description', () => {
    render(<LearnCenter />);
    expect(screen.getByText('Green Education Center')).toBeInTheDocument();
    expect(
      screen.getByText(/Discover the science of carbon tracking, clean energy grids/i)
    ).toBeInTheDocument();
  });

  it('should render all video cards with correct titles', () => {
    render(<LearnCenter />);
    expect(
      screen.getByText(/Can YOU Fix Climate Change\? Individual Action vs. Systemic Shift/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Google's 24\/7 Carbon-Free Energy Goal Explained/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/How to Avoid a Climate Disaster: Technical Levers & Green Premiums/i)
    ).toBeInTheDocument();
  });

  it('should render the curated reading section and links', () => {
    render(<LearnCenter />);
    expect(screen.getByText('Curated Ecological Reading')).toBeInTheDocument();
    expect(screen.getByText('Google Sustainability Portal')).toBeInTheDocument();
    expect(screen.getByText('IPCC Mitigation of Climate Change')).toBeInTheDocument();
    expect(screen.getByText('Global Footprint Network')).toBeInTheDocument();
  });
});
