'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="home-container">
      <nav className="navbar glass-card">
        <div className="logo">QuestGuard</div>
        <div className="nav-links">
          <Link href="/login" className="btn btn-secondary">Login</Link>
          <Link href="/register" className="btn btn-primary">Register</Link>
        </div>
      </nav>

      <main className="hero">
        <h1 className="animate-fade-in">Secure. Reliable. <span className="text-gradient">Intelligent.</span></h1>
        <p className="hero-subtitle animate-fade-in">The ultimate university examination platform with advanced anti-cheat proctoring.</p>
        
        <div className="cta-group animate-fade-in">
          <Link href="/register" className="btn btn-primary btn-large">Get Started Now</Link>
          <button className="btn btn-secondary btn-large">View Demo</button>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon">🛡️</div>
            <h3>Advanced Proctoring</h3>
            <p>Real-time detection of tab switching, window blurring, and prohibited keyboard actions.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile First</h3>
            <p>Optimized for any device, allowing students to take exams securely from anywhere.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">📊</div>
            <h3>Live Analytics</h3>
            <p>Lecturers can monitor student behavior and progress in real-time with detailed logs.</p>
          </div>
        </div>
      </main>

      <style jsx>{`
        .home-container {
          min-height: 100vh;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent),
                      radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.1), transparent);
        }
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 4rem;
          margin: 1rem 2rem;
          border-radius: var(--radius-md);
        }
        .logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
        .nav-links { display: flex; gap: 1rem; }
        
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 6rem 2rem;
        }
        h1 { font-size: 4rem; font-weight: 900; margin-bottom: 1.5rem; letter-spacing: -2px; }
        .text-gradient { background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-subtitle { font-size: 1.25rem; color: var(--text-muted); max-width: 600px; margin-bottom: 3rem; }
        
        .cta-group { display: flex; gap: 1.5rem; margin-bottom: 6rem; }
        .btn-large { padding: 1rem 2.5rem; font-size: 1.1rem; }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          width: 100%;
          max-width: 1200px;
        }
        .feature-card {
          text-align: left;
          padding: 2.5rem;
          transition: var(--transition);
        }
        .feature-card:hover { transform: translateY(-10px); background: rgba(30, 41, 59, 0.9); }
        .feature-icon { font-size: 2.5rem; margin-bottom: 1.5rem; }
        .feature-card h3 { margin-bottom: 1rem; color: var(--text); }
        .feature-card p { color: var(--text-muted); font-size: 0.95rem; }

        @media (max-width: 768px) {
          .navbar { padding: 1rem 1.5rem; margin: 0.5rem; }
          h1 { font-size: 2.5rem; }
          .hero { padding: 4rem 1rem; }
        }
      `}</style>
    </div>
  );
}
