import { render, screen } from '@testing-library/react';
import App from './App';

// Mock do supabase para os testes
jest.mock('./services/supabase.js', () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

test('renders home page correctly', () => {
  render(<App />);
  
  // Verifica elementos únicos da página inicial
  expect(screen.getByText('SENAC Catalão')).toBeInTheDocument();
  expect(screen.getByText('Gestão de Cronogramas')).toBeInTheDocument();
  
  // Use getAllByText para elementos que aparecem múltiplas vezes
  const unidadesElements = screen.getAllByText('Unidades Curriculares');
  expect(unidadesElements.length).toBeGreaterThan(0);
  
  const cronogramaElements = screen.getAllByText('Cronograma');
  expect(cronogramaElements.length).toBeGreaterThan(0);
});