import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UcsRegistrationForm from './UcsRegistrationForm.jsx;'

// Mock cursos data
const mockCursos = [
  { idcurso: 1, nomecurso: 'Programação em Python' },
  { idcurso: 2, nomecurso: 'Engenharia de Software' },
  { idcurso: 3, nomecurso: 'Base de Dados' }
];

describe('CUSRegistrationForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza todos os campos obrigatórios', () => {
    render(<UcsRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/nome da unidade curricular/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/carga horária/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/curso/i)).toBeInTheDocument();
  });

  test('renderiza opções de cursos no select', () => {
    render(<UcsRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    const cursoSelect = screen.getByLabelText(/curso/i);
    expect(cursoSelect).toBeInTheDocument();
    
    mockCursos.forEach(curso => {
      expect(screen.getByText(curso.nomecurso)).toBeInTheDocument();
    });
  });

  test('valida campos obrigatórios ao submeter formulário vazio', async () => {
    render(<UcsRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /registrar uc/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nome da uc é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/carga horária é obrigatória/i)).toBeInTheDocument();
      expect(screen.getByText(/curso é obrigatório/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('valida nome da UC com menos de 3 caracteres', async () => {
    render(<UcsRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    const nomeInput = screen.getByLabelText(/nome da unidade curricular/i);
    fireEvent.change(nomeInput, { target: { value: 'AB' } });
    
    const submitButton = screen.getByRole('button', { name: /registrar uc/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nome da uc deve ter pelo menos 3 caracteres/i)).toBeInTheDocument();
    });
  });

  test('valida carga horária fora do intervalo permitido', async () => {
    render(<UcsRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    const cargaInput = screen.getByLabelText(/carga horária/i);
    fireEvent.change(cargaInput, { target: { value: '600' } });
    
    const submitButton = screen.getByRole('button', { name: /registrar uc/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/carga horária deve estar entre 1 e 500 horas/i)).toBeInTheDocument();
    });
  });

  test('submete formulário com dados válidos', async () => {
    mockOnSubmit.mockResolvedValue({ success: true });
    
    render(<UcsRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    // Preencher formulário
    fireEvent.change(screen.getByLabelText(/nome da unidade curricular/i), {
      target: { value: 'Programação Avançada em Python' }
    });
    fireEvent.change(screen.getByLabelText(/carga horária/i), {
      target: { value: '120' }
    });
    fireEvent.change(screen.getByLabelText(/curso/i), {
      target: { value: '1' }
    });

    const submitButton = screen.getByRole('button', { name: /registrar uc/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        nomeuc: 'Programação Avançada em Python',
        cargahoraria: '120',
        idcurso: '1'
      });
    });
  });

  test('limpa formulário quando botão limpar é clicado', () => {
    render(<UcsRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    // Preencher alguns campos
    fireEvent.change(screen.getByLabelText(/nome da unidade curricular/i), {
      target: { value: 'Teste' }
    });
    fireEvent.change(screen.getByLabelText(/carga horária/i), {
      target: { value: '60' }
    });

    const clearButton = screen.getByRole('button', { name: /limpar/i });
    fireEvent.click(clearButton);

    expect(screen.getByLabelText(/nome da unidade curricular/i).value).toBe('');
    expect(screen.getByLabelText(/carga horária/i).value).toBe('');
    expect(screen.getByLabelText(/curso/i).value).toBe('');
  });

  test('mostra mensagem de sucesso após submissão bem-sucedida', async () => {
    mockOnSubmit.mockResolvedValue({ success: true });
    
    render(<UcsRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    // Preencher e submeter formulário válido
    fireEvent.change(screen.getByLabelText(/nome da unidade curricular/i), {
      target: { value: 'Teste UC' }
    });
    fireEvent.change(screen.getByLabelText(/carga horária/i), {
      target: { value: '60' }
    });
    fireEvent.change(screen.getByLabelText(/curso/i), {
      target: { value: '1' }
    });

    fireEvent.click(screen.getByRole('button', { name: /registrar uc/i }));

    await waitFor(() => {
      expect(screen.getByText(/unidade curricular registrada com sucesso/i)).toBeInTheDocument();
    });
  });

  test('mostra mensagem de erro quando submissão falha', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Erro de conexão'));
    
    render(<UcsRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    // Preencher e submeter formulário válido
    fireEvent.change(screen.getByLabelText(/nome da unidade curricular/i), {
      target: { value: 'Teste UC' }
    });
    fireEvent.change(screen.getByLabelText(/carga horária/i), {
      target: { value: '60' }
    });
    fireEvent.change(screen.getByLabelText(/curso/i), {
      target: { value: '1' }
    });

    fireEvent.click(screen.getByRole('button', { name: /registrar uc/i }));

    await waitFor(() => {
      expect(screen.getByText(/erro ao registrar uc: erro de conexão/i)).toBeInTheDocument();
    });
  });
});