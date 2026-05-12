import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../utils/api';

export default function RegisterPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register(form.name, form.email, form.password);
      login(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
      background: 'radial-gradient(ellipse at 20% 20%, rgba(0, 212, 180, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(157, 95, 255, 0.2) 0%, transparent 50%), var(--violet-950)',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-6">
          <div className="app-logo" style={{ justifyContent: 'center', fontSize: '2rem', marginBottom: 'var(--space-2)' }}>
            <span className="strawberry">🍓</span>
            <span>Nutrly</span>
          </div>
          <p className="text-muted">Creá tu cuenta</p>
        </div>

        <div className="card" style={{ background: 'rgba(26, 16, 53, 0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(157, 95, 255, 0.25)' }}>
          <h2 className="section-title" style={{ marginBottom: 'var(--space-5)' }}>Registro</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="label">Nombre</label>
              <input className="input" type="text" placeholder="Tu nombre" value={form.name} onChange={set('name')} required />
            </div>
            <div className="input-group">
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="tu@email.com" value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="input-group">
              <label className="label">Contraseña</label>
              <input className="input" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set('password')} required autoComplete="new-password" />
            </div>
            <div className="input-group">
              <label className="label">Confirmar contraseña</label>
              <input className="input" type="password" placeholder="Repetí tu contraseña" value={form.confirm} onChange={set('confirm')} required />
            </div>

            <button type="submit" className="btn btn-accent btn-full" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creando cuenta...</> : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-muted text-center mt-4">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Ingresá</Link>
          </p>
        </div>

        <div className="privacy-note mt-4">
          <span>🔒</span>
          <span>Solo podés registrarte con un email habilitado. Si no tenés acceso, contactá a la administradora.</span>
        </div>
      </div>
    </div>
  );
}
