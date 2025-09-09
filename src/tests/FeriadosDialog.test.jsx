import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeriadosDialog from '../components/FeriadosDialog.jsx';
import { supabaseClient } from '../services/supabase.js';

jest.mock('../services/supabase.js');

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
    console.error.mockClear();
  });

  const setupSuccessfulMocks = () => {
    supabaseClient.from.mockImplementation(() => ({
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }));
  };

  test('renderiza título do dialog e seções de feriados', () => {
    setupSuccessfulMocks();

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
    setupSuccessfulMocks();

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
    setupSuccessfulMocks();

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
    setupSuccessfulMocks();

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

  test('adiciona novo feriado municipal com sucesso', async () => {
    setupSuccessfulMocks();

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

    // Preenche formulário
    const nameInput = screen.getByPlaceholderText('Nome do feriado');
    const dateInput = screen.getByDisplayValue('');
    
    fireEvent.change(nameInput, { target: { value: 'Novo Feriado' } });
    fireEvent.change(dateInput, { target: { value: '2025-06-15' } });

    // Submete formulário
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(supabaseClient.from).toHaveBeenCalledWith('feriadosmunicipais');
      expect(mockOnFeriadoAdded).toHaveBeenCalledTimes(1);
    });
  });

  test('remove feriado municipal', async () => {
    setupSuccessfulMocks();

    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    const removeButton = screen.getByTestId('trash-2-icon').closest('button');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(supabaseClient.from).toHaveBeenCalledWith('feriadosmunicipais');
      expect(mockOnFeriadoAdded).toHaveBeenCalledTimes(1);
    });
  });

  test('fecha dialog corretamente', () => {
    setupSuccessfulMocks();

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
    setupSuccessfulMocks();

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

  test('cancela adição de feriado', () => {
    setupSuccessfulMocks();

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

    // Cancela
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(screen.queryByPlaceholderText('Nome do feriado')).not.toBeInTheDocument();
  });

  // Supabase Connection Failure Tests
  test('lida com falha de conexão ao adicionar feriado', async () => {
    supabaseClient.from.mockImplementation(() => ({
      insert: jest.fn(() => Promise.resolve({ error: new Error('Falha de conexão') }))
    }));

    window.alert = jest.fn();

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

    // Preenche formulário
    const nameInput = screen.getByPlaceholderText('Nome do feriado');
    const dateInput = screen.getByDisplayValue('');
    
    fireEvent.change(nameInput, { target: { value: 'Novo Feriado' } });
    fireEvent.change(dateInput, { target: { value: '2025-06-15' } });

    // Submete formulário
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Erro ao adicionar feriado:', expect.any(Error));
      expect(window.alert).toHaveBeenCalledWith('Erro ao adicionar feriado: Falha de conexão');
    });
  });

  test('lida com falha de conexão ao remover feriado', async () => {
    supabaseClient.from.mockImplementation(() => ({
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: new Error('Falha de conexão') }))
        }))
      }))
    }));

    window.alert = jest.fn();

    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    const removeButton = screen.getByTestId('trash-2-icon').closest('button');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Erro ao remover feriado:', expect.any(Error));
      expect(window.alert).toHaveBeenCalledWith('Erro ao remover feriado: Falha de conexão');
    });
  });

  test('exibe estado de loading durante submissão', async () => {
    let resolveInsert;
    const insertPromise = new Promise(resolve => {
      resolveInsert = resolve;
    });

    supabaseClient.from.mockImplementation(() => ({
      insert: jest.fn(() => insertPromise)
    }));

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

    // Preenche formulário
    const nameInput = screen.getByPlaceholderText('Nome do feriado');
    const dateInput = screen.getByDisplayValue('');
    
    fireEvent.change(nameInput, { target: { value: 'Novo Feriado' } });
    fireEvent.change(dateInput, { target: { value: '2025-06-15' } });

    // Submete formulário
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Salvando...')).toBeInTheDocument();
    });

    resolveInsert({ data: [], error: null });
  });
});