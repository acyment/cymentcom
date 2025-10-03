import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock axios for API calls
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({ data: {} })),
      post: vi.fn(() => Promise.resolve({ data: {} })),
      put: vi.fn(() => Promise.resolve({ data: {} })),
      delete: vi.fn(() => Promise.resolve({ data: {} })),
    })),
  },
}));

// Polyfill minimal SVG APIs used by animation libs (e.g., rough-notation)
const safeDefine = (proto, name, fn) => {
  if (proto && !proto[name]) {
    Object.defineProperty(proto, name, { value: fn, configurable: true });
  }
};

// Basic geometry stubs
safeDefine(globalThis.SVGElement?.prototype, 'getBBox', () => ({
  x: 0,
  y: 0,
  width: 100,
  height: 24,
}));

// Fallback to SVGElement if SVGGraphicsElement isn’t defined in JSDOM
const GraphicsProto =
  globalThis.SVGGraphicsElement?.prototype || globalThis.SVGElement?.prototype;
safeDefine(GraphicsProto, 'getCTM', () => ({
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: 0,
  f: 0,
}));

// Path length used by RoughNotation’s underline/circle calculations
const PathProto =
  globalThis.SVGPathElement?.prototype || globalThis.SVGElement?.prototype;
safeDefine(PathProto, 'getTotalLength', () => 100);

// Optional: text metrics used by some libraries
const TextProto =
  globalThis.SVGTextContentElement?.prototype ||
  globalThis.SVGElement?.prototype;
safeDefine(TextProto, 'getComputedTextLength', () => 80);
