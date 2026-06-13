import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AICoach } from './AICoach';

describe('AICoach Component', () => {
  it('should render the AI Eco Guide greeting and inputs', () => {
    render(<AICoach carbonLogs={[]} geminiApiKey="" isDemoMode={true} />);

    expect(screen.getByText('Gemini AI Environmental Literacy Guide')).toBeInTheDocument();
    expect(screen.getByText('GreenPulse AI Eco Literacy Educator')).toBeInTheDocument();
    expect(screen.getByLabelText('Ask the AI Eco Educator a question')).toBeInTheDocument();
  });

  it('should trigger simulated item scanning on preset select trigger', async () => {
    render(<AICoach carbonLogs={[]} geminiApiKey="" isDemoMode={true} />);

    const presetBtn = screen.getByLabelText('Select preset item for Plastic Water Bottle');
    expect(presetBtn).toBeInTheDocument();

    // Select preset item
    fireEvent.click(presetBtn);

    // Wait for the upload badge preview to display the selected item name
    expect(screen.getByText(/Selected to scan:/i)).toBeInTheDocument();
    expect(screen.getAllByText('Plastic Water Bottle')[0]).toBeInTheDocument();

    // Send query
    const sendBtn = screen.getByLabelText('Send message');
    fireEvent.click(sendBtn);

    // Check message log has updated with simulated analysis
    await waitFor(() => {
      expect(screen.getByText(/AI is calculating environmental impact.../i)).toBeInTheDocument();
    });
  });
});
