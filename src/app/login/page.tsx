'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect based on role
      if (data.user.role === 'LECTURER') {
        router.push('/dashboard/lecturer');
      } else {
        router.push('/dashboard/student');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-card auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your <span className="text-secondary">QuestGuard</span> account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="example@univ.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="footer-text">
          Don't have an account? <Link href="/register">Register</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        h1 {
          font-size: 2.2rem;
          margin-bottom: 0.5rem;
        }
        .text-secondary {
          color: var(--secondary);
        }
        .subtitle {
          color: var(--text-muted);
          margin-bottom: 2rem;
        }
        .form-group {
          text-align: left;
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-muted);
        }
        input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text);
          outline: none;
          transition: var(--transition);
        }
        input:focus {
          border-color: var(--primary);
        }
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }
        .w-full {
          width: 100%;
        }
        .footer-text {
          margin-top: 1.5rem;
          color: var(--text-muted);
        }
        .footer-text a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
