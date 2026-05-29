'use client';

import Link from 'next/link';

export default function LecturerQuizzes() {
  const quizzes = [
    { id: '1', title: 'CS101 Midterm', date: '2026-05-29', students: 120, status: 'Active' },
    { id: '2', title: 'Introduction to AI', date: '2026-06-05', students: 85, status: 'Draft' },
    { id: '3', title: 'Web Development Basics', date: '2026-05-20', students: 200, status: 'Completed' },
  ];

  return (
    <div className="quizzes-container animate-fade-in">
      <header className="page-header flex-between">
        <div>
          <h1>My Quizzes</h1>
          <p className="subtitle">Manage and create examination content</p>
        </div>
        <button className="btn btn-primary">+ Create New Quiz</button>
      </header>

      <div className="quizzes-grid">
        {quizzes.map((q) => (
          <div key={q.id} className="glass-card quiz-card">
            <div className="quiz-status">
              <span className={`status-tag ${q.status.toLowerCase()}`}>{q.status}</span>
            </div>
            <h3>{q.title}</h3>
            <div className="quiz-meta">
              <p>📅 {q.date}</p>
              <p>👥 {q.students} Students</p>
            </div>
            <div className="quiz-actions">
              <button className="btn btn-secondary w-full">Edit Quiz</button>
              <Link href={`/dashboard/lecturer/monitoring`} className="btn btn-primary w-full text-center">Monitor</Link>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .flex-between { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .subtitle { color: var(--text-muted); }
        
        .quizzes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
        .quiz-card { padding: 2rem; display: flex; flex-direction: column; gap: 1rem; }
        .quiz-status { margin-bottom: 0.5rem; }
        .status-tag { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .status-tag.active { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .status-tag.draft { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
        .status-tag.completed { background: rgba(148, 163, 184, 0.1); color: var(--text-muted); }
        
        h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .quiz-meta { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; }
        .quiz-meta p { margin-bottom: 0.5rem; }
        
        .quiz-actions { display: flex; gap: 1rem; }
        .w-full { width: 100%; transition: none; }
        .text-center { text-align: center; }

        @media (max-width: 600px) {
          .flex-between { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .quiz-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
