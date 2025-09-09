import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdicionarAulaDialog from '../components/AdicionarAulaDialog.jsx';
import { supabaseClient } from '../services/supabase.js';

jest.mock('../services/supabase.js');

const mockSelectedDays = new Set([new Date('2025-01-15').getTime()]);

const mockTurmas = [
  { idturma: 1, turma: 'Turma A', idcurso: 1 },
  { idturma: 2, turma: 'Turma B', idcurso: 1 }
];

const mockUcs = [
  { iduc: 1, nomeuc: 'Programação Web', cargahoraria: 96, idcurso: 1 },
  { iduc: 2, nomeuc: 'Banco de Dados', cargahoraria: 80, idcurso: 1 }
];

describe('AdicionarAulaDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnAulaAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    console.error.mockClear();
  });

  const setupSuccessfulMocks = () => {
    supabaseClient.from.mockImplementation((table) => {
      const mockResponse = {
        turma: { data: mockTurmas, error: null },
        unidades_curriculares: { data: mockUcs, error: null }
      };

      return {
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve(mockResponse[table] || { data: [], error: null }))
        }))
      };
    });
  };

  test('renderiza título e estrutura básica do dialog', async () => {
    setupSuccessfulMocks();

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Agendar Aulas')).toBeInTheDocument();
      expect(screen.getByText('Dias Selecionados')).toBeInTheDocument();
      expect(screen.getByText('Turma')).toBeInTheDocument();
    });
  });

  test('exibe estado de carregamento inicialmente', () => {
    setupSuccessfulMocks();

    render(
      <AdicionarAulaDialog
        selectedDays={mockSelectedDays}
        onClose={mockOnClose}
        onAulaAdded={mockOnAulaAdded}
      />
    );

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  test('carrega turmas e UCs do banco de dados', async () => {
    setupSuccessfulMocks();

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      expect(supabaseClient.from).toHaveBeenCalledWith('turma');
      expect(supabaseClient.from).toHaveBeenCalledWith('unidades_curriculares');
    });
  });

  test('exibe dias selecionados corretamente', async () => {
    setupSuccessfulMocks();

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Total de horas a agendar:/)).toBeInTheDocument();
      expect(screen.getByText('Total de horas a agendar: 1')).toBeInTheDocument();
    });
  });

  test('filtra UCs baseado na turma selecionada', async () => {
    setupSuccessfulMocks();

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      // Seleciona uma turma
      const turmaSelect = screen.getByDisplayValue('Selecione uma turma');
      fireEvent.change(turmaSelect, { target: { value: '1' } });
      
      // Verifica que as UCs são carregadas
      expect(screen.getByText('Selecione uma UC')).toBeInTheDocument();
    });
  });

  test('botão salvar fica desabilitado até preencher todos os campos obrigatórios', async () => {
    setupSuccessfulMocks();

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      const saveButton = screen.getByText('Salvar Agendamento');
      expect(saveButton).toBeDisabled();
    });
  });

  test('habilita botão salvar quando todos os campos estão preenchidos', async () => {
    setupSuccessfulMocks();

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      // Seleciona turma
      const turmaSelect = screen.getByDisplayValue('Selecione uma turma');
      fireEvent.change(turmaSelect, { target: { value: '1' } });
    });

    await waitFor(() => {
      // Seleciona UC
      const ucSelect = screen.getByDisplayValue('Selecione uma UC');
      fireEvent.change(ucSelect, { target: { value: '1' } });
    });

    await waitFor(() => {
      const saveButton = screen.getByText('Salvar Agendamento');
      expect(saveButton).not.toBeDisabled();
    });
  });

  test('fecha dialog corretamente', async () => {
    setupSuccessfulMocks();

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      const closeButton = screen.getByTestId('x-icon').closest('button');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test('calcula total de horas corretamente para múltiplos dias', async () => {
    const multipleDays = new Set([
      new Date('2025-01-15').getTime(),
      new Date('2025-01-16').getTime(),
      new Date('2025-01-17').getTime()
    ]);

    setupSuccessfulMocks();

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={multipleDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Total de horas a agendar: 3')).toBeInTheDocument();
    });
  });

  test('ajusta horas máximas baseado no período selecionado', async () => {
    setupSuccessfulMocks();

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      // Seleciona turma e UC primeiro
      const turmaSelect = screen.getByDisplayValue('Selecione uma turma');
      fireEvent.change(turmaSelect, { target: { value: '1' } });
    });

    await waitFor(() => {
      const ucSelect = screen.getByDisplayValue('Selecione uma UC');
      fireEvent.change(ucSelect, { target: { value: '1' } });
    });

    await waitFor(() => {
      // Muda para período noturno (máximo 3 horas)
      const periodoSelect = screen.getByDisplayValue('Matutino');
      fireEvent.change(periodoSelect, { target: { value: 'Noturno' } });
      
      // Verifica se o range de horas foi ajustado
      const hoursRange = screen.getByDisplayValue('1');
      expect(hoursRange).toHaveAttribute('max', '3');
    });
  });

  test('exibe resumo do agendamento corretamente', async () => {
    setupSuccessfulMocks();

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      const turmaSelect = screen.getByDisplayValue('Selecione uma turma');
      fireEvent.change(turmaSelect, { target: { value: '1' } });
    });

    await waitFor(() => {
      const ucSelect = screen.getByDisplayValue('Selecione uma UC');
      fireEvent.change(ucSelect, { target: { value: '1' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Resumo do Agendamento')).toBeInTheDocument();
      expect(screen.getByText('Matutino')).toBeInTheDocument();
      expect(screen.getByText('96 horas')).toBeInTheDocument(); // Carga horária restante
    });
  });

  test('submete dados corretamente', async () => {
    setupSuccessfulMocks();

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      const turmaSelect = screen.getByDisplayValue('Selecione uma turma');
      fireEvent.change(turmaSelect, { target: { value: '1' } });
    });

    await waitFor(() => {
      const ucSelect = screen.getByDisplayValue('Selecione uma UC');
      fireEvent.change(ucSelect, { target: { value: '1' } });
    });

    await waitFor(() => {
      const saveButton = screen.getByText('Salvar Agendamento');
      fireEvent.click(saveButton);
      
      expect(mockOnAulaAdded).toHaveBeenCalledWith({
        idturma: 1,
        iduc: 1,
        periodo: 'Matutino',
        horas: 1,
        horario: '08:00-12:00',
        dias: mockSelectedDays
      });
    });
  });

  // Supabase Connection Failure Tests
  test('lida com falha de conexão ao carregar turmas', async () => {
    supabaseClient.from.mockImplementation((table) => {
      if (table === 'turma') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: null, error: new Error('Falha de conexão') }))
          }))
        };
      }
      return {
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      };
    });

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Erro ao carregar turmas:', expect.any(Error));
    });
  });

  test('lida com falha de conexão ao carregar UCs', async () => {
    supabaseClient.from.mockImplementation((table) => {
      if (table === 'unidades_curriculares') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: null, error: new Error('Falha de conexão') }))
          }))
        };
      }
      return {
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockTurmas, error: null }))
        }))
      };
    });

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Erro ao carregar UCs:', expect.any(Error));
    });
  });

  test('lida com falha de conexão ao carregar carga horária', async () => {
    supabaseClient.from.mockImplementation((table) => {
      if (table === 'unidades_curriculares') {
        const callCount = supabaseClient.from.mock.calls.filter(call => call[0] === 'unidades_curriculares').length;
        
        if (callCount === 1) {
          // Primeira chamada (loadUcs) - sucesso
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockUcs, error: null }))
            }))
          };
        } else {
          // Segunda chamada (loadCargaHoraria) - falha
          return {
            select: jest.fn(() => Promise.resolve({ data: null, error: new Error('Falha de conexão') }))
          };
        }
      }
      return {
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockTurmas, error: null }))
        }))
      };
    });

    await act(async () => {
      render(
        <AdicionarAulaDialog
          selectedDays={mockSelectedDays}
          onClose={mockOnClose}
          onAulaAdded={mockOnAulaAdded}
        />
      );
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Erro ao carregar carga horária:', expect.any(Error));
    });
  });
});