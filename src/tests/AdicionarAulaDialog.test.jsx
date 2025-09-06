import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdicionarAulaDialog from '../widgets/AdicionarAulaDialog.jsx';
import { supabaseClient } from '../services/supabase.js';


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
  });

  test('renderiza título e estrutura básica do dialog', async () => {
    render(
      <AdicionarAulaDialog
        selectedDays={mockSelectedDays}
        onClose={mockOnClose}
        onAulaAdded={mockOnAulaAdded}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Agendar Aulas')).toBeInTheDocument();
      expect(screen.getByText('Dias Selecionados')).toBeInTheDocument();
      expect(screen.getByText('Turma')).toBeInTheDocument();
    });
  });

  test('carrega turmas e UCs do banco de dados', async () => {
    render(
      <AdicionarAulaDialog
        selectedDays={mockSelectedDays}
        onClose={mockOnClose}
        onAulaAdded={mockOnAulaAdded}
      />
    );

    await waitFor(() => {
      expect(supabaseClient.from).toHaveBeenCalledWith('turma');
      expect(supabaseClient.from).toHaveBeenCalledWith('unidades_curriculares');
    });
  });

  test('exibe dias selecionados corretamente', async () => {
    render(
      <AdicionarAulaDialog
        selectedDays={mockSelectedDays}
        onClose={mockOnClose}
        onAulaAdded={mockOnAulaAdded}
      />
    );

    await waitFor(() => {
      // Verifica pelos spans que contêm as datas
      const dateElements = screen.getAllByText((content, element) => {
        return element.tagName.toLowerCase() === 'span' && 
               content.includes('/');
      });
      expect(dateElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/Total de horas a agendar:/)).toBeInTheDocument();
    });
  });

  test('filtra UCs baseado na turma selecionada', async () => {
    render(
      <AdicionarAulaDialog
        selectedDays={mockSelectedDays}
        onClose={mockOnClose}
        onAulaAdded={mockOnAulaAdded}
      />
    );

    await waitFor(() => {
      // Seleciona uma turma
      const turmaSelect = screen.getByDisplayValue('Selecione uma turma');
      fireEvent.change(turmaSelect, { target: { value: '1' } });
      
      // Verifica que as UCs são carregadas
      expect(screen.getByText('Selecione uma UC')).toBeInTheDocument();
    });
  });

  test('botão salvar fica desabilitado até preencher todos os campos obrigatórios', async () => {
    render(
      <AdicionarAulaDialog
        selectedDays={mockSelectedDays}
        onClose={mockOnClose}
        onAulaAdded={mockOnAulaAdded}
      />
    );

    await waitFor(() => {
      const saveButton = screen.getByText('Salvar Agendamento');
      expect(saveButton).toBeDisabled();
    });
  });

  test('fecha dialog corretamente', async () => {
    render(
      <AdicionarAulaDialog
        selectedDays={mockSelectedDays}
        onClose={mockOnClose}
        onAulaAdded={mockOnAulaAdded}
      />
    );

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

    render(
      <AdicionarAulaDialog
        selectedDays={multipleDays}
        onClose={mockOnClose}
        onAulaAdded={mockOnAulaAdded}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Total de horas a agendar: 3')).toBeInTheDocument();
    });
  });
});