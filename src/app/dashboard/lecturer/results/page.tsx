'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResultsContent() {
  const searchParams = useSearchParams();
  const quizId = searchParams.get('quizId');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`/api/submissions?quizId=${quizId}`);
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } catch (error) {
        console.error('Fetch submissions error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [quizId]);

  if (!quizId) return <div className="p-8">Không tìm thấy mã bài thi.</div>;

  return (
    <div className="results-container animate-fade-in">
      <header className="page-header flex-between">
        <div>
          <Link href="/dashboard/lecturer/quizzes" className="back-link">← Quay lại danh sách</Link>
          <h1>Kết Quả Bài Thi</h1>
          <p className="subtitle">Tổng số: {submissions.length} lượt nộp</p>
        </div>
      </header>

      {loading ? (
        <div className="loading-state">Đang tải kết quả...</div>
      ) : submissions.length === 0 ? (
        <div className="empty-state glass-card">Chưa có sinh viên nào nộp bài.</div>
      ) : (
        <div className="table-container glass-card">
          <table className="results-table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>MSSV / Lớp</th>
                <th>Điểm số</th>
                <th>Số câu đúng</th>
                <th>Thời gian nộp</th>
                <th>Vi phạm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <div className="student-name">{sub.student.name}</div>
                  </td>
                  <td>
                    <div className="student-meta">{sub.student.email.split('@')[0]}</div>
                  </td>
                  <td className="score-cell">
                    <span className={`score-badge ${sub.score >= 5 ? 'pass' : 'fail'}`}>
                      {sub.score?.toFixed(1) || '0.0'}
                    </span>
                  </td>
                  <td>
                    <span className="correct-tag">{sub.correctCount} / {sub.totalQuestions}</span>
                  </td>
                  <td>{new Date(sub.endTime).toLocaleString()}</td>
                  <td>
                    <span className={`violation-count ${sub.logs.length > 0 ? 'warning' : 'safe'}`}>
                      {sub.logs.length} vi phạm
                    </span>
                  </td>
                  <td>
                    <Link href={`/dashboard/lecturer/results/${sub.id}`} className="btn btn-secondary btn-sm">Xem chi tiết</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .results-container { padding-bottom: 4rem; }
        .page-header { margin-bottom: 2rem; }
        .back-link { display: block; margin-bottom: 1rem; color: var(--primary); text-decoration: none; font-size: 0.9rem; }
        h1 { font-size: 2rem; }
        .subtitle { color: var(--text-muted); }

        .loading-state, .empty-state { padding: 4rem; text-align: center; color: var(--text-muted); }

        .table-container { overflow-x: auto; padding: 1rem; }
        .results-table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 1.25rem 1rem; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
        td { padding: 1.25rem 1rem; border-bottom: 1px solid var(--border); }
        
        .student-name { font-weight: 700; color: var(--text); }
        .student-meta { font-size: 0.85rem; color: var(--text-muted); }

        .score-badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 800; font-family: monospace; font-size: 1.1rem; }
        .score-badge.pass { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .score-badge.fail { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .correct-tag { font-weight: 600; color: var(--text-muted); }

        .violation-count { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
        .violation-count.safe { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .violation-count.warning { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
      `}</style>
    </div>
  );
}

export default function LecturerResults() {
  return (
    <Suspense fallback={<div className="p-8">Đang tải...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
