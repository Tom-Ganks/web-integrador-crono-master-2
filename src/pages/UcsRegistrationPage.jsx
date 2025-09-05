import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import UcsRegistrationForm from '../components/UcsRegistrationForm.jsx';
import { supabaseClient } from '../services/supabase.js';
import '../styles/forms.css';

const UCSRegistrationPage = ({ onNavigateHome }) => {
  const [cursos, setCursos] = useState([]);
  const [ucs, setUcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurso, setSelectedCurso] = useState('');

  useEffect(() => {
    loadCursos();
    loadUcs();
  }, []);

  const loadCursos = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('cursos')
        .select('idcurso, nomecurso')
        .order('nomecurso');

      if (error) throw error;
      setCursos(data || []);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  };

  const loadUcs = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('unidades_curriculares')
        .select('iduc, nomeuc, cargahoraria, cursos(nomecurso)')
        .order('nomeuc');

      if (error) throw error;
      setUcs(data || []);
    } catch (error) {
      console.error('Erro ao carregar UCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUCSSubmit = async (ucsData) => {
    try {
      const { error } = await supabaseClient
        .from('unidades_curriculares')
        .insert([{
          nomeuc: ucsData.nomeuc,
          cargahoraria: parseInt(ucsData.cargahoraria),
          idcurso: parseInt(ucsData.idcurso)
        }]);

      if (error) throw error;
      await loadUcs();
    } catch (error) {
      console.error('Erro ao registrar UCS:', error);
      throw error;
    }
  };

  const filteredUcs = selectedCurso 
    ? ucs.filter(uc => uc.cursos?.nomecurso === selectedCurso)
    : ucs;

  if (loading) {
    return (
      <div className="ucs-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ucs-page">
      {/* Header */}
      <div className="ucs-header">
        <button className="back-button" onClick={onNavigateHome}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="ucs-title">Unidades Curriculares</h1>
      </div>

      <div className="ucs-content">
        {/* Registration Form */}
        <div className="registration-card">
          <h2 className="form-title">Cadastrar Nova Unidade Curricular</h2>
          <UcsRegistrationForm cursos={cursos} onSubmit={handleUCSSubmit} />
        </div>

        {/* List Section */}
        <div className="list-section">
          <h3 className="list-title">Unidades Curriculares Cadastradas</h3>
          
          <div className="filter-container">
            <select 
              className="filter-select"
              value={selectedCurso}
              onChange={(e) => setSelectedCurso(e.target.value)}
            >
              <option value="">Filtrar por curso: Todos os cursos</option>
              {cursos.map(curso => (
                <option key={curso.idcurso} value={curso.nomecurso}>
                  Filtrar por curso: {curso.nomecurso}
                </option>
              ))}
            </select>
          </div>

          <ul className="ucs-list">
            {filteredUcs.map((uc) => (
              <li key={uc.iduc} className="ucs-item">
                <div className="ucs-info">
                  <div className="ucs-name">{uc.nomeuc}</div>
                  <div className="ucs-details">
                    Carga horária: {uc.cargahoraria} horas<br />
                    Curso: {uc.cursos?.nomecurso || 'Sem curso'}
                  </div>
                </div>
                <div className="action-buttons">
                  <button className="btn-edit" title="Editar">✏️</button>
                  <button className="btn-delete" title="Excluir">🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UCSRegistrationPage;