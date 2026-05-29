'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function SubmissionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/submissions/${id}`);
        if (res.ok) {
          const data = await res.json();
          setSubmission(data.submission);
        }
      } catch (error) {
        console.error('Fetch submission details error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-8">Đang tải chi tiết bài làm...</div>;
  if (!submission) return <div className="p-8">Không tìm thấy dữ liệu.</div>;

  return (
    <div className="details-container animate-fade-in">
      <header className="page-header">
        <Link href={`/dashboard/lecturer/results?quizId=${submission.quizId}`} className="back-link">← Quay lại danh sách kết quả</Link>
        <div className="header-content flex-between">
          <div>
            <h1>Chi Tiết Bài Làm</h1>
            <p className="subtitle">Sinh viên: <strong>{submission.student.name}</strong> - {submission.student.email.split('@')[0]}</p>
          </div>
          <div className="score-summary glass-card">
            <div className="label">Điểm số</div>
            <div className="value">{submission.score?.toFixed(1) || '0.0'}</div>
          </div>
        </div>
      </header>

      <section className="violations-summary glass-card">
        <h3>Nhật ký giám sát ({submission.logs.length} vi phạm)</h3>
        {submission.logs.length === 0 ? (
          <p className="safe-msg">Không phát hiện hành vi bất thường.</p>
        ) : (
          <ul className="logs-list">
            {submission.logs.map((log: any) => (
              <li key={log.id} className="log-item">
                <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}:</span> {log.details}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="questions-review">
        <h2>Phân tích câu hỏi</h2>
        <div className="questions-grid">
          {submission.quiz.questions.map((q: any, idx: number) => {
            const studentAnswerId = submission.answers.find((a: any) => a.questionId === q.id)?.content;
            const correctOption = q.options.find((opt: any) => opt.isCorrect);
            const isCorrect = studentAnswerId === correctOption?.id;

            return (
              <div key={q.id} className={`glass-card question-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="q-header flex-between">
                  <span className="q-num">Câu {idx + 1}</span>
                  <span className={`q-status ${isCorrect ? 'status-correct' : 'status-incorrect'}`}>
                    {isCorrect ? '✓ Đúng' : '✗ Sai'}
                  </span>
                </div>
                <p className="q-text">{q.text}</p>
                <div className="options-review">
                  {q.options.map((opt: any) => {
                    const isSelected = studentAnswerId === opt.id;
                    const isCorrectOpt = opt.isCorrect;
                    
                    let className = 'opt-item';
                    if (isSelected && isCorrectOpt) className += ' selected-correct';
                    else if (isSelected && !isCorrectOpt) className += ' selected-wrong';
                    else if (!isSelected && isCorrectOpt) className += ' actual-correct';

                    return (
                      <div key={opt.id} className={className}>
                        {opt.text}
                        {isSelected && <span className="user-tag">(Bạn chọn)</span>}
                        {isCorrectOpt && <span className="correct-tag">(Đáp án đúng)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <style jsx>{`
        .details-container { padding-bottom: 5rem; max-width: 1000px; margin: 0 auto; }
        .page-header { margin-bottom: 2.5rem; }
        .back-link { display: block; margin-bottom: 1.5rem; color: var(--primary); text-decoration: none; }
        
        .header-content { align-items: center; }
        h1 { font-size: 2.25rem; margin-bottom: 0.5rem; }
        .subtitle { font-size: 1.1rem; color: var(--text-muted); }
        
        .score-summary { padding: 1rem 2rem; text-align: center; border: 2px solid var(--primary); }
        .score-summary .label { font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); }
        .score-summary .value { font-size: 2.5rem; font-weight: 900; color: var(--primary); }

        .violations-summary { padding: 1.5rem; margin-bottom: 3rem; border-left: 4px solid var(--secondary); }
        .safe-msg { color: var(--success); font-style: italic; }
        .log-item { color: var(--error); margin-bottom: 0.5rem; font-size: 0.9rem; }
        .log-time { font-weight: 700; margin-right: 0.5rem; }

        h2 { margin-bottom: 2rem; }
        .questions-grid { display: flex; flex-direction: column; gap: 2rem; }
        
        .question-card { padding: 2rem; position: relative; }
        .question-card.correct { border-left: 6px solid #22c55e; }
        .question-card.incorrect { border-left: 6px solid #ef4444; }

        .q-num { font-weight: 800; font-size: 0.9rem; color: var(--text-muted); }
        .q-status { font-weight: 700; font-size: 0.9rem; }
        .status-correct { color: #22c55e; }
        .status-incorrect { color: #ef4444; }

        .q-text { font-size: 1.2rem; margin: 1.5rem 0; font-weight: 600; }
        
        .options-review { display: flex; flex-direction: column; gap: 0.75rem; }
        .opt-item { padding: 1rem; border-radius: 8px; border: 1px solid var(--border); font-size: 1rem; display: flex; justify-content: space-between; }
        
        .selected-correct { background: rgba(34, 197, 94, 0.1); border-color: #22c55e; color: #22c55e; font-weight: 600; }
        .selected-wrong { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; font-weight: 600; }
        .actual-correct { border-color: #22c55e; border-style: dashed; color: #22c55e; }
        
        .user-tag, .correct-tag { font-size: 0.75rem; text-transform: uppercase; font-weight: 800; }
      `}</style>
    </div>
  );
}
