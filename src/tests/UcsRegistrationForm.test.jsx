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
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Carga Horária')).toBeInTheDocument();
    expect(screen.getByLabelText('Curso')).toBeInTheDocument();
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

    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'Programação Avançada em Python' }
    });
    fireEvent.change(screen.getByLabelText('Carga Horária'), {
      target: { value: '120' }
    });
    fireEvent.change(screen.getByLabelText('Curso'), {
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

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  test('exibe mensagens de erro de validação', async () => {
    render(<UCSRegistrationForm cursos={mockCursos} onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'AB' }
    });
    fireEvent.change(screen.getByLabelText('Carga Horária'), {
      target: { value: '600' }
    });

    const submitButton = screen.getByRole('button', { name: /Salvar Unidade Curricular/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Nome da UC deve ter pelo menos 3 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/Carga horária deve estar entre 1 e 500 horas/i)).toBeInTheDocument();
    });
  });
});
