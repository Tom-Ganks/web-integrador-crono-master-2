import React, { useState } from 'react';

const UCSRegistrationForm = ({ cursos = [], onSubmit }) => {
  const [formData, setFormData] = useState({
    nomeuc: '',
    cargahoraria: '',
    idcurso: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nomeuc.trim()) newErrors.nomeuc = 'Nome da UC é obrigatório';
    if (!formData.cargahoraria) newErrors.cargahoraria = 'Carga horária é obrigatória';
    if (!formData.idcurso) newErrors.idcurso = 'Curso é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setSubmitMessage({ type: 'success', text: 'Unidade Curricular registrada com sucesso!' });
      clearForm();
    } catch (error) {
      setSubmitMessage({ type: 'error', text: `Erro ao registrar UC: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({ nomeuc: '', cargahoraria: '', idcurso: '' });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Nome UC */}
      <div className="mb-3">
        <label htmlFor="nomeuc" className="form-label">Nome da Unidade Curricular</label>
        <div className="input-group">
          <span className="input-group-text"><i className="bi bi-journal-text"></i></span>
          <input
            type="text"
            className={`form-control ${errors.nomeuc ? 'is-invalid' : ''}`}
            id="nomeuc"
            name="nomeuc"
            value={formData.nomeuc}
            onChange={handleChange}
            placeholder="Ex: Programação em Python"
          />
          <div className="invalid-feedback">{errors.nomeuc}</div>
        </div>
      </div>

      {/* Carga Horária */}
      <div className="mb-3">
        <label htmlFor="cargahoraria" className="form-label">Carga Horária (horas)</label>
        <div className="input-group">
          <span className="input-group-text"><i className="bi bi-clock"></i></span>
          <input
            type="number"
            className={`form-control ${errors.cargahoraria ? 'is-invalid' : ''}`}
            id="cargahoraria"
            name="cargahoraria"
            value={formData.cargahoraria}
            onChange={handleChange}
            placeholder="Ex: 60"
          />
          <div className="invalid-feedback">{errors.cargahoraria}</div>
        </div>
      </div>

      {/* Curso */}
      <div className="mb-3">
        <label htmlFor="idcurso" className="form-label">Curso</label>
        <div className="input-group">
          <span className="input-group-text"><i className="bi bi-mortarboard"></i></span>
          <select
            className={`form-select ${errors.idcurso ? 'is-invalid' : ''}`}
            id="idcurso"
            name="idcurso"
            value={formData.idcurso}
            onChange={handleChange}
          >
            <option value="">Selecione um curso</option>
            {cursos.map(curso => (
              <option key={curso.idcurso} value={curso.idcurso}>{curso.nomecurso}</option>
            ))}
          </select>
          <div className="invalid-feedback">{errors.idcurso}</div>
        </div>
      </div>

      {/* Botões */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="submit" className="btn btn-success" disabled={isSubmitting}>
          <i className="bi bi-save me-2"></i>
          {isSubmitting ? 'Salvando...' : 'Salvar Unidade Curricular'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={clearForm} disabled={isSubmitting}>
          <i className="bi bi-x-circle me-2"></i>
          Limpar
        </button>
      </div>

      {/* Mensagem */}
      {submitMessage.text && (
        <div className={`alert mt-3 ${submitMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {submitMessage.text}
        </div>
      )}
    </form>
  );
};

export default UCSRegistrationForm;
