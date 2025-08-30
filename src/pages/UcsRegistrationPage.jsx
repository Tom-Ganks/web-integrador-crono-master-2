import React, { useState, useEffect } from 'react';
import UcsRegistrationForm from '../components/UcsRegistrationForm.jsx';
import { supabaseClient } from '../services/supabase.js';

const UcsRegistrationPage = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCursos();
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
    } finally {
      setLoading(false);
    }
  };

  const handleUCSSubmit = async (ucsData) => {
    try {
      const { data, error } = await supabaseClient
        .from('unidades_curriculares')
        .insert([{
          nomeuc: ucsData.nomeuc,
          cargahoraria: parseInt(ucsData.cargahoraria),
          idcurso: parseInt(ucsData.idcurso)
        }]);

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao registrar UCS:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 bg-light">
      <div className="row">
        <div className="col-12">
          <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container">
              <a className="navbar-brand" href="#">
                <i className="bi bi-calendar-check me-2"></i>
                Sistema de Gestão Acadêmica
              </a>
              <span className="navbar-text">
                Registro de Unidades Curriculares
              </span>
            </div>
          </nav>
        </div>
      </div>
      
      <div className="row justify-content-center py-4">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="card-title mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Registrar Nova Unidade Curricular (Ucs)
              </h4>
            </div>
            <div className="card-body">
              <UcsRegistrationForm 
                cursos={cursos}
                onSubmit={handleUCSSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UcsRegistrationPage;