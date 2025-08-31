import React, { useState, useEffect } from 'react';
import UCSRegistrationForm from '../components/UcsRegistrationForm.jsx';
import { supabaseClient } from '../services/supabase.js';

const UCSRegistrationPage = () => {
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
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 bg-light d-flex flex-column">
      {/* Barra superior igual versão Windows */}
      <div className="bg-success text-white text-center py-3 shadow-sm">
        <h4 className="m-0">Unidades Curriculares</h4>
      </div>

      {/* Card central */}
      <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <div className="card shadow p-4" style={{ maxWidth: '600px', width: '100%', borderRadius: '12px' }}>
          <h5 className="text-center mb-3 text-success fw-bold">Cadastrar Nova Unidade Curricular</h5>
          <UCSRegistrationForm cursos={cursos} onSubmit={handleUCSSubmit} />
        </div>
      </div>
    </div>
  );
};

export default UCSRegistrationPage;
