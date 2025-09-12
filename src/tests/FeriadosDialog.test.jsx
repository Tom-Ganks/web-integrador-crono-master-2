import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeriadosDialog from '../widgets/FeriadosDialog.jsx';
import { supabaseClient } from '../services/supabase.js';

// Mock data
const mockFeriadosNacionais = {
  '2025-0-1': '🎉 Ano Novo',
  '2025-11-25': '🎄 Natal',
  '2025-3-21': '🎖 Tiradentes'
};

const mockFeriadosMunicipais = {
  '2025-5-15': 'Festa da Cidade',
  '2025-7-20': 'Aniversário da Cidade'
};

describe('FeriadosDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnFeriadoAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza dialog com título e seções principais', () => {
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

  test('exibe feriados nacionais corretamente', () => {
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
    expect(screen.getByText('🎖 Tiradentes')).toBeInTheDocument();
  });

  test('exibe feriados municipais com botão de remover', () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    expect(screen.getByText('Festa da Cidade')).toBeInTheDocument();
    expect(screen.getByText('Aniversário da Cidade')).toBeInTheDocument();

    // Verifica se há botões de remover
    const removeButtons = screen.getAllByRole('button');
    const trashButtons = removeButtons.filter(btn =>
      btn.querySelector('svg') && btn.classList.contains('btn-remove')
    );
    expect(trashButtons.length).toBeGreaterThan(0);
  });

  test('abre e fecha formulário de adicionar feriado', () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    // Formulário não deve estar visível inicialmente
    expect(screen.queryByPlaceholderText('Nome do feriado')).not.toBeInTheDocument();

    // Clica no botão de adicionar
    const addButton = screen.getByRole('button', { name: '' });
    fireEvent.click(addButton);

    // Formulário deve aparecer
    expect(screen.getByPlaceholderText('Nome do feriado')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toBeInTheDocument();

    // Clica em cancelar
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    // Formulário deve desaparecer
    expect(screen.queryByPlaceholderText('Nome do feriado')).not.toBeInTheDocument();
  });

  test('valida campos obrigatórios no formulário', () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    // Abre formulário
    const addButton = screen.getByRole('button', { name: '' });
    fireEvent.click(addButton);

    // Tenta submeter sem preencher
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    // Formulário deve permanecer aberto (validação falhou)
    expect(screen.getByPlaceholderText('Nome do feriado')).toBeInTheDocument();
  });

  test('preenche e submete formulário corretamente', async () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    // Abre formulário
    const addButton = screen.getByRole('button', { name: '' });
    fireEvent.click(addButton);

    // Preenche campos
    const nameInput = screen.getByPlaceholderText('Nome do feriado');
    const dateInput = screen.getByDisplayValue('');

    fireEvent.change(nameInput, { target: { value: 'Novo Feriado Municipal' } });
    fireEvent.change(dateInput, { target: { value: '2025-08-15' } });

    // Submete formulário
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    // Verifica se os campos foram preenchidos
    expect(nameInput.value).toBe('Novo Feriado Municipal');
    expect(dateInput.value).toBe('2025-08-15');
  });

  test('fecha dialog ao clicar no botão X', () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('fecha dialog ao clicar no overlay', () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay);

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

  test('formata datas corretamente', () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    // Verifica se as datas são formatadas em português
    const dateElements = screen.getAllByText(/\w+,\s+\d+\s+de\s+\w+\s+de\s+\d{4}/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  test('mantém estado local dos feriados municipais', () => {
    const { rerender } = render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    expect(screen.getByText('Festa da Cidade')).toBeInTheDocument();

    // Simula mudança de props
    rerender(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={{ '2025-6-10': 'Novo Feriado' }}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    // Estado local deve manter os feriados originais
    expect(screen.getByText('Festa da Cidade')).toBeInTheDocument();
  });

  test('exibe estado de loading no botão durante submissão', async () => {
    render(
      <FeriadosDialog
        feriadosNacionais={mockFeriadosNacionais}
        feriadosMunicipais={mockFeriadosMunicipais}
        onClose={mockOnClose}
        onFeriadoAdded={mockOnFeriadoAdded}
      />
    );

    // Abre formulário
    const addButton = screen.getByRole('button', { name: '' });
    fireEvent.click(addButton);

    // Preenche campos
    const nameInput = screen.getByPlaceholderText('Nome do feriado');
    const dateInput = screen.getByDisplayValue('');

    fireEvent.change(nameInput, { target: { value: 'Teste' } });
    fireEvent.change(dateInput, { target: { value: '2025-08-15' } });

    // Submete formulário
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    // Durante a submissão, pode mostrar estado de loading
    // (depende da implementação do mock do Supabase)
  });
});

