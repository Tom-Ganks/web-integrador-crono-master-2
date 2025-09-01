import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UcsRegistrationPage from '../pages/UcsRegistrationPage.jsx';

// Mock do supabase
jest.mock('../services/supabase.js', () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: [
            { idcurso: 1, nomecurso: 'Técnico em Informática' }
          ],
          error: null
        }))
      }))
    }))
  }
}));

describe('UcsRegistrationPage', () => {
  test('renderiza título e formulário', async () => {
    render(<UcsRegistrationPage />);

    // Aguarda os cursos serem carregados
    await waitFor(() => {
      expect(screen.getByText(/Cadastrar Nova Unidade Curricular/i)).toBeInTheDocument();
    });

    // Verifica se o campo de curso foi renderizado
    expect(screen.getByLabelText(/curso/i)).toBeInTheDocument();
  });
});
