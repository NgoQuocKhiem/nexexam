'use client';

import { useState, useEffect } from 'react';
import { useProctoring } from '@/hooks/useProctoring';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'ESSAY';
  options?: { id: string; text: string }[];
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const [examStarted, setExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 mins dummy
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [violations, setViolations] = useState<string[]>([]);
  const router = useRouter();

  // Mock data for now
  const questions: Question[] = [
    {
      id: '1',
      text: 'What is the capital of France?',
      type: 'MULTIPLE_CHOICE',
      options: [
        { id: 'a', text: 'London' },
        { id: 'b', text: 'Paris' },
        { id: 'c', text: 'Berlin' },
      ],
    },
    {
      id: '2',
      text: 'Explain the concept of Cloud Computing.',
      type: 'ESSAY',
    },
  ];

  const handleViolation = (action: string, details?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setViolations((prev) => [...prev, `[${timestamp}] ${action}: ${details}`]);
    // In real app, we would send this to the server API
    console.warn('Violation detected:', action, details);
  };

  const { enterFullscreen } = useProctoring({
    enabled: examStarted,
    onViolation: handleViolation,
  });

  const startExam = () => {
    setExamStarted(true);
    enterFullscreen();
  };

  const handleSubmit = async () => {
    // Logic to submit to API
    alert('Exam Submitted Successfully!');
    router.push('/dashboard/student');
  };

  if (!examStarted) {
    return (
      <div className="exam-start-container">
        <div className="glass-card start-card animate-fade-in">
          <h2>Final Examination: CS101</h2>
          <div className="exam-info">
            <p><strong>Duration:</strong> 60 Minutes</p>
            <p><strong>Total Questions:</strong> {questions.length}</p>
          </div>
          <div className="warning-box">
            <p>Important: This exam is proctored. Exiting fullscreen or switching tabs will be logged as a violation.</p>
          </div>
          <button onClick={startExam} className="btn btn-primary btn-large">
            Start Examination
          </button>
        </div>
        <style jsx>{`
          .exam-start-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 2rem;
          }
          .start-card {
            max-width: 600px;
            text-align: center;
          }
          h2 { font-size: 2rem; margin-bottom: 1.5rem; }
          .exam-info { margin-bottom: 1.5rem; text-align: left; }
          .warning-box {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning);
            padding: 1rem;
            border-radius: var(--radius-md);
            margin-bottom: 2rem;
            border-left: 4px solid var(--warning);
          }
          .btn-large { padding: 1rem 2rem; font-size: 1.1rem; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="exam-active-container">
      <header className="exam-header glass-card">
        <div className="exam-title">CS101: Midterm</div>
        <div className="exam-timer">Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
      </header>

      <main className="exam-content">
        <div className="violations-panel glass-card">
          <h4>Live Monitoring</h4>
          <div className="violations-list">
            {violations.length === 0 ? (
              <p className="no-violations">No violations detected</p>
            ) : (
              violations.map((v, i) => <div key={i} className="violation-item">{v}</div>)
            )}
          </div>
        </div>

        <div className="questions-panel">
          {questions.map((q, idx) => (
            <div key={q.id} className="glass-card question-card">
              <div className="question-header">
                <span className="question-number">Question {idx + 1}</span>
              </div>
              <p className="question-text">{q.text}</p>
              
              {q.type === 'MULTIPLE_CHOICE' ? (
                <div className="options-list">
                  {q.options?.map((opt) => (
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
                  placeholder="Type your answer here..."
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className="exam-footer">
        <button onClick={handleSubmit} className="btn btn-primary">Finish & Submit</button>
      </footer>

      <style jsx>{`
        .exam-active-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 2rem;
          min-height: 100vh;
        }
        .exam-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
        }
        .exam-title { font-weight: 700; font-size: 1.2rem; }
        .exam-timer { color: var(--secondary); font-family: monospace; font-size: 1.5rem; font-weight: bold; }
        
        .exam-content {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
        }
        
        .violations-panel {
          position: sticky;
          top: 2rem;
          height: fit-content;
        }
        .violations-list { margin-top: 1rem; font-size: 0.85rem; }
        .violation-item { color: var(--error); margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
        .no-violations { color: var(--success); }
        
        .question-card { margin-bottom: 2rem; }
        .question-header { margin-bottom: 1rem; }
        .question-number { background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.8rem; }
        .question-text { font-size: 1.1rem; margin-bottom: 1.5rem; font-weight: 500; }
        
        .options-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .option-item {
          padding: 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
        }
        .option-item:hover { border-color: var(--primary); }
        .option-item.selected { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); }
        .option-item input { margin-right: 1rem; }
        
        .essay-input {
          width: 100%;
          min-height: 200px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text);
          padding: 1rem;
          resize: vertical;
        }
        
        .exam-footer {
          display: flex;
          justify-content: flex-end;
          padding: 2rem 0;
        }
        
        @media (max-width: 900px) {
          .exam-content { grid-template-columns: 1fr; }
          .violations-panel { order: -1; position: static; }
        }
      `}</style>
    </div>
  );
}
