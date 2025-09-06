// src/tests/UcsRegistrationPage.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UcsRegistrationPage from '../pages/UcsRegistrationPage';
import { supabaseClient } from '../services/supabase';

// mock global já está em setupTests.js, aqui sobrescrevemos em cada teste
jest.mock('../services/supabase');

describe('UcsRegistrationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza a página de cadastro de UCs com dados do supabase', async () => {
    // mock cursos
    supabaseClient.from.mockImplementation((table) => {
      if (table === 'cursos') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() =>
              Promise.resolve({ data: [{ idcurso: 1, nomecurso: 'Programação em Python' }], error: null })
            ),
          })),
        };
      }
      if (table === 'unidades_curriculares') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() =>
              Promise.resolve({
                data: [{ iduc: 10, nomeuc: 'Banco de Dados', cargahoraria: 80, curso: { nomecurso: 'Programação em Python' } }],
                error: null,
              })
            ),
          })),
        };
      }
      return { select: jest.fn() };
    });

    render(<UcsRegistrationPage />);

    await waitFor(() => {
      expect(screen.getByText('Cadastrar Nova Unidade Curricular')).toBeInTheDocument();
      expect(screen.getByText('Banco de Dados')).toBeInTheDocument();
      expect(screen.getByText(/Curso: Programação em Python/i)).toBeInTheDocument();
    });
  });

  test('mostra erro ao carregar cursos', async () => {
    supabaseClient.from.mockImplementation((table) => {
      if (table === 'cursos') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: null, error: new Error('Falha cursos') })),
          })),
        };
      }
      return { select: jest.fn() };
    });

    render(<UcsRegistrationPage />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  test('mostra erro ao carregar UCs', async () => {
    supabaseClient.from.mockImplementation((table) => {
      if (table === 'cursos') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [{ idcurso: 1, nomecurso: 'Python' }], error: null })),
          })),
        };
      }
      if (table === 'unidades_curriculares') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: null, error: new Error('Falha UCs') })),
          })),
        };
      }
      return { select: jest.fn() };
    });

    render(<UcsRegistrationPage />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  test('mostra erro ao salvar UC', async () => {
    supabaseClient.from.mockImplementation((table) => {
      if (table === 'cursos') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [{ idcurso: 1, nomecurso: 'Python' }], error: null })),
          })),
        };
      }
      if (table === 'unidades_curriculares') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          insert: jest.fn(() => Promise.resolve({ error: new Error('Falha insert') })),
        };
      }
      return { select: jest.fn() };
    });

    render(<UcsRegistrationPage />);

    const input = await screen.findByLabelText('Nome');
    fireEvent.change(input, { target: { value: 'Nova UC' } });

    const carga = screen.getByLabelText('Carga Horária');
    fireEvent.change(carga, { target: { value: '40' } });

    const select = screen.getByLabelText('Curso');
    fireEvent.change(select, { target: { value: '1' } });

    fireEvent.click(screen.getByText(/Salvar Unidade Curricular/i));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  test('mostra erro ao excluir UC', async () => {
    supabaseClient.from.mockImplementation((table) => {
      if (table === 'cursos') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [{ idcurso: 1, nomecurso: 'Python' }], error: null })),
          })),
        };
      }
      if (table === 'unidades_curriculares') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() =>
              Promise.resolve({
                data: [{ iduc: 99, nomeuc: 'Teste UC', cargahoraria: 30, curso: { nomecurso: 'Python' } }],
                error: null,
              })
            ),
          })),
          delete: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: new Error('Falha delete') })),
          })),
        };
      }
      return { select: jest.fn() };
    });

    render(<UcsRegistrationPage />);

    const deleteBtn = await screen.findByTitle('Excluir');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
});
