'use client';

import { useState, useEffect, use, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProctoring } from '@/hooks/useProctoring';
import { useToast } from '@/context/NotificationContext';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
}

interface Quiz {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
  enableAlarm: boolean;
  alarmDuration: number;
  reminderText: string;
}

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ name: string; mssv: string; class: string } | null>(null);
  const [tempInfo, setTempInfo] = useState({ name: '', mssv: '', class: '' });
  const [checkingWhitelist, setCheckingWhitelist] = useState(false);

  // States for the exam
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const { violations, isFullscreen } = useProctoring(isVerified && !isFinished);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setQuiz(data.quiz);
          setTimeLeft(data.quiz.duration * 60);
        }
      } catch (error) {
        showToast('Lỗi tải bài thi', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, showToast]);

  useEffect(() => {
    if (isVerified && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isVerified) {
      handleSubmit();
    }
  }, [isVerified, timeLeft, isFinished]);

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingWhitelist(true);
    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempInfo),
      });

      if (res.ok) {
        const data = await res.json();
        setStudentInfo(data.student);
        setIsVerified(true);
        showToast('Xác thực thành công! Hãy tập trung làm bài.', 'success');
      } else {
        const error = await res.json();
        showToast(error.error || 'Thông tin không hợp lệ', 'error');
      }
    } catch (error) {
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setCheckingWhitelist(false);
    }
  };

  const handleSubmit = async () => {
    if (!studentInfo || !quiz || isFinished) return;
    setIsFinished(true);
    stopAlarm();
    
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: id,
          studentInfo,
          answers,
          violations,
        }),
      });

      if (res.ok) {
        showToast('Chúc mừng! Bài thi của bạn đã được nộp thành công.', 'success');
        router.push('/');
      } else {
        showToast('Lỗi nộp bài. Vui lòng liên hệ Giảng viên.', 'error');
      }
    } catch (error) {
      showToast('Lỗi kết nối máy chủ', 'error');
    }
  };

  // --- ANTI-CHEAT ALARM & TTS ---
  const [alarmActive, setAlarmActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const triggerAlarm = useCallback(() => {
    if (!quiz?.enableAlarm) return;
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error('Audio play failed:', e));
      setAlarmActive(true);
      
      setTimeout(() => {
        stopAlarm();
      }, (quiz.alarmDuration || 10) * 1000);
    }

    if (quiz.reminderText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(quiz.reminderText);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [quiz]);

  const stopAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAlarmActive(false);
  }, []);

  const lastViolationCount = useRef(0);
  useEffect(() => {
    if (violations.length > lastViolationCount.current) {
      triggerAlarm();
      // Report violation to LIVE MONITORING API
      if (studentInfo) {
        fetch('/api/proctoring/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizId: id,
            studentInfo,
            action: violations[violations.length - 1],
          }),
        }).catch(err => console.error('Live log failed:', err));
      }
      lastViolationCount.current = violations.length;
    }
  }, [violations, triggerAlarm, id, studentInfo]);

  if (loading) return <div className="loading-state">Đang tải bài thi...</div>;
  if (!quiz) return <div className="error-state">Không tìm thấy bài thi.</div>;

  if (!isVerified) {
    return (
      <div className="identity-container glass-container animate-fade-in">
        <div className="identity-card glass-card">
          <h2>Xác nhận danh tính</h2>
          <p className="subtitle">Vui lòng nhập thông tin chính xác để bắt đầu bài thi.</p>
          <form onSubmit={handleIdentitySubmit}>
            <div className="form-group">
              <label>Họ và Tên</label>
              <input 
                type="text" 
                required 
                value={tempInfo.name}
                onChange={(e) => setTempInfo({...tempInfo, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Mã số sinh viên (MSSV)</label>
              <input 
                type="text" 
                required 
                value={tempInfo.mssv}
                onChange={(e) => setTempInfo({...tempInfo, mssv: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Lớp</label>
              <input 
                type="text" 
                required 
                value={tempInfo.class}
                onChange={(e) => setTempInfo({...tempInfo, class: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={checkingWhitelist}>
              {checkingWhitelist ? 'Đang kiểm tra...' : 'Bắt đầu bài thi'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-container animate-fade-in">
      {!isFullscreen && (
        <div className="fullscreen-warning">
          ⚠️ Bạn phải ở chế độ toàn màn hình! [Nhấn F11 hoặc click vào đây]
        </div>
      )}

      {/* Alarm Sound */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3" loop />
      
      {alarmActive && (
        <div className="alarm-overlay animate-pulse">
          <div className="alarm-content glass-card">
            <h2>⚠️ CẢNH BÁO VI PHẠM!</h2>
            <p>{quiz.reminderText}</p>
          </div>
        </div>
      )}

      <header className="exam-header glass-card flex-between sticky">
        <div className="quiz-title">
          <h1>{quiz.title}</h1>
          <p className="student-name">Sinh viên: {studentInfo?.name}</p>
        </div>
        <div className="timer-block glass-card">
          <span className="timer-label">Thời gian còn lại</span>
          <span className={`timer-value ${timeLeft < 300 ? 'urgent' : ''}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-secondary" onClick={() => router.push('/')}>Thoát</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Nộp bài</button>
        </div>
      </header>

      <div className="exam-content">
        <div className="questions-grid">
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="question-card glass-card">
              <p className="question-text"><span>Câu {idx + 1}:</span> {q.text}</p>
              <div className="options-list">
                {q.options.map((opt) => (
                  <label key={opt.id} className={`option-item ${answers[q.id] === opt.id ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name={q.id} 
                      value={opt.id} 
                      onChange={() => setAnswers({...answers, [q.id]: opt.id})}
                    />
                    <span className="radio-custom"></span>
                    <span className="opt-text">{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .exam-container { padding: 2rem; max-width: 1000px; margin: 0 auto; position: relative; }
        .sticky { position: sticky; top: 1rem; z-index: 100; margin-bottom: 2rem; }
        .exam-header { padding: 1.5rem 2rem; border: 1px solid var(--border); }
        .gap-4 { gap: 1rem; }
        
        .timer-block { padding: 0.5rem 1.5rem; text-align: center; border: 1px solid var(--primary); }
        .timer-label { display: block; font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); }
        .timer-value { font-size: 1.5rem; font-weight: 900; color: var(--primary); }
        .timer-value.urgent { color: var(--error); }

        .questions-grid { display: flex; flex-direction: column; gap: 2rem; margin-top: 3rem; }
        .question-card { padding: 2.5rem; border: 1px solid rgba(255,255,255,0.05); }
        .question-text { font-size: 1.25rem; font-weight: 600; margin-bottom: 2rem; }
        .question-text span { color: var(--primary); margin-right: 0.5rem; }

        .options-list { display: flex; flex-direction: column; gap: 1rem; }
        .option-item {
          display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 12px;
          cursor: pointer; transition: 0.2s;
        }
        .option-item:hover { background: rgba(255, 255, 255, 0.07); border-color: var(--primary); }
        .option-item.selected { background: rgba(var(--primary-rgb), 0.1); border-color: var(--primary); }
        
        input[type="radio"] { display: none; }
        .radio-custom { width: 20px; height: 20px; border: 2px solid var(--border); border-radius: 50%; position: relative; }
        .option-item.selected .radio-custom { border-color: var(--primary); }
        .option-item.selected .radio-custom::after { content: ''; position: absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:10px; height:10px; background:var(--primary); border-radius:50%; }

        .fullscreen-warning { position: fixed; top: 0; left: 0; right: 0; background: var(--error); color: white; text-align: center; padding: 0.75rem; font-weight: 700; z-index: 10000; }

        .alarm-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(239, 68, 68, 0.3); border: 10px solid var(--error);
          display: flex; justify-content: center; align-items: center; z-index: 9999;
          pointer-events: none;
        }
        .alarm-content { padding: 3rem; text-align: center; border-color: var(--error); pointer-events: auto; }
        .alarm-content h2 { font-size: 2.5rem; color: var(--error); margin-bottom: 1rem; }

        .identity-container { height: 100vh; display: flex; justify-content: center; align-items: center; }
        .identity-card { width: 100%; max-width: 450px; padding: 3rem; text-align: center; }
        .form-group { text-align: left; margin-bottom: 1.5rem; }
        .btn-full { width: 100%; margin-top: 2rem; }
      `}</style>
    </div>
  );
}
