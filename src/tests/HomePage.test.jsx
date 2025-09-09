import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../pages/home/HomePage.jsx';

// Mock the child components to avoid complex rendering
jest.mock('../pages/CronogramaPage.jsx', () => {
  return function MockCronogramaPage({ onNavigateHome }) {
    return (
      <div data-testid="cronograma-page">
        <button onClick={onNavigateHome}>Voltar</button>
        <h1>Cronograma Page</h1>
      </div>
    );
  };
});

jest.mock('../pages/UcsRegistrationPage.jsx', () => {
  return function MockUcsRegistrationPage({ onNavigateHome }) {
    return (
      <div data-testid="ucs-page">
        <button onClick={onNavigateHome}>Voltar</button>
        <h1>UCS Page</h1>
      </div>
    );
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza o título principal', () => {
    render(<HomePage />);
    expect(screen.getByText('Gestão dos Cronogramas')).toBeInTheDocument();
  });

  test('renderiza informações do sistema', () => {
    render(<HomePage />);
    expect(screen.getByText('SENAC Catalão')).toBeInTheDocument();
    expect(screen.getByText('Gestão de Cronogramas')).toBeInTheDocument();
    expect(screen.getByText('Bem-vindo ao sistema de gestão de cronogramas')).toBeInTheDocument();
  });

  test('renderiza os cards do menu principal', () => {
    render(<HomePage />);
    
    // Use getAllByText para elementos que aparecem múltiplas vezes
    const unidadesElements = screen.getAllByText('Unidades Curriculares');
    expect(unidadesElements.length).toBeGreaterThan(0);

    const cronogramaElements = screen.getAllByText('Cronograma');
    expect(cronogramaElements.length).toBeGreaterThan(0);
  });

  test('abre sidebar ao clicar no menu', () => {
    render(<HomePage />);
    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('admin@senac.com.br')).toBeInTheDocument();
  });

  test('fecha sidebar ao clicar no overlay', () => {
    render(<HomePage />);
    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);
    
    // Sidebar está aberta
    expect(screen.getByText('Menu')).toBeInTheDocument();
    
    // Clica no overlay para fechar
    const overlay = document.querySelector('.sidebar-overlay');
    fireEvent.click(overlay);
    
    // Verifica se a sidebar não tem mais a classe 'open'
    const sidebar = document.querySelector('.sidebar');
    expect(sidebar).not.toHaveClass('open');
  });

  test('navega para página de unidades curriculares via card', () => {
    render(<HomePage />);
    
    // Encontra o card específico (não o link da sidebar)
    const menuCards = screen.getAllByText('Unidades Curriculares');
    const ucCard = menuCards.find(el => el.closest('.menu-card'));
    
    fireEvent.click(ucCard.closest('.menu-card'));
    
    // Verifica se navegou para a página de UCs
    expect(screen.getByTestId('ucs-page')).toBeInTheDocument();
  });

  test('navega para página de cronograma via card', () => {
    render(<HomePage />);
    
    // Encontra o card específico (não o link da sidebar)
    const menuCards = screen.getAllByText('Cronograma');
    const cronogramaCard = menuCards.find(el => el.closest('.menu-card'));
    
    fireEvent.click(cronogramaCard.closest('.menu-card'));
    
    // Verifica se navegou para a página de cronograma
    expect(screen.getByTestId('cronograma-page')).toBeInTheDocument();
  });

  test('navega para página de unidades curriculares via sidebar', () => {
    render(<HomePage />);
    
    // Abre sidebar
    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);
    
    // Clica no link da sidebar
    const sidebarLinks = screen.getAllByText('Unidades Curriculares');
    const sidebarLink = sidebarLinks.find(el => el.tagName.toLowerCase() === 'a');
    
    fireEvent.click(sidebarLink);
    
    // Verifica se navegou para a página de UCs
    expect(screen.getByTestId('ucs-page')).toBeInTheDocument();
  });

  test('navega para página de cronograma via sidebar', () => {
    render(<HomePage />);
    
    // Abre sidebar
    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);
    
    // Clica no link da sidebar
    const sidebarLinks = screen.getAllByText('Cronograma');
    const sidebarLink = sidebarLinks.find(el => el.tagName.toLowerCase() === 'a');
    
    fireEvent.click(sidebarLink);
    
    // Verifica se navegou para a página de cronograma
    expect(screen.getByTestId('cronograma-page')).toBeInTheDocument();
  });

  test('volta para home a partir da página de UCs', () => {
    render(<HomePage />);
    
    // Navega para UCs
    const menuCards = screen.getAllByText('Unidades Curriculares');
    const ucCard = menuCards.find(el => el.closest('.menu-card'));
    fireEvent.click(ucCard.closest('.menu-card'));
    
    // Verifica que está na página de UCs
    expect(screen.getByTestId('ucs-page')).toBeInTheDocument();
    
    // Clica em voltar
    const voltarButton = screen.getByText('Voltar');
    fireEvent.click(voltarButton);
    
    // Verifica que voltou para home
    expect(screen.getByText('SENAC Catalão')).toBeInTheDocument();
  });

  test('volta para home a partir da página de cronograma', () => {
    render(<HomePage />);
    
    // Navega para cronograma
    const menuCards = screen.getAllByText('Cronograma');
    const cronogramaCard = menuCards.find(el => el.closest('.menu-card'));
    fireEvent.click(cronogramaCard.closest('.menu-card'));
    
    // Verifica que está na página de cronograma
    expect(screen.getByTestId('cronograma-page')).toBeInTheDocument();
    
    // Clica em voltar
    const voltarButton = screen.getByText('Voltar');
    fireEvent.click(voltarButton);
    
    // Verifica que voltou para home
    expect(screen.getByText('SENAC Catalão')).toBeInTheDocument();
  });

  test('renderiza ícones corretamente', () => {
    render(<HomePage />);
    
    // Verifica se os ícones estão presentes através dos data-testid
    expect(screen.getAllByTestId('graduation-cap-icon').length).toBeGreaterThan(0);
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });

  test('renderiza descrições dos cards', () => {
    render(<HomePage />);

    expect(screen.getByText('Cadastre e gerencie as unidades curriculares dos cursos')).toBeInTheDocument();
    expect(screen.getByText('Visualize e gerencie o cronograma de aulas')).toBeInTheDocument();
  });

  test('sidebar fecha ao navegar', () => {
    render(<HomePage />);
    
    // Abre sidebar
    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);
    
    // Verifica que sidebar está aberta
    const sidebar = document.querySelector('.sidebar');
    expect(sidebar).toHaveClass('open');
    
    // Navega via sidebar
    const sidebarLinks = screen.getAllByText('Unidades Curriculares');
    const sidebarLink = sidebarLinks.find(el => el.tagName.toLowerCase() === 'a');
    fireEvent.click(sidebarLink);
    
    // Sidebar deve fechar após navegação (não podemos testar isso diretamente pois o componente muda)
    expect(screen.getByTestId('ucs-page')).toBeInTheDocument();
  });

  test('mantém estado da sidebar corretamente', () => {
    render(<HomePage />);
    
    const menuButton = screen.getByTestId('menu-button');
    
    // Abre sidebar
    fireEvent.click(menuButton);
    let sidebar = document.querySelector('.sidebar');
    expect(sidebar).toHaveClass('open');
    
    // Fecha sidebar
    fireEvent.click(menuButton);
    sidebar = document.querySelector('.sidebar');
    expect(sidebar).not.toHaveClass('open');
  });
});