/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock scrollIntoView which is missing in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock react-google-charts to render a simplified element instead of loading remote Google Visualization APIs
vi.mock('react-google-charts', () => {
  return {
    Chart: ({ chartType, loader }: any) => {
      return React.createElement(
        'div',
        { 'data-testid': 'mock-google-chart', 'data-charttype': chartType },
        loader || `Mock ${chartType} Chart`
      );
    },
  };
});

// Mock @react-google-maps/api globally to test components using maps and autocomplete
vi.mock('@react-google-maps/api', () => {
  return {
    useJsApiLoader: () => ({
      isLoaded: true,
      loadError: undefined,
    }),
    GoogleMap: ({ children }: any) => React.createElement('div', { 'data-testid': 'mock-google-map' }, children),
    DirectionsRenderer: () => React.createElement('div', { 'data-testid': 'mock-directions-renderer' }),
    Autocomplete: ({ children }: any) => React.createElement('div', { 'data-testid': 'mock-autocomplete' }, children),
    MarkerF: () => React.createElement('div', { 'data-testid': 'mock-marker' }),
    InfoWindowF: ({ children }: any) => React.createElement('div', { 'data-testid': 'mock-info-window' }, children),
  };
});

// Mock HTML5 Canvas 2D context to run Canvas-based animations in JSDOM headless testing environment
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => {
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    strokeText: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    // Added mocks for EarthGlobe3D canvas actions:
    createRadialGradient: vi.fn().mockImplementation(() => {
      return {
        addColorStop: vi.fn(),
      };
    }),
    setLineDash: vi.fn(),
    ellipse: vi.fn(),
  };
}) as any;
