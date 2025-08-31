import { render, screen } from '@testing-library/react';
import App from './App';

// Mock do supabase para os testes
jest.mock('./services/supabase', () => ({
  supabaseClient: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data: [], error: null })
  }
}));

test('renders UCS registration form', () => {
  render(<App />);
  
  // Verifica se o título do formulário está presente
  const titleElement = screen.getByText(/Registrar Nova Unidade Curricular/i);
  expect(titleElement).toBeInTheDocument();
  
  // Verifica se o campo de nome da UC está presente
  const nomeInput = screen.getByPlaceholderText(/Programação em Python/i);
  expect(nomeInput).toBeInTheDocument();
});