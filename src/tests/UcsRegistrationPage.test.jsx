import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UcsRegistrationPage from '../pages/UcsRegistrationPage.jsx';
import { supabaseClient } from '../services/supabase.js';

describe('UcsRegistrationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    supabaseClient.from.mockImplementation((table) => {
      if (table === 'cursos') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() =>
              Promise.resolve({
                data: [{ idcurso: 1, nomecurso: 'Programação em Python' }],
                error: null
              })
            )
          }))
        };
      }

      if (table === 'unidades_curriculares') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() =>
              Promise.resolve({
                data: [
                  {
                    iduc: 1,
                    nomeuc: 'Banco de Dados',
                    cargahoraria: 80,
                    cursos: { nomecurso: 'Programação em Python' }
                  }
                ],
                error: null
              })
            )
          }))
        };
      }

      return { select: jest.fn(() => ({ order: jest.fn(() => Promise.resolve({ data: [], error: null })) })) };
    });
  });

  test('renderiza a página de cadastro de UCs', async () => {
    render(<UcsRegistrationPage />);

    await waitFor(() => {
      expect(screen.getByText('Cadastrar Nova Unidade Curricular')).toBeInTheDocument();
      expect(screen.getByText('Banco de Dados')).toBeInTheDocument();

      // Evita conflito com o <option>
      const ucDetail = screen.getAllByText(/Curso: Programação em Python/i)
        .find(el => el.classList.contains('ucs-details'));
      expect(ucDetail).toBeInTheDocument();
    });
  });
});
