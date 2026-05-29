'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/NotificationContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Đăng nhập thành công!', 'success');
        if (data.user.role === 'LECTURER') {
          router.push('/dashboard/lecturer/quizzes');
        } else {
          router.push('/dashboard/student');
        }
      } else {
        showToast(data.error || 'Đăng nhập thất bại', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container glass-container animate-fade-in">
      <div className="login-card glass-card">
        <h1>Chào mừng trở lại</h1>
        <p className="subtitle">Đăng nhập vào tài khoản QuestGuard của bạn</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>E-mail</label>
            <input 
              type="email" 
              placeholder="ten@vidu.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="footer-text">
          Bạn chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link>
        </p>
      </div>

      <style jsx>{`
        .login-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .login-card {
          width: 100%;
          max-width: 450px;
          padding: 3rem;
        }
        h1 { margin-bottom: 0.5rem; text-align: center; }
        .subtitle { text-align: center; margin-bottom: 2.5rem; color: var(--text-muted); }
        .form-group { margin-bottom: 1.5rem; }
        label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted); }
        input {
          width: 100%;
          padding: 0.9rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
        }
        .btn-full { width: 100%; margin-top: 1rem; padding: 1rem; }
        .footer-text { text-align: center; margin-top: 2rem; font-size: 0.9rem; color: var(--text-muted); }
        .footer-text a { color: var(--primary); font-weight: 600; text-decoration: none; }
      `}</style>
    </div>
  );
}
