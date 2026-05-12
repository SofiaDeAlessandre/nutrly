import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { weightApi } from '../../utils/api';
import { today, formatDateShort } from '../../utils/dates';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      fontSize: '0.85rem',
    }}>
      <strong>{payload[0]?.payload?.dateLabel}</strong><br />
      {payload[0]?.value} kg
    </div>
  );
};

export default function WeightPage() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ date: today(), weight: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await weightApi.getAll();
      setLogs(data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const chartData = logs.map(l => ({
    dateLabel: formatDateShort(l.date),
    peso: l.weight,
    date: l.date,
  }));

  const lastLog = logs[logs.length - 1];
  const firstLog = logs[0];
  const diff = logs.length >= 2
    ? (lastLog.weight - firstLog.weight).toFixed(1)
    : null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.weight || isNaN(parseFloat(form.weight))) {
      setError('Ingresá un peso válido');
      return;
    }
    setSaving(true);
    try {
      await weightApi.add({ date: form.date, weight: parseFloat(form.weight), note: form.note });
      setSuccess(true);
      setForm(f => ({ ...f, weight: '', note: '' }));
      await loadLogs();
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminás este registro?')) return;
    try {
      await weightApi.remove(id);
      await loadLogs();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">Evolución de peso</h1>
      <p className="text-muted mb-6">Registrá tu peso cada 3 semanas o 1 mes para seguir tu progreso.</p>

      {/* Resumen rápido */}
      {logs.length >= 2 && (
        <div className="card card-accent mb-6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', textAlign: 'center' }}>
            <div>
              <p className="label">Inicial</p>
              <p className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{firstLog.weight} kg</p>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>{formatDateShort(firstLog.date)}</p>
            </div>
            <div>
              <p className="label">Variación</p>
              <p className="font-display" style={{
                fontSize: '1.4rem', fontWeight: 700,
                color: parseFloat(diff) < 0 ? 'var(--mint-600)' : parseFloat(diff) > 0 ? '#dc2626' : 'var(--neutral-600)'
              }}>
                {parseFloat(diff) > 0 ? '+' : ''}{diff} kg
              </p>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>total</p>
            </div>
            <div>
              <p className="label">Actual</p>
              <p className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{lastLog.weight} kg</p>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>{formatDateShort(lastLog.date)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico */}
      {logs.length >= 2 && (
        <div className="card mb-6">
          <h2 className="section-title">📈 Evolución</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: 'var(--neutral-400)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--neutral-400)' }} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="var(--color-accent)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--color-accent)', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Formulario de carga */}
      <div className="card mb-6">
        <h2 className="section-title">➕ Registrar peso</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">✅ ¡Peso registrado correctamente!</div>}
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="label">Fecha</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                max={today()}
                required
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="label">Peso (kg)</label>
              <input
                className="input"
                type="number"
                step="0.1"
                min="20"
                max="300"
                placeholder="Ej: 65.5"
                value={form.weight}
                onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="input-group mt-3" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="label">Nota (opcional)</label>
            <input
              className="input"
              type="text"
              placeholder="Ej: después de vacaciones"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
            {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Guardando...</> : '💾 Guardar peso'}
          </button>
        </form>
      </div>

      {/* Historial de registros */}
      {loading ? (
        <div className="loading-screen" style={{ minHeight: '20vh' }}><div className="spinner" /></div>
      ) : logs.length === 0 ? (
        <div className="card text-center" style={{ color: 'var(--neutral-400)', padding: 'var(--space-8)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>⚖️</div>
          <p>Todavía no tenés registros de peso</p>
        </div>
      ) : (
        <div className="card">
          <h2 className="section-title">Historial</h2>
          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {[...logs].reverse().map(log => (
              <div key={log._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-3) 0',
                borderBottom: '1px solid var(--color-border)',
              }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>{log.weight} kg</span>
                  <span className="text-muted" style={{ marginLeft: 'var(--space-3)', fontSize: '0.82rem' }}>
                    {formatDateShort(log.date)}
                  </span>
                  {log.note && <span className="text-muted" style={{ marginLeft: 'var(--space-2)', fontSize: '0.78rem', fontStyle: 'italic' }}>— {log.note}</span>}
                </div>
                <button
                  onClick={() => handleDelete(log._id)}
                  style={{ color: 'var(--neutral-400)', fontSize: '0.8rem', padding: 'var(--space-1) var(--space-2)' }}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="privacy-note mt-4">
        <span>🔒</span>
        <span>Tu historial de peso es privado y nunca se comparte con terceros.</span>
      </div>
    </div>
  );
}
