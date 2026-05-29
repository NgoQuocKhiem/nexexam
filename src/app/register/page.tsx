'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/NotificationContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Đăng ký thành công! Đang chuyển hướng...', 'success');
        setTimeout(() => {
          if (data.user.role === 'LECTURER') {
            router.push('/dashboard/lecturer/quizzes');
          } else {
            router.push('/dashboard/student');
          }
        }, 1500);
      } else {
        showToast(data.error || 'Đăng ký thất bại', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container glass-container animate-fade-in">
      <div className="register-card glass-card">
        <h1>Hãy gia nhập QuestGuard</h1>
        <p className="subtitle">Tạo tài khoản của bạn để bắt đầu</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên</label>
            <input 
              type="text" 
              placeholder="Nguyễn Văn A" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input 
              type="email" 
              placeholder="ten@vidu.com" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Tôi là...</label>
            <select 
              className="select-input"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="STUDENT">Học sinh</option>
              <option value="LECTURER">Giảng viên</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Đăng ký'}
          </button>
        </form>

        <p className="footer-text">
          Bạn đã có tài khoản? <Link href="/login">Đăng nhập</Link>
        </p>
      </div>

      <style jsx>{`
        .register-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }
        .register-card {
          width: 100%;
          max-width: 450px;
          padding: 3rem;
        }
        h1 { margin-bottom: 0.5rem; text-align: center; font-size: 1.8rem; }
        .subtitle { text-align: center; margin-bottom: 2.5rem; color: var(--text-muted); }
        .form-group { margin-bottom: 1.25rem; }
        label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted); }
        input, .select-input {
          width: 100%;
          padding: 0.8rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
        }
        .select-input option { background: #111; }
        .btn-full { width: 100%; margin-top: 1rem; padding: 1rem; }
        .footer-text { text-align: center; margin-top: 2rem; font-size: 0.9rem; color: var(--text-muted); }
        .footer-text a { color: var(--primary); font-weight: 600; text-decoration: none; }
      `}</style>
    </div>
  );
}
