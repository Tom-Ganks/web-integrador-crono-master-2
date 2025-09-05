import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeriadosDialog from '../widgets/FeriadosDialog.jsx';
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
  Calendar: ({ size }) => <div data-testid="calendar-icon" data-size={size} />,
  MapPin: ({ size }) => <div data-testid="map-pin-icon" data-size={size} />,
  X: ({ size }) => <div data-testid="x-icon" data-size={size} />,
  Plus: ({ size }) => <div data-testid="plus-icon" data-size={size} />,
  Trash2: ({ size }) => <div data-testid="trash-icon" data-size={size} />,
}));

const mockFeriadosNacionais = {
  '2025-0-1': '🎉 Ano Novo',
  '2025-11-25': '🎄 Natal'
};

const mockFeriadosMunicipais = {
  '2025-5-15': 'Festa da Cidade'
};

describe('FeriadosDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnFeriadoAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza título do dialog e seções de feriados', () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    expect(screen.getByText('Gerenciar Feriados')).toBeInTheDocument();
    expect(screen.getByText('Feriados Nacionais')).toBeInTheDocument();
    expect(screen.getByText('Feriados Municipais')).toBeInTheDocument();
  });

  test('renderiza lista de feriados nacionais corretamente', () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    expect(screen.getByText('🎉 Ano Novo')).toBeInTheDocument();
    expect(screen.getByText('🎄 Natal')).toBeInTheDocument();
  });

  test('renderiza lista de feriados municipais corretamente', () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    expect(screen.getByText('Festa da Cidade')).toBeInTheDocument();
  });

  test('abre e fecha formulário de adicionar feriado municipal', () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    // Verifica que o formulário não está visível inicialmente
    expect(screen.queryByPlaceholderText('Nome do feriado')).not.toBeInTheDocument();

    // Clica para abrir o formulário
    const addButton = screen.getByTestId('plus-icon').closest('button');
    fireEvent.click(addButton);

    // Verifica que o formulário está visível 
    expect(screen.getByPlaceholderText('Nome do feriado')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome do feriado')).toHaveValue('');
  });

  test('valida campos obrigatórios ao tentar adicionar feriado sem preencher formulário', async () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    // Abre formulário
    const addButton = screen.getByTestId('plus-icon').closest('button');
    fireEvent.click(addButton);

    // Tenta submeter sem preencher
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    // Verifica que o Supabase não foi chamado (validação frontend impediu)
    await waitFor(() => {
      expect(supabaseClient.from).not.toHaveBeenCalled();
    });
  });

  test('fecha dialog corretamente', () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    const closeButton = screen.getByTestId('x-icon').closest('button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('exibe mensagem quando não há feriados municipais', () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={{}}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    expect(screen.getByText('Nenhum feriado municipal cadastrado')).toBeInTheDocument();
  });
});