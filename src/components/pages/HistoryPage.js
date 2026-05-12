import React, { useState, useEffect, useCallback } from 'react';
import { logsApi, aiApi } from '../../utils/api';
import { today, prevWeek, nextWeek, getWeekRange, prevMonth, nextMonth, getMonthRange, formatDateShort, currentMonth, formatMonth, isFuture } from '../../utils/dates';

const MEALS = [
  { key: 'breakfast',      label: 'Desayuno',        emoji: '☀️' },
  { key: 'morningSnack',   label: 'Colación',        emoji: '🍎' },
  { key: 'lunch',          label: 'Almuerzo',         emoji: '🥗' },
  { key: 'afternoonSnack', label: 'Merienda',         emoji: '🫖' },
  { key: 'dinner',         label: 'Cena',             emoji: '🌙' },
  { key: 'dessert',        label: 'Postre',           emoji: '🍓' },
];

const MOOD_EMOJI = { excelente: '😄', bien: '😊', regular: '😐', mal: '😔' };

export default function HistoryPage() {
  const [mode, setMode] = useState('weekly'); // 'weekly' | 'monthly'
  const [weekRef, setWeekRef] = useState(today());
  const [monthRef, setMonthRef] = useState(currentMonth());

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const weekRange = getWeekRange(weekRef);
  const monthRange = getMonthRange(monthRef);
  const range = mode === 'weekly' ? weekRange : monthRange;

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await logsApi.getRange(range.from, range.to);
      setLogs(data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  useEffect(() => { loadLogs(); setSummary(null); }, [loadLogs]);

  const handleGetSummary = async () => {
    setLoadingSummary(true);
    try {
      const data = await aiApi.getSummary(mode, range.from, range.to);
      setSummary(data);
    } catch (err) {
      setSummary({ summary: 'Error al generar el resumen: ' + err.message });
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Historial</h1>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        <button
          className={`btn btn-sm ${mode === 'weekly' ? 'btn-accent' : 'btn-outline'}`}
          onClick={() => setMode('weekly')}
        >Semana</button>
        <button
          className={`btn btn-sm ${mode === 'monthly' ? 'btn-accent' : 'btn-outline'}`}
          onClick={() => setMode('monthly')}
        >Mes</button>
      </div>

      {/* Period nav */}
      <div className="date-nav mb-4">
        <button onClick={() => mode === 'weekly' ? setWeekRef(prevWeek(weekRef)) : setMonthRef(prevMonth(monthRef))}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="date-nav-label">
          {mode === 'weekly'
            ? `${weekRange.label}`
            : <span style={{ textTransform: 'capitalize' }}>{formatMonth(monthRef)}</span>
          }
        </span>
        <button
          onClick={() => mode === 'weekly' ? setWeekRef(nextWeek(weekRef)) : setMonthRef(nextMonth(monthRef))}
          disabled={isFuture(range.to)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* AI Summary button */}
      <button
        className="btn btn-accent btn-full mb-4"
        onClick={handleGetSummary}
        disabled={loadingSummary || logs.length === 0}
      >
        {loadingSummary ? (
          <><span className="spinner" style={{ width: 16, height: 16 }} /> Generando resumen con IA...</>
        ) : (
          `✨ Generar resumen ${mode === 'weekly' ? 'semanal' : 'mensual'} con IA`
        )}
      </button>

      {/* AI Summary box */}
      {summary && (
        <div className="mb-6">
          <div className="ai-box-header">
            <span>✨</span>
            <span>Resumen {mode === 'weekly' ? 'semanal' : 'mensual'} generado por IA</span>
            {summary.fromCache && <span className="badge badge-violet" style={{ marginLeft: 'auto' }}>Caché</span>}
          </div>
          <div className="ai-box">{summary.summary}</div>
        </div>
      )}

      {/* Log list */}
      {loading ? (
        <div className="loading-screen" style={{ minHeight: '30vh' }}><div className="spinner" /></div>
      ) : logs.length === 0 ? (
        <div className="card text-center" style={{ color: 'var(--neutral-400)', padding: 'var(--space-10)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>📭</div>
          <p>No hay registros en este período</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {logs.map(log => (
            <div key={log._id} className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="section-title" style={{ marginBottom: 0, fontSize: '0.95rem', textTransform: 'capitalize' }}>
                  📅 {formatDateShort(log.date)}
                </span>
                {log.mood && <span>{MOOD_EMOJI[log.mood]} {log.mood}</span>}
              </div>
              <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                {MEALS.map(m => log[m.key] ? (
                  <div key={m.key} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'baseline', fontSize: '0.85rem' }}>
                    <span>{m.emoji}</span>
                    <span style={{ color: 'var(--color-text-muted)', minWidth: 80 }}>{m.label}:</span>
                    <span>{log[m.key]}</span>
                  </div>
                ) : null)}
              </div>
              {log.notes && (
                <p className="text-muted mt-2" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                  💬 {log.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
