'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-card auth-card">
        <h1>Join <span className="text-gradient">QuestGuard</span></h1>
        <p className="subtitle">Create your account to start</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
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
          <div className="form-group">
            <label>I am a...</label>
            <div className="radio-group">
              <label className={`radio-label ${formData.role === 'STUDENT' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={formData.role === 'STUDENT'}
                  onChange={() => setFormData({ ...formData, role: 'STUDENT' })}
                />
                Student
              </label>
              <label className={`radio-label ${formData.role === 'LECTURER' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="LECTURER"
                  checked={formData.role === 'LECTURER'}
                  onChange={() => setFormData({ ...formData, role: 'LECTURER' })}
                />
                Lecturer
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="footer-text">
          Already have an account? <Link href="/login">Login</Link>
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
          max-width: 450px;
          text-align: center;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .text-gradient {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
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
        input[type="text"],
        input[type="email"],
        input[type="password"] {
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
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
        .radio-group {
          display: flex;
          gap: 1rem;
        }
        .radio-label {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          text-align: center;
          position: relative;
        }
        .radio-label input {
          position: absolute;
          opacity: 0;
        }
        .radio-label.active {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
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
