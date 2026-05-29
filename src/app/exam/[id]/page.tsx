'use client';

import { useState, useEffect, use } from 'react';
import { useProctoring } from '@/hooks/useProctoring';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'ESSAY';
  options?: { id: string; text: string }[];
}

interface StudentInfo {
  name: string;
  mssv: string;
  class: string;
}

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [entryForm, setEntryForm] = useState({ name: '', mssv: '', className: '' });
  const [examStarted, setExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [violations, setViolations] = useState<string[]>([]);
  const router = useRouter();

  // 1. Fetch Quiz Data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setQuiz(data.quiz);
          setTimeLeft(data.quiz.duration * 60);
        } else {
          alert('Không tìm thấy bài thi.');
          router.push('/');
        }
      } catch (error) {
        console.error('Fetch quiz error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, router]);

  // 2. Timer Logic
  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && examStarted) {
      handleSubmit();
    }
  }, [examStarted, timeLeft]);

  const handleViolation = (action: string, details?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setViolations((prev) => [...prev, `[${timestamp}] ${action}: ${details}`]);
  };

  const { enterFullscreen } = useProctoring({
    enabled: examStarted,
    onViolation: handleViolation,
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: entryForm.name, 
          mssv: entryForm.mssv, 
          class: entryForm.className 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStudentInfo(data.student);
      } else {
        alert(data.error || 'Thông tin không hợp lệ');
      }
    } catch (error) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const startExam = () => {
    setExamStarted(true);
    enterFullscreen();
  };

  const handleSubmit = async () => {
    if (!studentInfo || !quiz) return;
    
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: id,
          studentInfo: {
            name: studentInfo.name,
            mssv: studentInfo.mssv,
            class: studentInfo.class,
          },
          answers,
          violations,
        }),
      });

      if (res.ok) {
        alert('Chúc mừng! Bài thi của bạn đã được nộp thành công.');
        router.push('/');
      } else {
        alert('Lỗi nộp bài. Vui lòng thử lại hoặc báo cho Giảng viên.');
      }
    } catch (error) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  if (loading) return <div className="loading-state">Đang tải bài thi...</div>;
  if (!quiz) return <div className="loading-state">Lỗi: Không tìm thấy bài thi.</div>;

  // STEP 1: Identification Form
  if (!studentInfo) {
    return (
      <div className="exam-entry-container">
        <div className="glass-card entry-card animate-fade-in">
          <h2>Xác Nhận Thông Tin Dự Thi</h2>
          <p className="subtitle">{quiz.title}</p>
          <form onSubmit={handleVerify} className="entry-form">
            <div className="form-group">
              <label>Họ và Tên</label>
              <input type="text" value={entryForm.name} onChange={(e) => setEntryForm({...entryForm, name: e.target.value})} required placeholder="Ví dụ: Nguyễn Văn A" />
            </div>
            <div className="form-group">
              <label>Mã số sinh viên (MSSV)</label>
              <input type="text" value={entryForm.mssv} onChange={(e) => setEntryForm({...entryForm, mssv: e.target.value})} required placeholder="Ví dụ: 200123" />
            </div>
            <div className="form-group">
              <label>Lớp</label>
              <input type="text" value={entryForm.className} onChange={(e) => setEntryForm({...entryForm, className: e.target.value})} required placeholder="Ví dụ: IT-01" />
            </div>
            <button type="submit" className="btn btn-primary w-full">Vào Phòng Thi</button>
          </form>
        </div>
        <style jsx>{`
          .exam-entry-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 2rem; }
          .entry-card { max-width: 450px; width: 100%; text-align: center; }
          h2 { font-size: 1.75rem; margin-bottom: 0.5rem; }
          .subtitle { color: var(--text-muted); margin-bottom: 2rem; }
          .entry-form { display: flex; flex-direction: column; gap: 1.5rem; }
          .form-group { text-align: left; }
          label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted); }
          input { width: 100%; padding: 0.85rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text); }
          .w-full { width: 100%; }
        `}</style>
      </div>
    );
  }

  // STEP 2: Pre-start Review
  if (!examStarted) {
    return (
      <div className="exam-start-container">
        <div className="glass-card start-card animate-fade-in">
          <p className="student-badge">Sinh viên: {studentInfo.name} - {studentInfo.mssv}</p>
          <h2>{quiz.title}</h2>
          <div className="exam-info">
            <p><strong>Thời gian:</strong> {quiz.duration} Phút</p>
            <p><strong>Số câu hỏi:</strong> {quiz.questions.length}</p>
          </div>
          <div className="warning-box">
            <p><strong>Lưu ý:</strong> Bài thi có giám sát. Việc thoát toàn màn hình hoặc chuyển tab sẽ bị ghi lại vào nhật ký gian lận.</p>
          </div>
          <button onClick={startExam} className="btn btn-primary btn-large w-full">
            Bắt Đầu Làm Bài
          </button>
        </div>
        <style jsx>{`
          .exam-start-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 2rem; }
          .start-card { max-width: 600px; text-align: center; padding: 3rem; }
          .student-badge { background: rgba(99, 102, 241, 0.1); color: var(--primary); padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; display: inline-block; margin-bottom: 1.5rem; }
          h2 { font-size: 2.5rem; margin-bottom: 2rem; }
          .exam-info { margin-bottom: 2rem; font-size: 1.1rem; display: flex; justify-content: center; gap: 3rem; }
          .warning-box { background: rgba(245, 158, 11, 0.1); color: var(--warning); padding: 1.5rem; border-radius: 12px; margin-bottom: 2.5rem; border: 1px solid rgba(245, 158, 11, 0.2); }
          .btn-large { padding: 1.25rem; font-size: 1.2rem; }
          .w-full { width: 100%; }
        `}</style>
      </div>
    );
  }

  // STEP 3: Active Exam
  return (
    <div className="exam-active-container">
      <header className="exam-header glass-card">
        <div className="student-tag">{studentInfo.name} ({studentInfo.mssv})</div>
        <div className="exam-title">{quiz.title}</div>
        <div className="exam-timer">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </header>

      <main className="exam-content">
        <div className="violations-panel glass-card">
          <h4>Nhật ký Giám sát</h4>
          <div className="violations-list">
            {violations.length === 0 ? (
              <p className="no-violations">Hệ thống đang bảo vệ bài thi...</p>
            ) : (
              violations.map((v, i) => <div key={i} className="violation-item">{v}</div>)
            )}
          </div>
        </div>

        <div className="questions-panel">
          {quiz.questions.map((q: any, idx: number) => (
            <div key={q.id} className="glass-card question-card">
              <div className="question-header">
                <span className="question-number">Câu {idx + 1}</span>
              </div>
              <p className="question-text">{q.text}</p>
              
              {q.type === 'MULTIPLE_CHOICE' ? (
                <div className="options-list">
                  {q.options?.map((opt: any) => (
                    <label key={opt.id} className={`option-item ${answers[q.id] === opt.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name={q.id}
                        value={opt.id}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  className="essay-input"
                  placeholder="Nhập câu trả lời của bạn tại đây..."
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className="exam-footer">
        <button onClick={handleSubmit} className="btn btn-primary btn-large">Nộp Bài & Kết Thúc</button>
      </footer>

      <style jsx>{`
        .exam-active-container { padding: 2rem; max-width: 1400px; margin: 0 auto; display: grid; grid-template-rows: auto 1fr auto; gap: 2rem; min-height: 100vh; }
        .exam-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2.5rem; }
        .student-tag { font-weight: 600; color: var(--text-muted); }
        .exam-title { font-weight: 800; font-size: 1.25rem; color: var(--primary); }
        .exam-timer { color: #f87171; font-family: monospace; font-size: 1.75rem; font-weight: 800; background: rgba(248, 113, 113, 0.1); padding: 0.5rem 1rem; border-radius: 8px; }
        
        .exam-content { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; }
        .violations-panel { position: sticky; top: 2rem; height: fit-content; padding: 1.5rem; }
        .violations-list { margin-top: 1.5rem; font-size: 0.85rem; }
        .violation-item { color: var(--error); margin-bottom: 0.75rem; padding: 0.5rem; background: rgba(239, 68, 68, 0.05); border-radius: 4px; }
        .no-violations { color: var(--success); font-style: italic; }
        
        .question-card { padding: 2.5rem; margin-bottom: 2rem; }
        .question-header { margin-bottom: 1.5rem; }
        .question-number { background: var(--primary); color: white; padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 700; }
        .question-text { font-size: 1.25rem; margin-bottom: 2rem; font-weight: 600; line-height: 1.5; }
        
        .options-list { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .option-item { padding: 1.25rem; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; cursor: pointer; transition: var(--transition); display: flex; align-items: center; }
        .option-item:hover { border-color: var(--primary); }
        .option-item.selected { border-width: 2px; border-color: var(--primary); background: rgba(99, 102, 241, 0.05); }
        .option-item input { margin-right: 1.5rem; transform: scale(1.2); }
        
        .essay-input { width: 100%; min-height: 250px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; color: var(--text); padding: 1.5rem; resize: vertical; line-height: 1.6; }
        
        .exam-footer { display: flex; justify-content: flex-end; padding: 3rem 0; border-top: 1px solid var(--border); }
        .btn-large { padding: 1rem 3rem; font-size: 1.1rem; }
        
        @media (max-width: 1024px) {
          .exam-content { grid-template-columns: 1fr; }
          .violations-panel { order: -1; position: static; }
        }
      `}</style>
    </div>
  );
}
