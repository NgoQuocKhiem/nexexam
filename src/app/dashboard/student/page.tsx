'use client';

import Link from 'next/link';

export default function StudentDashboard() {
  const activeExams = [
    { id: '1', title: 'CS101 Midterm', duration: '60 min', lecturer: 'Dr. Smith' },
  ];

  return (
    <div className="student-dashboard animate-fade-in">
      <header className="page-header">
        <h1>Welcome Back, Student</h1>
        <p className="subtitle">Ready for your examinations?</p>
      </header>

      <div className="dashboard-grid">
        <section className="active-exams">
          <h3>Active & Upcoming Exams</h3>
          <div className="exams-list">
            {activeExams.map((exam) => (
              <div key={exam.id} className="glass-card exam-card">
                <div className="exam-main">
                  <h4>{exam.title}</h4>
                  <p className="exam-meta">By {exam.lecturer} • {exam.duration}</p>
                </div>
                <Link href={`/exam/${exam.id}`} className="btn btn-primary">
                  Start Exam
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section">
          <div className="glass-card stat-item">
            <span className="stat-icon">✅</span>
            <div>
              <span className="stat-label">Completed</span>
              <span className="stat-value">12</span>
            </div>
          </div>
          <div className="glass-card stat-item">
            <span className="stat-icon">📅</span>
            <div>
              <span className="stat-label">Upcoming</span>
              <span className="stat-value">2</span>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .page-header { margin-bottom: 2.5rem; }
        h1 { font-size: 2.22rem; margin-bottom: 0.5rem; }
        .subtitle { color: var(--text-muted); }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        h3 { margin-bottom: 1.5rem; font-size: 1.25rem; }

        .exam-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          margin-bottom: 1rem;
        }

        .exam-main h4 { font-size: 1.1rem; margin-bottom: 0.25rem; }
        .exam-meta { color: var(--text-muted); font-size: 0.85rem; }

        .stats-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
        }
        .stat-icon { font-size: 2rem; }
        .stat-label { display: block; color: var(--text-muted); font-size: 0.85rem; }
        .stat-value { font-size: 1.5rem; font-weight: 700; }

        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
