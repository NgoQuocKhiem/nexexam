'use client';

import { Suspense } from 'react';
import MonitoringContent from './MonitoringContent';

export default function MonitoringPage() {
  return (
    <Suspense fallback={<div className="loading-state">Đang kết nối hệ thống giám sát...</div>}>
      <MonitoringContent />
    </Suspense>
  );
}
