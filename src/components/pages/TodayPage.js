import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { logsApi, plansApi } from '../../utils/api';
import { today, formatDate, prevDay, nextDay, isFuture, isToday, currentMonth } from '../../utils/dates';

const MEALS = [
  { key: 'breakfast',     label: 'Desayuno',         emoji: '☀️', cls: 'breakfast' },
  { key: 'morningSnack',  label: 'Colación mañana',  emoji: '🍎', cls: 'morning-snack' },
  { key: 'lunch',         label: 'Almuerzo',          emoji: '🥗', cls: 'lunch' },
  { key: 'afternoonSnack',label: 'Merienda',          emoji: '🫖', cls: 'afternoon-snack' },
  { key: 'dinner',        label: 'Cena',              emoji: '🌙', cls: 'dinner' },
  { key: 'dessert',       label: 'Postre',            emoji: '🍓', cls: 'dessert' },
];

const MOODS = [
  { value: 'excelente', label: '😄 Excelente' },
  { value: 'bien',      label: '😊 Bien' },
  { value: 'regular',   label: '😐 Regular' },
  { value: 'mal',       label: '😔 Mal' },
];

export default function TodayPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(today());
  const [log, setLog] = useState({});
  const [plan, setPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [logData, planData] = await Promise.all([
        logsApi.getDate(date),
        plansApi.getMonth(currentMonth()),
      ]);
      setLog(Array.isArray(logData) && logData.length > 0 ? logData[0] : {});
      setPlan(Array.isArray(planData) && planData.length > 0 ? planData[0] : null);
    } catch {
      setLog({});
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { loadData(); setSaved(false); }, [loadData]);

  const handleChange = (field, value) => {
    setLog(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await logsApi.save({ ...log, date });
      setSaved(true);
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getPlanOptions = (mealKey) => {
    if (!plan) return [];
    return plan[mealKey] || [];
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h1 className="page-title">
          Hola, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted">Registrá tus comidas de hoy</p>
      </div>

      {/* Date nav */}
      <div className="date-nav">
        <button onClick={() => setDate(prevDay(date))} aria-label="Día anterior">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <div className="date-nav-label" style={{ textTransform: 'capitalize' }}>
            {isToday(date) ? '📅 Hoy' : formatDate(date)}
          </div>
          {!isToday(date) && (
            <button className="text-muted" style={{ fontSize: '0.75rem', marginTop: 2 }} onClick={() => setDate(today())}>
              Volver a hoy
            </button>
          )}
        </div>
        <button onClick={() => setDate(nextDay(date))} disabled={isFuture(nextDay(date))} aria-label="Día siguiente">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: '40vh' }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Meals */}
          <div className="card mb-4">
            <h2 className="section-title">🍽️ Comidas del día</h2>
            <div className="meal-grid">
              {MEALS.map(meal => {
                const options = getPlanOptions(meal.key);
                return (
                  <div key={meal.key} className="meal-slot">
                    <div className={`meal-icon ${meal.cls}`}>{meal.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <label className="label" style={{ marginBottom: 2 }}>{meal.label}</label>
                      {options.length > 0 ? (
                        <select
                          className="input select-input"
                          value={log[meal.key] || ''}
                          onChange={e => handleChange(meal.key, e.target.value)}
                        >
                          <option value="">— Elegir opción —</option>
                          {options.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                          <option value="__otro__">Otro (escribir abajo)</option>
                        </select>
                      ) : (
                        <input
                          className="input"
                          type="text"
                          placeholder={`¿Qué comiste? (${meal.label.toLowerCase()})`}
                          value={log[meal.key] || ''}
                          onChange={e => handleChange(meal.key, e.target.value)}
                        />
                      )}
                      {log[meal.key] === '__otro__' && (
                        <input
                          className="input"
                          type="text"
                          placeholder="Escribí qué comiste..."
                          style={{ marginTop: 'var(--space-2)' }}
                          onChange={e => handleChange(meal.key, e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mood + Notes */}
          <div className="card mb-4">
            <h2 className="section-title">✨ Estado de ánimo y notas</h2>
            <div className="input-group">
              <label className="label">¿Cómo te sentiste hoy?</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    className={`btn btn-sm ${log.mood === m.value ? 'btn-accent' : 'btn-outline'}`}
                    onClick={() => handleChange('mood', log.mood === m.value ? null : m.value)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="label">Notas libres</label>
              <textarea
                className="input"
                rows="3"
                placeholder="Algo que quieras recordar de este día..."
                value={log.notes || ''}
                onChange={e => handleChange('notes', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Save button */}
          <button
            className="btn btn-primary btn-full"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <><span className="spinner" style={{ width: 16, height: 16 }} /> Guardando...</>
            ) : saved ? (
              '✅ ¡Guardado!'
            ) : (
              '💾 Guardar registro'
            )}
          </button>

          {!plan && (
            <div className="alert alert-info mt-4">
              💡 Cargá tu plan mensual en <strong>Mi plan</strong> para ver opciones de comidas acá.
            </div>
          )}
        </>
      )}
    </div>
  );
}
