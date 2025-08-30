import React, { useState } from 'react';

const USCRegistrationForm = ({ cursos = [], onSubmit }) => {
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nomeuc.trim()) {
      newErrors.nomeuc = 'Nome da UC é obrigatório';
    } else if (formData.nomeuc.trim().length < 3) {
      newErrors.nomeuc = 'Nome da UC deve ter pelo menos 3 caracteres';
    }

    if (!formData.cargahoraria) {
      newErrors.cargahoraria = 'Carga horária é obrigatória';
    } else if (parseInt(formData.cargahoraria) < 1 || parseInt(formData.cargahoraria) > 500) {
      newErrors.cargahoraria = 'Carga horária deve estar entre 1 e 500 horas';
    }

    if (!formData.idcurso) {
      newErrors.idcurso = 'Curso é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitMessage({
        type: 'error',
        text: 'Por favor, corrija os erros antes de continuar.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      await onSubmit(formData);
      setSubmitMessage({
        type: 'success',
        text: 'Unidade Curricular registrada com sucesso!'
      });
      clearForm();
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: `Erro ao registrar UC: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      nomeuc: '',
      cargahoraria: '',
      idcurso: ''
    });
    setErrors({});
    setSubmitMessage({ type: '', text: '' });
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="nomeuc" className="form-label">
            Nome da Unidade Curricular <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.nomeuc ? 'is-invalid' : ''}`}
            id="nomeuc"
            name="nomeuc"
            value={formData.nomeuc}
            onChange={handleChange}
            placeholder="Ex: Programação em Python"
            required
          />
          {errors.nomeuc && (
            <div className="invalid-feedback">{errors.nomeuc}</div>
          )}
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="cargahoraria" className="form-label">
                Carga Horária (horas) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control ${errors.cargahoraria ? 'is-invalid' : ''}`}
                id="cargahoraria"
                name="cargahoraria"
                value={formData.cargahoraria}
                onChange={handleChange}
                min="1"
                max="500"
                placeholder="Ex: 60"
                required
              />
              {errors.cargahoraria && (
                <div className="invalid-feedback">{errors.cargahoraria}</div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="idcurso" className="form-label">
                Curso <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${errors.idcurso ? 'is-invalid' : ''}`}
                id="idcurso"
                name="idcurso"
                value={formData.idcurso}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um curso</option>
                {cursos.map(curso => (
                  <option key={curso.idcurso} value={curso.idcurso}>
                    {curso.nomecurso}
                  </option>
                ))}
              </select>
              {errors.idcurso && (
                <div className="invalid-feedback">{errors.idcurso}</div>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Registrando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Registrar UC
              </>
            )}
          </button>
          
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={clearForm}
            disabled={isSubmitting}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Limpar
          </button>
        </div>
      </form>

      {submitMessage.text && (
        <div className={`alert ${submitMessage.type === 'success' ? 'alert-success' : 'alert-danger'} mt-3`} role="alert">
          <i className={`bi ${submitMessage.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {submitMessage.text}
        </div>
      )}
    </>
  );
};

export default USCRegistrationForm;