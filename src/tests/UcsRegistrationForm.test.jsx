// src/tests/UcsRegistrationForm.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UCSRegistrationForm from '../components/UcsRegistrationForm.jsx';

describe('UCSRegistrationForm', () => {
  const mockCursos = [
    { idcurso: 1, nomecurso: 'Programação em Python' },
    { idcurso: 2, nomecurso: 'Engenharia de Software' },
    { idcurso: 3, nomecurso: 'Base de Dados' }
  ];

  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza todos os campos obrigatórios', () => {
    render(<UCSRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Nome da Unidade Curricular/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Carga Horária/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Curso/i)).toBeInTheDocument();
  });

  test('renderiza opções de cursos no select', () => {
    render(<UCSRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    mockCursos.forEach(curso => {
      expect(screen.getByText(curso.nomecurso)).toBeInTheDocument();
    });
  });

  test('valida campos obrigatórios ao submeter formulário vazio', async () => {
    render(<UCSRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /Salvar Unidade Curricular/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Nome da UC é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/Carga horária é obrigatória/i)).toBeInTheDocument();
      expect(screen.getByText(/Curso é obrigatório/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });


  test('submete formulário com dados válidos', async () => {
    mockOnSubmit.mockResolvedValue({ success: true });

    render(<UCSRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/Nome da Unidade Curricular/i), {
      target: { value: 'Programação Avançada em Python' }
    });
    fireEvent.change(screen.getByLabelText(/Carga Horária/i), {
      target: { value: '120' }
    });
    fireEvent.change(screen.getByLabelText(/Curso/i), {
      target: { value: '1' }
    });

    const submitButton = screen.getByRole('button', { name: /Salvar Unidade Curricular/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        nomeuc: 'Programação Avançada em Python',
        cargahoraria: '120',
        idcurso: '1'
      });
    });

    // mensaje de sucesso exibido
    await waitFor(() => {
      expect(screen.getByText(/Unidade Curricular registrada com sucesso/i)).toBeInTheDocument();
    });
  });

  test('limpa formulário quando botão limpar é clicado', () => {
    render(<UCSRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/Nome da Unidade Curricular/i), { target: { value: 'Teste' } });
    fireEvent.change(screen.getByLabelText(/Carga Horária/i), { target: { value: '60' } });

    const clearButton = screen.getByRole('button', { name: /Limpar/i });
    fireEvent.click(clearButton);

    expect(screen.getByLabelText(/Nome da Unidade Curricular/i).value).toBe('');
    expect(screen.getByLabelText(/Carga Horária/i).value).toBe('');
    expect(screen.getByLabelText(/Curso/i).value).toBe('');
  });
});
