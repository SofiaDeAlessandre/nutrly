import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../utils/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
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
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="app-logo" style={{ justifyContent: 'center', fontSize: '2rem', marginBottom: 'var(--space-2)' }}>
            <span className="strawberry">🍓</span>
            <span>Nutrly</span>
          </div>
          <p className="text-muted">Tu diario nutricional inteligente</p>
        </div>

        <div className="card" style={{ background: 'rgba(26, 16, 53, 0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(157, 95, 255, 0.25)' }}>
          <h2 className="section-title" style={{ marginBottom: 'var(--space-5)' }}>Iniciar sesión</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label className="label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-accent btn-full"
              disabled={loading}
              style={{ marginTop: 'var(--space-2)' }}
            >
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Ingresando...</> : 'Ingresar'}
            </button>
          </form>

          <p className="text-muted text-center mt-4">
            ¿No tenés cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
              Registrate
            </Link>
          </p>
        </div>

        <div className="privacy-note mt-4">
          <span>🔒</span>
          <span>Tus datos de salud son privados y nunca se comparten con terceros.</span>
        </div>
      </div>
    </div>
  );
}
