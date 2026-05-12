import React, { useState, useEffect, useCallback } from 'react';
import { plansApi } from '../../utils/api';
import { currentMonth, prevMonth, nextMonth, formatMonth } from '../../utils/dates';

const MEALS = [
  { key: 'breakfast',      label: 'Desayuno',         emoji: '☀️', cls: 'breakfast' },
  { key: 'morningSnack',   label: 'Colación mañana',  emoji: '🍎', cls: 'morning-snack' },
  { key: 'lunch',          label: 'Almuerzo',          emoji: '🥗', cls: 'lunch' },
  { key: 'afternoonSnack', label: 'Merienda',          emoji: '🫖', cls: 'afternoon-snack' },
  { key: 'dinner',         label: 'Cena',              emoji: '🌙', cls: 'dinner' },
  { key: 'dessert',        label: 'Postre',            emoji: '🍓', cls: 'dessert' },
];

// Helpers para manejar opciones como array
function optionsToText(arr) {
  return (arr || []).join('\n');
}

function textToOptions(text) {
  return text.split('\n').map(s => s.trim()).filter(Boolean);
}

export default function PlanPage() {
  const [month, setMonth] = useState(currentMonth());
  const [plan, setPlan] = useState({});
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    try {
      const data = await plansApi.getMonth(month);
      const p = Array.isArray(data) && data.length > 0 ? data[0] : {};
      setPlan(p);
      const initial = {};
      MEALS.forEach(m => { initial[m.key] = optionsToText(p[m.key]); });
      setEditing(initial);
    } catch {
      setPlan({});
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { loadPlan(); setSaved(false); }, [loadPlan]);

  const handleChange = (mealKey, value) => {
    setEditing(prev => ({ ...prev, [mealKey]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { month };
      MEALS.forEach(m => { payload[m.key] = textToOptions(editing[m.key] || ''); });
      await plansApi.save(payload);
      setSaved(true);
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Mi plan</h1>
      <p className="text-muted mb-4">
        Cargá las opciones de tu plan mensual. Cada línea es una opción diferente que vas a poder elegir al registrar tus comidas.
      </p>

      {/* Month nav */}
      <div className="date-nav mb-4">
        <button onClick={() => setMonth(prevMonth(month))}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="date-nav-label" style={{ textTransform: 'capitalize' }}>
          📅 {formatMonth(month)}
        </span>
        <button onClick={() => setMonth(nextMonth(month))}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {MEALS.map(meal => (
              <div key={meal.key} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`meal-icon ${meal.cls}`} style={{ width: 40, height: 40, fontSize: '1.2rem' }}>
                    {meal.emoji}
                  </div>
                  <h3 className="section-title" style={{ marginBottom: 0 }}>{meal.label}</h3>
                  {(editing[meal.key] || '').trim() && (
                    <span className="badge badge-mint" style={{ marginLeft: 'auto' }}>
                      {textToOptions(editing[meal.key]).length} opción{textToOptions(editing[meal.key]).length !== 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
                <textarea
                  className="input"
                  rows="4"
                  placeholder={`Ej:\nAvena con frutas\nTostadas con palta\nYogur con granola`}
                  value={editing[meal.key] || ''}
                  onChange={e => handleChange(meal.key, e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}
                />
                <p className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                  Una opción por línea
                </p>
              </div>
            ))}
          </div>

          <button className="btn btn-accent btn-full mt-6" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Guardando...</> :
             saved   ? '✅ ¡Plan guardado!' : '💾 Guardar plan del mes'}
          </button>

          <div className="privacy-note mt-4">
            <span>🔒</span>
            <span>Tu plan es privado. Solo vos podés verlo y editarlo.</span>
          </div>
        </>
      )}
    </div>
  );
}
