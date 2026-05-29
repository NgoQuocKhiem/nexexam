'use client';

import Link from 'next/link';

export default function BannedPage() {
  return (
    <div className="banned-container glass-container animate-fade-in">
      <div className="banned-card glass-card">
        <div className="icon">🛑</div>
        <h1>Truy cập bị tạm khóa</h1>
        <p className="subtitle">
          Hệ thống phát hiện các hành động vi phạm chính sách bảo mật (mở Công cụ lập trình hoặc phím tắt bị cấm).
        </p>
        
        <div className="notice glass-card">
          <p><strong>Thời gian khóa:</strong> 24 giờ</p>
          <p>Tài khoản và thiết bị của bạn đã bị ghi nhận vi phạm. Vui lòng quay lại sau khi thời gian khóa kết thúc.</p>
        </div>

        <Link href="/" className="btn btn-secondary btn-full">Quay lại trang chủ</Link>
      </div>

      <style jsx>{`
        .banned-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          background: #000;
        }
        .banned-card {
          max-width: 500px;
          width: 100%;
          padding: 3rem;
          text-align: center;
          border: 1px solid var(--error);
        }
        .icon { font-size: 4rem; margin-bottom: 2rem; }
        h1 { color: var(--error); margin-bottom: 1rem; }
        .subtitle { color: var(--text-muted); margin-bottom: 2rem; }
        
        .notice {
          padding: 1.5rem;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          margin-bottom: 2rem;
          text-align: left;
          font-size: 0.9rem;
        }
        .btn-full { display: block; width: 100%; text-align: center; }
      `}</style>
    </div>
  );
}
