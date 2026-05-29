'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  createdAt: string;
  _count: {
    submissions: number;
  };
}

export default function LecturerQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (error) {
      console.error('Fetch quizzes error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài thi "${title}"? Thao tác này sẽ xóa toàn bộ câu hỏi và kết quả thi của sinh viên.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Xóa bài thi thành công');
        fetchQuizzes();
      } else {
        alert('Lỗi khi xóa bài thi');
      }
    } catch (error) {
      alert('Lỗi kết nối');
    }
  };

  return (
    <div className="quizzes-container animate-fade-in">
      <header className="page-header flex-between">
        <div>
          <h1>Bài kiểm tra của tôi</h1>
          <p className="subtitle">Quản lý và tạo nội dung bài kiểm tra</p>
        </div>
        <Link href="/dashboard/lecturer/quizzes/create" className="btn btn-primary">
          + Tạo bài kiểm tra mới
        </Link>
      </header>

      {loading ? (
        <div className="loading-state">Đang tải dữ liệu...</div>
      ) : quizzes.length === 0 ? (
        <div className="empty-state glass-card">
          <p>Bạn chưa có bài kiểm tra nào.</p>
          <Link href="/dashboard/lecturer/quizzes/create" className="btn btn-secondary">Tạo ngay bài đầu tiên</Link>
        </div>
      ) : (
        <div className="quizzes-grid">
          {quizzes.map((quiz) => {
            const examUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/exam/${quiz.id}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(examUrl)}`;

            return (
              <div key={quiz.id} className="quiz-card glass-card">
                <div className="card-top flex-between">
                  <div className="status-badge active">Đang mở</div>
                  <button className="delete-btn" title="Xóa bài thi" onClick={() => handleDelete(quiz.id, quiz.title)}>🗑️</button>
                </div>
                
                <div className="quiz-main-content">
                  <div className="quiz-info">
                    <h3>{quiz.title}</h3>
                    <div className="quiz-meta">
                      <p>📅 {new Date(quiz.createdAt).toLocaleDateString()}</p>
                      <p>👥 {quiz._count.submissions} lượt nộp bài</p>
                    </div>
                  </div>
                  
                  <div className="qr-container">
                    <img src={qrUrl} alt="QR Code" className="qr-img" />
                    <p className="qr-label">Quét để thi</p>
                  </div>
                </div>

                <div className="card-actions">
                  <Link href={`/dashboard/lecturer/results?quizId=${quiz.id}`} className="btn btn-secondary btn-sm text-center">Xem Kết Quả</Link>
                  <Link href={`/dashboard/lecturer/monitoring?quizId=${quiz.id}`} className="btn btn-primary btn-sm text-center">Giám Sát (Live)</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .page-header { margin-bottom: 2.5rem; }
        .flex-between { display: flex; justify-content: space-between; align-items: flex-end; }
        h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .subtitle { color: var(--text-muted); }
        
        .loading-state, .empty-state { padding: 4rem; text-align: center; color: var(--text-muted); }

        .quizzes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .quiz-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: transform 0.2s;
        }
        .quiz-card:hover { transform: translateY(-4px); }

        .card-top { align-items: center; }
        .delete-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; opacity: 0.5; transition: 0.2s; }
        .delete-btn:hover { opacity: 1; transform: scale(1.1); }

        .status-badge {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
          font-weight: 700;
        }
        .status-badge.active { background: rgba(34, 197, 94, 0.1); color: #22c55e; }

        .quiz-main-content { display: flex; gap: 1.5rem; justify-content: space-between; align-items: center; }
        .quiz-info { flex: 1; }

        h3 { font-size: 1.35rem; margin-bottom: 0.75rem; color: var(--primary); }
        .quiz-meta { color: var(--text-muted); font-size: 0.9rem; }
        .quiz-meta p { margin-bottom: 0.4rem; }
        
        .qr-container { text-align: center; background: white; padding: 0.5rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .qr-img { width: 100px; height: 100px; display: block; }
        .qr-label { font-size: 0.65rem; color: #333; margin-top: 0.25rem; font-weight: 700; }

        .card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: auto;
        }
        .text-center { text-align: center; }
      `}</style>
    </div>
  );
}
