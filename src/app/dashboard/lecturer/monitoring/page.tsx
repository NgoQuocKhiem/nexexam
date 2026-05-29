'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/NotificationContext';

interface ViolationLog {
  id: string;
  studentName: string;
  mssv: string;
  class: string;
  action: string;
  timestamp: string;
}

export default function MonitoringPage() {
  const searchParams = useSearchParams();
  const quizId = searchParams.get('quizId');
  const [logs, setLogs] = useState<ViolationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const router = useRouter();

  const fetchLogs = async () => {
    if (!quizId) return;
    try {
      const res = await fetch(`/api/proctoring/log?quizId=${quizId}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Fetch monitoring logs failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [quizId]);

  if (!quizId) {
    return <div className="p-8 text-center">Không xác định được bài thi cần giám sát.</div>;
  }

  return (
    <div className="monitoring-container animate-fade-in">
      <header className="page-header flex-between">
        <div>
          <Link href="/dashboard/lecturer/quizzes" className="back-link">← Quay lại</Link>
          <h1>🛡️ Giám Sát Trực Tiếp (Live)</h1>
          <p className="subtitle">Theo dõi vi phạm của sinh viên theo thời gian thực</p>
        </div>
        <div className="status-indicator flex items-center gap-2">
          <span className="pulse-dot"></span>
          <span className="live-text">ĐANG GIÁM SÁT TRỰC TIẾP</span>
        </div>
      </header>

      <div className="logs-grid">
        <section className="glass-card monitoring-card">
          <div className="card-header flex-between">
            <h3>Nhật ký vi phạm mới nhất</h3>
            <span className="log-count">{logs.length} bản ghi</span>
          </div>

          <div className="logs-table-wrapper">
            {loading ? (
              <p className="p-8 text-center text-muted">Đang kết nối hệ thống...</p>
            ) : logs.length === 0 ? (
              <div className="empty-logs text-center p-8">
                <p className="text-muted">Chưa có vi phạm nào được ghi nhận. Chúc mừng!</p>
              </div>
            ) : (
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Sinh viên</th>
                    <th>MSSV</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="log-row animate-slide-in">
                      <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td><strong>{log.studentName}</strong></td>
                      <td>{log.mssv}</td>
                      <td>
                        <span className={`violation-tag ${log.action.includes('Rời') || log.action.includes('Mất') ? 'critical' : 'warning'}`}>
                          {log.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .monitoring-container { padding-bottom: 5rem; }
        .page-header { margin-bottom: 3rem; }
        .back-link { color: var(--primary); text-decoration: none; margin-bottom: 1rem; display: inline-block; }
        
        .status-indicator { background: rgba(34, 197, 94, 0.1); padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.2); }
        .pulse-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; animation: pulse-shadow 2s infinite; }
        .live-text { color: #22c55e; font-size: 0.75rem; font-weight: 800; }

        .monitoring-card { padding: 1.5rem; overflow: hidden; }
        .card-header { margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
        .log-count { font-size: 0.8rem; color: var(--text-muted); }

        .logs-table { width: 100%; border-collapse: collapse; }
        .logs-table th { text-align: left; padding: 1rem; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 0.85rem; }
        .logs-table td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); }

        .violation-tag { padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
        .violation-tag.critical { background: rgba(239, 68, 68, 0.1); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.2); }
        .violation-tag.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }

        @keyframes pulse-shadow {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>
    </div>
  );
}
