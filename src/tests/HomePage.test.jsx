import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../pages/home/HomePage.jsx';

describe('HomePage', () => {
  test('renderiza o título principal', () => {
    render(<HomePage />);
    expect(screen.getByText('Gestão dos Cronogramas')).toBeInTheDocument();
  });

  test('renderiza os cards do menu', () => {
    render(<HomePage />);
    const ucCards = screen.getAllByText('Unidades Curriculares');
    const cronogramaCards = screen.getAllByText('Cronograma');

    expect(ucCards.length).toBeGreaterThan(0);
    expect(cronogramaCards.length).toBeGreaterThan(0);
  });

  test('abre sidebar ao clicar no menu', () => {
    render(<HomePage />);
    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  test('renderiza informações do usuário na sidebar', () => {
    render(<HomePage />);
    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('admin@senac.com.br')).toBeInTheDocument();
  });

  test('navega para página de unidades curriculares', () => {
    render(<HomePage />);
    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);

    const ucLink = screen.getAllByText('Unidades Curriculares').find(
      el => el.tagName.toLowerCase() === 'a'
    );
    expect(ucLink).toBeInTheDocument();
  });

  test('navega para página de cronograma', () => {
    render(<HomePage />);
    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);

    const cronogramaLink = screen.getAllByText('Cronograma').find(
      el => el.tagName.toLowerCase() === 'a'
    );
    expect(cronogramaLink).toBeInTheDocument();
  });
});
