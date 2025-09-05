import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CronogramaPage from '../pages/CronogramaPage.jsx';
import { supabaseClient } from '../services/supabase.js';

// Mock Supabase
jest.mock('../services/supabase.js', () => ({
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

// Mock Lucide React
jest.mock('lucide-react', () => ({
  ArrowLeft: ({ size }) => <div data-testid="arrow-left-icon" data-size={size} />,
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
}));

// Mock dos dialogs
jest.mock('../widgets/FeriadosDialog.jsx', () => {
  return function MockFeriadosDialog({ onClose }) {
    return (
      <div data-testid="feriados-dialog">
        <button onClick={onClose}>Fechar Feriados</button>
      </div>
    );
  };
});

jest.mock('../widgets/AdicionarAulaDialog.jsx', () => {
  return function MockAdicionarAulaDialog({ onClose }) {
    return (
      <div data-testid="aula-dialog">
        <button onClick={onClose}>Fechar Aulas</button>
      </div>
    );
  };
});

const mockTurmas = [
  { idturma: 1, turma: 'Turma A', cursos: { nomecurso: 'Técnico em Informática' } },
  { idturma: 2, turma: 'Turma B', cursos: { nomecurso: 'Técnico em Informática' } }
];

const mockAulas = [
  {
    idaula: 1,
    iduc: 1,
    idturma: 1,
    data: '2025-01-15',
    horario: '08:00-12:00',
    status: 'Agendada',
    horas: 4,
    unidades_curriculares: { nomeuc: 'Programação Web' },
    turma: { turma: 'Turma A' }
  }
];

describe('CronogramaPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15'));

    supabaseClient.from.mockImplementation((table) => {
      const mockResponse = {
        turma: { data: mockTurmas, error: null },
        aulas: { data: mockAulas, error: null },
        feriadosmunicipais: { data: [], error: null },
        cursos: { data: [{ idcurso: 1, nomecurso: 'Programação em Python' }], error: null },
        ucs: { data: [{ iduc: 1, nomeuc: 'Banco de Dados' }], error: null }
      };

      return {
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve(mockResponse[table] || { data: [], error: null }))
        }))
      };
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renderiza estrutura principal do cronograma', async () => {
    await act(async () => {
      render(<CronogramaPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Cronograma de Aulas')).toBeInTheDocument();
      expect(screen.getByTitle('Gerenciar Feriados')).toBeInTheDocument();
      expect(screen.getByTitle('Imprimir')).toBeInTheDocument();
    });
  });

  test('carrega turmas e aulas do banco de dados', async () => {
    await act(async () => {
      render(<CronogramaPage />);
    });

    await waitFor(() => {
      expect(supabaseClient.from).toHaveBeenCalledWith('turma');
      expect(supabaseClient.from).toHaveBeenCalledWith('aulas');
      expect(supabaseClient.from).toHaveBeenCalledWith('feriadosmunicipais');
    });
  });

  test('renderiza dias da semana em português', async () => {
    await act(async () => {
      render(<CronogramaPage />);
    });

    await waitFor(() => {
      const dayHeaders = [
        'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
        'quinta-feira', 'sexta-feira', 'sábado'
      ];

      dayHeaders.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });
  });

  test('FAB fica habilitado quando dia é selecionado', async () => {
    await act(async () => {
      render(<CronogramaPage />);
    });

    await waitFor(() => {
      const dayElement = screen.getByText('15');
      fireEvent.click(dayElement);
      const fab = screen.getByTitle('Agendar Aulas');
      expect(fab).not.toBeDisabled();
    });
  });

  test('filtra turmas corretamente', async () => {
    await act(async () => {
      render(<CronogramaPage />);
    });

    await waitFor(() => {
      const filterSelect = screen.getByDisplayValue('Todas as Turmas');
      fireEvent.change(filterSelect, { target: { value: '1' } });
      expect(filterSelect.value).toBe('1');
    });
  });
});
