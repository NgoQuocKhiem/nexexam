'use client';

export default function LecturerDashboard() {
  return (
    <div className="dashboard-container animate-fade-in">
      <header className="page-header">
        <h1>Welcome, Dr. Smith</h1>
        <p className="subtitle">Here's what's happening with your classes today.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">1,240</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <span className="stat-label">Active Quizzes</span>
            <span className="stat-value">12</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-label">Submissions Today</span>
            <span className="stat-value">458</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="recent-activity glass-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-bullet"></span>
              <p><strong>Quiz CS102</strong> was created 2 hours ago.</p>
            </div>
            <div className="activity-item">
              <span className="activity-bullet warning"></span>
              <p><strong>3 violations</strong> detected in CS101 Midterm.</p>
            </div>
            <div className="activity-item">
              <span className="activity-bullet success"></span>
              <p>Grading completed for <strong>Calculus II</strong>.</p>
            </div>
          </div>
        </section>

        <section className="upcoming-exams glass-card">
          <h3>Upcoming Exams</h3>
          <div className="exam-list">
            <div className="exam-item">
              <div className="exam-date">
                <span className="day">30</span>
                <span className="month">MAY</span>
              </div>
              <div className="exam-details">
                <p className="exam-name">Data Structures Final</p>
                <p className="exam-meta">2:00 PM • 120 Students</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .page-header { margin-bottom: 2.5rem; }
        h1 { font-size: 2.2rem; margin-bottom: 0.5rem; }
        .subtitle { color: var(--text-muted); }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
        .stat-card { display: flex; align-items: center; gap: 1.5rem; padding: 2rem; }
        .stat-icon { font-size: 2.5rem; background: rgba(255,255,255,0.05); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .stat-label { display: block; color: var(--text-muted); font-size: 0.9rem; }
        .stat-value { font-size: 1.5rem; font-weight: 700; }
        
        .dashboard-sections { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
        h3 { margin-bottom: 1.5rem; font-size: 1.25rem; }
        
        .activity-item { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
        .activity-bullet { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); margin-top: 0.4rem; }
        .activity-bullet.warning { background: var(--warning); }
        .activity-bullet.success { background: var(--success); }
        
        .exam-item { display: flex; gap: 1.5rem; align-items: center; background: var(--surface); padding: 1rem; border-radius: var(--radius-md); }
        .exam-date { background: var(--background); padding: 0.5rem 1rem; border-radius: 8px; text-align: center; border: 1px solid var(--border); }
        .exam-date .day { display: block; font-size: 1.25rem; font-weight: 800; }
        .exam-date .month { font-size: 0.7rem; color: var(--text-muted); font-weight: 700; }
        .exam-name { font-weight: 600; margin-bottom: 0.25rem; }
        .exam-meta { font-size: 0.8rem; color: var(--text-muted); }

        @media (max-width: 1200px) {
          .dashboard-sections { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
