'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/NotificationContext';

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
  const { showToast, confirm } = useToast();

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (error) {
      showToast('Không thể tải danh sách bài thi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    confirm(`Bạn có chắc chắn muốn xóa bài thi "${title}"? Thao tác này sẽ xóa toàn bộ câu hỏi và kết quả thi của sinh viên.`, async () => {
      try {
        const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Đã xóa bài thi thành công', 'success');
          fetchQuizzes();
        } else {
          showToast('Lỗi khi xóa bài thi', 'error');
        }
      } catch (error) {
        showToast('Lỗi kết nối máy chủ', 'error');
      }
    });
  };

  const downloadQR = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QR_${title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showToast('Đang tải mã QR...', 'success');
    } catch (error) {
      window.open(url, '_blank');
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
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(examUrl)}`;

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
                    <div className="share-actions">
                      <button className="share-link-btn" onClick={() => {
                        navigator.clipboard.writeText(examUrl);
                        showToast('Đã copy link bài thi!', 'success');
                      }}>🔗 Copy Link</button>
                      <button className="share-qr-btn" onClick={() => downloadQR(qrUrl, quiz.title)}>💾 Tải mã QR</button>
                    </div>
                  </div>
                  
                  <div className="qr-preview">
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
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 2rem;
        }

        .quiz-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

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

        .quiz-main-content { display: flex; gap: 2rem; justify-content: space-between; align-items: center; }
        .quiz-info { flex: 1; }

        h3 { font-size: 1.5rem; margin-bottom: 0.75rem; color: var(--primary); }
        .quiz-meta { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; }
        .quiz-meta p { margin-bottom: 0.5rem; }

        .share-actions { display: flex; gap: 1rem; }
        .share-link-btn, .share-qr-btn { 
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid var(--border); 
          padding: 0.5rem 0.75rem; 
          border-radius: 6px; 
          font-size: 0.8rem; 
          color: var(--text); 
          cursor: pointer;
          transition: 0.2s;
        }
        .share-link-btn:hover, .share-qr-btn:hover { background: var(--surface); border-color: var(--primary); }
        
        .qr-preview { text-align: center; background: white; padding: 0.75rem; border-radius: 12px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
        .qr-img { width: 120px; height: 120px; display: block; border-radius: 4px; }
        .qr-label { font-size: 0.7rem; color: #333; margin-top: 0.5rem; font-weight: 800; text-transform: uppercase; }

        .card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: auto;
        }
        .text-center { text-align: center; line-height: 2.2; }
      `}</style>
    </div>
  );
}
