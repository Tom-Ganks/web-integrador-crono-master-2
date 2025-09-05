// src/setupTests.js
import '@testing-library/jest-dom';

// Mock global do Supabase
jest.mock('./services/supabase.js', () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

// Mock do Lucide React
jest.mock('lucide-react', () => ({
  Calendar: ({ size }) => <div data-testid="calendar-icon" data-size={size} />,
  Filter: ({ size }) => <div data-testid="filter-icon" data-size={size} />,
  Plus: ({ size }) => <div data-testid="plus-icon" data-size={size} />,
  Printer: ({ size }) => <div data-testid="printer-icon" data-size={size} />,
  Clock: ({ size }) => <div data-testid="clock-icon" data-size={size} />,
  Users: ({ size }) => <div data-testid="users-icon" data-size={size} />,
  BookOpen: ({ size }) => <div data-testid="book-open-icon" data-size={size} />,
  X: ({ size }) => <div data-testid="x-icon" data-size={size} />,
  MapPin: ({ size }) => <div data-testid="map-pin-icon" data-size={size} />,
  Trash2: ({ size }) => <div data-testid="trash-icon" data-size={size} />,
  ArrowLeft: ({ size }) => <div data-testid="arrow-left-icon" data-size={size} />,
  Menu: ({ size }) => <div data-testid="menu-icon" data-size={size} />,
  Bell: ({ size }) => <div data-testid="bell-icon" data-size={size} />,
  GraduationCap: ({ size }) => <div data-testid="graduation-cap-icon" data-size={size} />,
  User: ({ size }) => <div data-testid="user-icon" data-size={size} />,
}));