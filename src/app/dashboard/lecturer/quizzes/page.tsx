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

  useEffect(() => {
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
    fetchQuizzes();
  }, []);

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
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card glass-card">
              <div className="status-badge active">Đang mở</div>
              <h3>{quiz.title}</h3>
              <div className="quiz-meta">
                <p>📅 {new Date(quiz.createdAt).toLocaleDateString()}</p>
                <p>👥 {quiz._count.submissions} lượt nộp bài</p>
              </div>
              <div className="card-actions">
                <Link href={`/dashboard/lecturer/monitoring?quizId=${quiz.id}`} className="btn btn-primary btn-sm">Giám sát</Link>
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  const url = `${window.location.origin}/exam/${quiz.id}`;
                  navigator.clipboard.writeText(url);
                  alert('Đã copy link bài thi: ' + url);
                }}>Copy Link</button>
              </div>
            </div>
          ))}
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
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .quiz-card {
          padding: 2rem;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
          font-weight: 700;
        }
        .status-badge.active { background: rgba(34, 197, 94, 0.1); color: #22c55e; }

        h3 { font-size: 1.25rem; margin-top: 1rem; margin-bottom: 0.5rem; }
        .quiz-meta { color: var(--text-muted); font-size: 0.9rem; }
        .quiz-meta p { margin-bottom: 0.5rem; }
        
        .card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
