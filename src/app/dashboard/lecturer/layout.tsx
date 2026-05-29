'use client';

import Link from 'next/link';

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar glass-card">
        <div className="sidebar-header">
          <div className="logo">QuestGuard</div>
          <p className="role-badge">Lecturer Panel</p>
        </div>
        
        <nav className="sidebar-nav">
          <Link href="/dashboard/lecturer" className="nav-item active">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/dashboard/lecturer/quizzes" className="nav-item">
            <span>📝</span> My Quizzes
          </Link>
          <Link href="/dashboard/lecturer/monitoring" className="nav-item">
            <span>🛡️</span> Live Proctoring
          </Link>
          <Link href="/dashboard/lecturer/results" className="nav-item">
            <span>📈</span> Results
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link href="/login" className="btn btn-secondary w-full">Logout</Link>
        </div>
      </aside>

      <main className="dashboard-content">
        {children}
      </main>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: var(--background);
        }
        
        .sidebar {
          width: 280px;
          height: calc(100vh - 2rem);
          margin: 1rem;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          position: sticky;
          top: 1rem;
        }
        
        .sidebar-header { margin-bottom: 3rem; }
        .logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem; }
        .role-badge { font-size: 0.75rem; background: rgba(99, 102, 241, 0.1); color: var(--primary); padding: 0.25rem 0.5rem; border-radius: 4px; display: inline-block; font-weight: 600; }
        
        .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          text-decoration: none;
          transition: var(--transition);
        }
        .nav-item:hover { background: var(--surface-hover); color: var(--text); }
        .nav-item.active { background: var(--primary); color: white; }
        
        .dashboard-content {
          flex: 1;
          padding: 2rem 3rem;
          overflow-y: auto;
        }

        @media (max-width: 1024px) {
          .sidebar { width: 80px; padding: 1.5rem 1rem; }
          .nav-item span { margin: 0; }
          .nav-item { justify-content: center; font-size: 0; }
          .logo, .role-badge, .sidebar-footer { display: none; }
        }
      `}</style>
    </div>
  );
}
