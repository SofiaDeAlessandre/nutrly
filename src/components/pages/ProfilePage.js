import React, { useState, useEffect } from 'react';
import { profileApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const DIGESTIVE_CONDITIONS = [
  'Colon irritable (SII)',
  'Enfermedad de Crohn',
  'Colitis ulcerosa',
  'Reflujo gastroesofágico (ERGE)',
  'Gastritis',
  'Úlcera péptica',
  'Celiaquía',
  'SIBO (sobrecrecimiento bacteriano)',
  'Dispepsia funcional',
  'Constipación crónica',
  'Diarrea crónica',
  'Otra condición digestiva',
];

const COMMON_INTOLERANCES = [
  'Lactosa',
  'Gluten',
  'Fructosa',
  'Sorbitol',
  'Histamina',
  'Huevo',
  'Mariscos',
  'Frutos secos',
  'Soja',
  'Maíz',
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    digestiveConditions: [],
    intolerances: [],
    customIntolerance: '',
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await profileApi.get();
        setProfile(data);
        setForm({
          name: data.name || '',
          digestiveConditions: data.digestiveConditions || [],
          intolerances: data.intolerances || [],
          customIntolerance: '',
          notes: data.digestiveNotes || '',
        });
      } catch {
        // fallback
        setForm(f => ({ ...f, name: user?.name || '' }));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const toggleCondition = (cond) => {
    setForm(f => ({
      ...f,
      digestiveConditions: f.digestiveConditions.includes(cond)
        ? f.digestiveConditions.filter(c => c !== cond)
        : [...f.digestiveConditions, cond],
    }));
    setSaved(false);
  };

  const toggleIntolerance = (item) => {
    setForm(f => ({
      ...f,
      intolerances: f.intolerances.includes(item)
        ? f.intolerances.filter(i => i !== item)
        : [...f.intolerances, item],
    }));
    setSaved(false);
  };

  const addCustomIntolerance = () => {
    const val = form.customIntolerance.trim();
    if (!val || form.intolerances.includes(val)) return;
    setForm(f => ({ ...f, intolerances: [...f.intolerances, val], customIntolerance: '' }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await profileApi.update({
        name: form.name,
        digestiveConditions: form.digestiveConditions,
        intolerances: form.intolerances,
        notes: form.notes,
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Mi perfil</h1>

      {/* Datos personales */}
      <div className="card mb-4">
        <h2 className="section-title">👤 Datos personales</h2>
        <div className="input-group">
          <label className="label">Nombre</label>
          <input
            className="input"
            type="text"
            value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setSaved(false); }}
          />
        </div>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="label">Email</label>
          <input className="input" type="email" value={user?.email || ''} disabled
            style={{ background: 'var(--neutral-100)', color: 'var(--neutral-400)' }} />
        </div>
      </div>

      {/* Salud digestiva */}
      <div className="card mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>🫁 Salud digestiva</h2>
          <span className="badge badge-violet">Privado</span>
        </div>
        <p className="text-muted mb-4" style={{ fontSize: '0.82rem' }}>
          Esta información es completamente privada y se usa para que la IA pueda darte sugerencias más personalizadas y considere tus condiciones al hacer recomendaciones.
        </p>

        <label className="label">Condiciones digestivas</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
          {DIGESTIVE_CONDITIONS.map(cond => (
            <button
              key={cond}
              className={`btn btn-sm ${form.digestiveConditions.includes(cond) ? 'btn-accent' : 'btn-outline'}`}
              onClick={() => toggleCondition(cond)}
            >
              {cond}
            </button>
          ))}
        </div>

        <label className="label">Intolerancias alimentarias</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          {COMMON_INTOLERANCES.map(item => (
            <button
              key={item}
              className={`btn btn-sm ${form.intolerances.includes(item) ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => toggleIntolerance(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Intolerancia personalizada */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <input
            className="input"
            type="text"
            placeholder="Otra intolerancia..."
            value={form.customIntolerance}
            onChange={e => setForm(f => ({ ...f, customIntolerance: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addCustomIntolerance()}
          />
          <button className="btn btn-outline btn-sm" onClick={addCustomIntolerance}>+ Agregar</button>
        </div>

        {/* Custom intolerances added */}
        {form.intolerances.filter(i => !COMMON_INTOLERANCES.includes(i)).map(i => (
          <span key={i} className="badge badge-berry" style={{ marginRight: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            {i}
            <button onClick={() => toggleIntolerance(i)} style={{ marginLeft: 4, fontWeight: 700 }}>×</button>
          </span>
        ))}

        <div className="input-group" style={{ marginBottom: 0, marginTop: 'var(--space-3)' }}>
          <label className="label">Notas adicionales de salud</label>
          <textarea
            className="input"
            rows="3"
            placeholder="Ej: Tomo omeprazol, tengo gastritis desde 2022, evito alimentos muy picantes..."
            value={form.notes}
            onChange={e => { setForm(f => ({ ...f, notes: e.target.value })); setSaved(false); }}
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Privacy notice */}
      <div className="privacy-note mb-4">
        <span>🔒</span>
        <div>
          <strong style={{ display: 'block', marginBottom: 2 }}>Tus datos de salud son privados</strong>
          Nunca se comparten con terceros. Solo se usan para personalizar tus resúmenes de IA dentro de la app.
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button className="btn btn-accent btn-full mb-6" onClick={handleSave} disabled={saving}>
        {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Guardando...</> :
         saved   ? '✅ ¡Perfil guardado!' : '💾 Guardar cambios'}
      </button>

      {/* Cerrar sesión */}
      <button
        className="btn btn-outline btn-full"
        onClick={logout}
        style={{ color: '#dc2626', borderColor: '#fecaca' }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
