'use client';

export default function LecturerMonitor() {
  const students = [
    { id: '1', name: 'Nguyen Van A', status: 'Examining', violations: 0, progress: '65%' },
    { id: '2', name: 'Le Thi B', status: 'Suspicious', violations: 3, progress: '40%' },
    { id: '3', name: 'Tran Van C', status: 'Offline', violations: 1, progress: '100%' },
  ];

  return (
    <div className="monitor-container animate-fade-in">
      <header className="page-header">
        <h1>Live Proctoring Console</h1>
        <p className="subtitle">Real-time monitoring of CS101 Midterm Examination</p>
      </header>

      <div className="stats-row">
        <div className="stat-card glass-card">
          <span className="stat-label">Active Students</span>
          <span className="stat-value">42</span>
        </div>
        <div className="stat-card glass-card">
          <span className="stat-label">Violations Detected</span>
          <span className="stat-value text-error">12</span>
        </div>
        <div className="stat-card glass-card">
          <span className="stat-label">Avg. Progress</span>
          <span className="stat-value">58%</span>
        </div>
      </div>

      <div className="monitor-grid glass-card">
        <table className="monitor-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Status</th>
              <th>Violations</th>
              <th>Progress</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>
                  <span className={`status-pill ${s.status.toLowerCase()}`}>
                    {s.status}
                  </span>
                </td>
                <td className={s.violations > 0 ? 'text-error font-bold' : ''}>{s.violations}</td>
                <td>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: s.progress }}></div>
                  </div>
                </td>
                <td>
                  <button className="btn btn-secondary btn-sm">View Logs</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-header { margin-bottom: 2.5rem; }
        h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .subtitle { color: var(--text-muted); }
        
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { padding: 1.5rem; text-align: center; }
        .stat-label { display: block; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem; }
        .stat-value { font-size: 1.75rem; font-weight: 800; }
        .text-error { color: var(--error); }
        
        .monitor-table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 1rem; color: var(--text-muted); border-bottom: 1px solid var(--border); font-size: 0.9rem; }
        td { padding: 1.25rem 1rem; border-bottom: 1px solid var(--border); }
        
        .status-pill {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .status-pill.examining { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .status-pill.suspicious { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .status-pill.offline { background: rgba(148, 163, 184, 0.1); color: var(--text-muted); }
        
        .progress-bar-bg { width: 100px; height: 8px; background: var(--surface); border-radius: 4px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: var(--primary); }
        
        .font-bold { font-weight: bold; }
        .btn-sm { padding: 0.5rem 1rem; font-size: 0.85rem; }
      `}</style>
    </div>
  );
}
