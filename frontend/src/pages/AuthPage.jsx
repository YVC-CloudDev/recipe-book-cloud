import React from 'react';
import { ChefHat } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api.js';

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = isRegister ? await registerUser(form) : await loginUser(form);
      sessionStorage.setItem('recipeBookUser', JSON.stringify(user));
      navigate('/dashboard');
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="brand-mark" aria-hidden="true">
          <ChefHat size={34} />
        </div>
        <h1 id="auth-title">Recipe Book</h1>
        <p className="auth-subtitle">
          {isRegister ? 'Create your personal recipe space' : 'Welcome back to your kitchen'}
        </p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              name="username"
              value={form.username}
              onChange={updateField}
              autoComplete="username"
              placeholder="Lana123"
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="At least 8 characters"
            />
          </label>

          {error && <p className="error-message">{error}</p>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="auth-actions">
  {isRegister ? (
    <p>
      Already have an account? <Link to="/login">Login</Link>
    </p>
  ) : (
    <p>
      Don&apos;t have an account? <Link to="/register">Register</Link>
    </p>
  )}
</div>
      </section>
    </main>
  );
}
