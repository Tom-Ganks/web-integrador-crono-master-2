import React, { useState, useEffect } from 'react';
import UCSRegistrationForm from '../components/UcsRegistrationForm.jsx';
import { supabaseClient } from '../services/supabase.js';

const UCSRegistrationPage = () => {
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
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="header-bar">
        Unidades Curriculares
      </div>

      {/* Main content */}
      <div className="main-container">
        <div className="registration-card">
          {/* Registration form */}
          <h2 className="form-title">Cadastrar Nova Unidade Curricular</h2>
          <UCSRegistrationForm cursos={cursos} onSubmit={handleUCSSubmit} />

          {/* List section */}
          <div className="list-section">
            <h3 className="list-title">Unidades Curriculares Cadastradas</h3>
            
            {/* Filter */}
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

            {/* UCS List */}
            <ul className="ucs-list">
              {filteredUcs.map((uc) => (
                <li key={uc.iduc} className="ucs-item">
                  <div className="ucs-name">{uc.nomeuc}</div>
                  <div className="ucs-details">
                    Carga horária: {uc.cargahoraria} horas<br />
                    Curso: {uc.cursos?.nomecurso || 'Sem curso'}
                  </div>
                  <div className="action-buttons">
                    <button className="btn-edit">✏️</button>
                    <button className="btn-delete">🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UCSRegistrationPage;