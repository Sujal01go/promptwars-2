import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component Layout and Navigation', () => {
  it('should render the sidebar and brand name', () => {
    render(<App />);
    expect(screen.getByText('GreenPulse')).toBeInTheDocument();
    expect(screen.getByText('Educational Presets Active')).toBeInTheDocument();
    expect(screen.getByText('Configure APIs')).toBeInTheDocument();
  });

  it('should support switching tabs in the sidebar navigation menu', () => {
    render(<App />);
    
    // Check initial render (Dashboard is default active)
    expect(screen.getByText('Global Lifestyle Carbon Simulator')).toBeInTheDocument();

    // Click on Transit Sim tab
    const transitBtn = screen.getByText('Transit Sim');
    fireEvent.click(transitBtn);
    expect(screen.getByText('Google Maps Travel Emissions Simulator')).toBeInTheDocument();

    // Click on Eco AI Guide tab
    const aiBtn = screen.getByText('Eco AI Guide');
    fireEvent.click(aiBtn);
    expect(screen.getByText('Gemini AI Environmental Literacy Guide')).toBeInTheDocument();

    // Click on Action Hub tab
    const hubBtn = screen.getByText('Action Hub');
    fireEvent.click(hubBtn);
    expect(screen.getByText('Action Hub & Offset Exchange')).toBeInTheDocument();

    // Click on Education tab
    const learnBtn = screen.getByText('Education');
    fireEvent.click(learnBtn);
    expect(screen.getByText('Green Education Center')).toBeInTheDocument();
  });
});
