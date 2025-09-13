import React, { useState } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import CronogramaPage from '../cronograma/CronogramaPage.jsx';
import UCSRegistrationPage from '../ucsregisterpage/UcsRegistrationPage.jsx';
import '../../styles/home.css';
import GraduationCapIcon from '../../utils/cap.js';

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const navigateHome = () => {
    setCurrentPage('home');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'cronograma':
        return <CronogramaPage onNavigateHome={navigateHome} />;
      case 'unidades-curriculares':
        return <UCSRegistrationPage onNavigateHome={navigateHome} />;
      default:
        return <MainHomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="home-page">
      {currentPage === 'home' && (
        <>
          {/* Header */}
          <div className="home-header">
            <div className="header-content">
              <div className="header-title">
                <button className="menu-btn" onClick={toggleSidebar} data-testid="menu-button">
                  <Menu size={24} />
                </button>

                <GraduationCapIcon size={28} />
                <h1>Gestão dos Cronogramas</h1>
              </div>
              <div className="header-actions">
                <button className="header-btn" title="Notificações">
                  <Bell size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>
          <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <User size={24} />
              <h2>Menu</h2>
            </div>
            <div className="sidebar-content">
              <div className="user-info">
                <div className="user-avatar">
                  <User size={24} />
                </div>
                <div className="user-name">Administrador</div>
                <div className="user-email">admin@senac.com.br</div>
              </div>
              <nav>
                <ul className="nav-menu">
                  <li className="nav-item">
                    <a
                      href="#"
                      className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                      onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
                    >
                      <GraduationCapIcon size={20} />
                      Página Inicial
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      href="#"
                      className={`nav-link ${currentPage === 'unidades-curriculares' ? 'active' : ''}`}
                      onClick={(e) => { e.preventDefault(); navigateTo('unidades-curriculares'); }}
                    >
                      <GraduationCapIcon size={20} />
                      Unidades Curriculares
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      href="#"
                      className={`nav-link ${currentPage === 'cronograma' ? 'active' : ''}`}
                      onClick={(e) => { e.preventDefault(); navigateTo('cronograma'); }}
                    >
                      <GraduationCapIcon size={20} />
                      Cronograma
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      {renderCurrentPage()}
    </div>
  );
};

const MainHomePage = ({ onNavigate }) => {
  return (
    <div className="home-container">
      <div className="welcome-section">
        <div className="logo-container">
          <div className="logo-icon">
            <GraduationCapIcon size={40} />
          </div>
        </div>
        <h1 className="welcome-title">SENAC Catalão</h1>
        <p className="welcome-subtitle">Gestão de Cronogramas</p>
        <div className="welcome-message">
          Bem-vindo ao sistema de gestão de cronogramas
        </div>
      </div>

      <div className="menu-grid">
        <div className="menu-card" onClick={() => onNavigate('unidades-curriculares')}>
          <div className="menu-icon purple">
            <GraduationCapIcon size={28} />
          </div>
          <h3 className="menu-title">Unidades Curriculares</h3>
          <p className="menu-description">
            Cadastre e gerencie as unidades curriculares dos cursos
          </p>
        </div>

        <div className="menu-card" onClick={() => onNavigate('cronograma')}>
          <div className="menu-icon orange">
            <GraduationCapIcon size={28} />
          </div>
          <h3 className="menu-title">Cronograma</h3>
          <p className="menu-description">
            Visualize e gerencie o cronograma de aulas
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;