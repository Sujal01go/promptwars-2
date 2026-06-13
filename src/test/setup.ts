/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

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
