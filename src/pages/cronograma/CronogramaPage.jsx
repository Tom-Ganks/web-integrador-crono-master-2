import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Printer, Plus } from 'lucide-react';
import { supabaseClient } from '../../services/supabase.js';
import FeriadosDialog from '../../widgets/FeriadosDialog.jsx';
import AdicionarAulaDialog from '../../widgets/AdicionarAulaDialog.jsx';
import '../../styles/cronograma.css';

const CronogramaPage = ({ onNavigateHome }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [selectedDay, setSelectedDay] = useState(null);
  const [events, setEvents] = useState({});
  const [filteredEvents, setFilteredEvents] = useState({});
  const [turmas, setTurmas] = useState([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeriadosDialog, setShowFeriadosDialog] = useState(false);
  const [showAdicionarAulaDialog, setShowAdicionarAulaDialog] = useState(false);
  const [feriadosNacionais, setFeriadosNacionais] = useState({});
  const [feriadosMunicipais, setFeriadosMunicipais] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [aulaToDelete, setAulaToDelete] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [aulaToEdit, setAulaToEdit] = useState(null);

  const monthNames = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];

  const dayNames = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    aplicarFiltroTurma();
  }, [selectedTurmaId, events]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadTurmas(),
        loadAulas(),
        loadFeriadosNacionais(),
        loadFeriadosMunicipais()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTurmas = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('turma')
        .select('idturma, turma, cursos(nomecurso)')
        .order('turma');

      if (error) throw error;
      setTurmas(data || []);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const loadAulas = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('aulas')
        .select(`
          idaula, iduc, idturma, data, horario, status, horas,
          unidades_curriculares(nomeuc),
          turma(turma)
        `)
        .order('data');

      if (error) throw error;

      const eventsMap = {};
      data?.forEach(aula => {
        const date = new Date(aula.data);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        if (!eventsMap[dateKey]) {
          eventsMap[dateKey] = [];
        }
        eventsMap[dateKey].push(aula);
      });

      setEvents(eventsMap);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
    }
  };

  const loadFeriadosNacionais = () => {
    const feriados = {};
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year <= currentYear + 4; year++) {
      feriados[`${year}-0-1`] = '🎉 Ano Novo';
      feriados[`${year}-3-21`] = '🎖 Tiradentes';
      feriados[`${year}-4-1`] = '👷 Dia do Trabalho';
      feriados[`${year}-8-7`] = '🇧🇷 Independência do Brasil';
      feriados[`${year}-9-12`] = '🙏 Nossa Senhora Aparecida';
      feriados[`${year}-10-2`] = '🕯 Finados';
      feriados[`${year}-10-15`] = '🏛 Proclamação da República';
      feriados[`${year}-11-25`] = '🎄 Natal';
    }

    setFeriadosNacionais(feriados);
  };

  const loadFeriadosMunicipais = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('feriadosmunicipais')
        .select('data, nome');

      if (error) throw error;

      const feriados = {};
      data?.forEach(feriado => {
        const date = new Date(feriado.data);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        feriados[dateKey] = feriado.nome;
      });

      setFeriadosMunicipais(feriados);
    } catch (error) {
      console.error('Erro ao carregar feriados municipais:', error);
    }
  };

  const aplicarFiltroTurma = () => {
    if (!selectedTurmaId) {
      setFilteredEvents(events);
      return;
    }

    const filtered = {};
    Object.entries(events).forEach(([dateKey, aulas]) => {
      const filteredAulas = aulas.filter(aula => aula.idturma === selectedTurmaId);
      if (filteredAulas.length > 0) {
        filtered[dateKey] = filteredAulas;
      }
    });

    setFilteredEvents(filtered);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isFeriado = (date) => {
    if (!date) return false;
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return feriadosNacionais[dateKey] || feriadosMunicipais[dateKey];
  };

  const isDomingo = (date) => {
    return date && date.getDay() === 0;
  };

  const getEventsForDay = (date) => {
    if (!date) return [];
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return filteredEvents[dateKey] || [];
  };

  const handleDayClick = (date, isCtrlPressed = false) => {
    if (!date) return;

    if (isCtrlPressed) {
      const newSelectedDays = new Set(selectedDays);
      if (newSelectedDays.has(date.getTime())) {
        newSelectedDays.delete(date.getTime());
      } else {
        newSelectedDays.add(date.getTime());
      }
      setSelectedDays(newSelectedDays);
      setSelectedDay(null);
    } else {
      setSelectedDays(new Set());
      setSelectedDay(date);
    }
  };

  // Handler functions for edit and delete
  const handleEditAula = (aula) => {
    setAulaToEdit(aula);
    setShowEditDialog(true);
  };

  const handleDeleteAula = (aula) => {
    setAulaToDelete(aula);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAula = async () => {
    if (!aulaToDelete) return;

    try {
      const { error } = await supabaseClient
        .from('aulas')
        .delete()
        .eq('idaula', aulaToDelete.idaula);

      if (error) throw error;

      await loadAulas();
      setShowDeleteDialog(false);
      setAulaToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar aula:', error);
      alert('Erro ao deletar aula: ' + error.message);
    }
  };

  const handleEditSubmit = async (aulaData) => {
    try {
      const { error } = await supabaseClient
        .from('aulas')
        .update({
          horario: aulaData.horario,
          horas: aulaData.horas,
          status: aulaData.status
        })
        .eq('idaula', aulaToEdit.idaula);

      if (error) throw error;

      await loadAulas();
      setShowEditDialog(false);
      setAulaToEdit(null);
    } catch (error) {
      console.error('Erro ao atualizar aula:', error);
      alert('Erro ao atualizar aula: ' + error.message);
    }
  };

  const handleAdicionarAula = async (aulaData) => {
    try {
      const aulasParaInserir = Array.from(aulaData.dias).map(day => ({
        iduc: aulaData.iduc,
        idturma: aulaData.idturma,
        data: day.toISOString().split('T')[0],
        horario: aulaData.horario,
        status: 'Agendada',
        horas: aulaData.horas
      }));

      const { error } = await supabaseClient
        .from('aulas')
        .insert(aulasParaInserir);

      if (error) throw error;

      await loadAulas();
      setSelectedDays(new Set());
      setSelectedDay(null);
      setShowAdicionarAulaDialog(false);
    } catch (error) {
      console.error('Erro ao adicionar aula:', error);
      alert('Erro ao adicionar aula: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="cronograma-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cronograma-page">
      {/* Header */}
      <div className="cronograma-header">
        <div className="cronograma-header-left">
          <button className="back-button" onClick={onNavigateHome}>
            <ArrowLeft data-testid="arrow-left-icon" />
          </button>
          <h1 className="cronograma-title">Cronograma de Aulas</h1>
        </div>
        <div className="cronograma-actions">
          <button
            className="action-button"
            onClick={() => setShowFeriadosDialog(true)}
            title="Gerenciar Feriados"
          >
            <Calendar size={20} />
          </button>
          <button
            className="action-button"
            onClick={() => window.print()}
            title="Imprimir"
          >
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <select
          className="filter-dropdown"
          value={selectedTurmaId || ''}
          onChange={(e) => setSelectedTurmaId(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">Todas as Turmas</option>
          {turmas.map(turma => (
            <option key={turma.idturma} value={turma.idturma}>
              {turma.cursos?.nomecurso} - {turma.turma}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar Container */}
      <div className="calendar-container">
        {/* Calendar Navigation */}
        <div className="calendar-navigation">
          <button
            className="nav-button"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          >
            ‹
          </button>
          <h2 className="month-title">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            className="nav-button"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          >
            ›
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {/* Day Headers */}
          {dayNames.map(day => (
            <div key={day} className={`day-header ${day === 'domingo' || day === 'sábado' ? 'weekend' : ''}`}>
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {getDaysInMonth(currentDate).map((date, index) => {
            if (!date) {
              return <div key={index} style={{ background: '#f5f5f5' }}></div>;
            }

            const isSelected = selectedDay &&
              date.getTime() === selectedDay.getTime();
            const isMultiSelected = selectedDays.has(date.getTime());
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isFeriadoDay = isFeriado(date);
            const isDomingoDay = isDomingo(date);
            const eventsForDay = getEventsForDay(date);

            return (
              <div
                key={date.getTime()}
                className={`calendar-day ${isSelected ? 'selected' : ''} ${isMultiSelected ? 'multi-selected' : ''} ${isWeekend ? 'weekend' : ''} ${isFeriadoDay ? 'feriado' : ''}`}
                onClick={(e) => handleDayClick(date, e.ctrlKey)}
              >
                <div className="day-number">{date.getDate()}</div>
                {eventsForDay.length > 0 && (
                  <div className="event-indicators">
                    {eventsForDay.map((event, idx) => (
                      <div key={idx} className="event-dot"></div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Day Info */}
        {(selectedDay || selectedDays.size > 0) && (
          <div className="selected-info">
            {selectedDay && (
              <p>
                {new Intl.DateTimeFormat('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }).format(selectedDay)}
              </p>
            )}
            {selectedDays.size > 0 && (
              <p>{selectedDays.size} dia(s) selecionado(s)</p>
            )}

            {/* Display events for selected day */}
            {selectedDay && getEventsForDay(selectedDay).length > 0 && (
              <div className="day-events">
                <h4>Aulas agendadas:</h4>
                {getEventsForDay(selectedDay).map((aula, idx) => (
                  <div key={idx} className="event-item">
                    <div className="event-info">
                      <strong>{aula.unidades_curriculares?.nomeuc}</strong>
                      <br />
                      Horário: {aula.horario} | {aula.horas}h | {aula.status}
                      <br />
                      Turma: {aula.turma?.turma}
                    </div>
                    <div className="event-actions">
                      <button
                        onClick={() => handleEditAula(aula)}
                        style={{
                          background: '#20b2aa',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '10px',
                          marginRight: '4px'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteAula(aula)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {getEventsForDay(selectedDay).length === 0 && selectedDay && (
              <p>Nenhuma aula agendada</p>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => setShowAdicionarAulaDialog(true)}
        disabled={selectedDays.size === 0 && !selectedDay}
        title="Agendar Aulas"
      >
        <Plus size={24} />
      </button>

      {/* Dialogs */}
      {showFeriadosDialog && (
        <FeriadosDialog
          feriadosNacionais={feriadosNacionais}
          feriadosMunicipais={feriadosMunicipais}
          onClose={() => setShowFeriadosDialog(false)}
          onFeriadoAdded={loadFeriadosMunicipais}
        />
      )}

      {showAdicionarAulaDialog && (
        <AdicionarAulaDialog
          selectedDays={selectedDays.size > 0 ? selectedDays : new Set([selectedDay])}
          onClose={() => setShowAdicionarAulaDialog(false)}
          onAulaAdded={handleAdicionarAula}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="dialog-overlay" onClick={() => setShowDeleteDialog(false)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Confirmar Exclusão</h2>
            </div>
            <div className="dialog-body">
              <p>Tem certeza que deseja apagar essa aula?</p>
              <p><strong>{aulaToDelete?.unidades_curriculares?.nomeuc}</strong></p>
              <p>Horário: {aulaToDelete?.horario}</p>
              <p>Horas: {aulaToDelete?.horas}h</p>
            </div>
            <div className="dialog-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={confirmDeleteAula}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Aula Dialog */}
      {showEditDialog && aulaToEdit && (
        <div className="dialog-overlay" onClick={() => setShowEditDialog(false)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Editar Aula</h2>
            </div>
            <div className="dialog-body">
              <EditAulaForm
                aula={aulaToEdit}
                onSubmit={handleEditSubmit}
                onCancel={() => setShowEditDialog(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditAulaForm = ({ aula, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    horario: aula.horario || '',
    horas: aula.horas || 1,
    status: aula.status || 'Agendada'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Horário:</label>
        <select
          value={formData.horario}
          onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
          className="form-select"
        >
          <option value="08:00-12:00">Matutino (08:00-12:00)</option>
          <option value="14:00-18:00">Vespertino (14:00-18:00)</option>
          <option value="19:00-22:00">Noturno (19:00-22:00)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Horas:</label>
        <input
          type="number"
          min="1"
          max="8"
          value={formData.horas}
          onChange={(e) => setFormData({ ...formData, horas: parseInt(e.target.value) })}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Status:</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="form-select"
        >
          <option value="Agendada">Agendada</option>
          <option value="Realizada">Realizada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>

      <div className="dialog-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Salvar
        </button>
      </div>
    </form>
  );
};

export default CronogramaPage;