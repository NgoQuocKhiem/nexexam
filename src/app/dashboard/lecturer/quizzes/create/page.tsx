'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  text: string;
  options: { text: string; isCorrect: boolean }[];
}

export default function CreateQuizPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      },
    ]);
  };

  const handleImport = () => {
    // Format: Question | Opt1 | Opt2 | Opt3 | CorrectIdx(1/2/3)
    const lines = importText.split('\n').filter((l) => l.trim().includes('|'));
    const importedQuestions: Question[] = lines.map((line) => {
      const parts = line.split('|').map((p) => p.trim());
      const text = parts[0];
      const correctIdx = parseInt(parts[parts.length - 1]) - 1;
      const options = parts.slice(1, -1).map((optText, idx) => ({
        text: optText,
        isCorrect: idx === correctIdx,
      }));
      return { text, options };
    });

    setQuestions([...questions, ...importedQuestions]);
    setImportText('');
    setIsImporting(false);
  };

  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].text = text;
    setQuestions(newQuestions);
  };

  const setCorrectOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === oIndex,
    }));
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert('Vui lòng thêm ít nhất 1 câu hỏi.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, duration, questions }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Lỗi khi tạo bài thi');
      }

      alert('Tạo bài thi thành công!');
      router.push('/dashboard/lecturer/quizzes');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-quiz-container animate-fade-in">
      <header className="page-header">
        <h1>Tạo Bài Kiểm Tra Mới</h1>
        <p className="subtitle">Thiết lập bài kiểm tra và ngân hàng câu hỏi của bạn.</p>
      </header>

      <form onSubmit={handleSave} className="quiz-form">
        <div className="form-sections-grid">
          <section className="glass-card settings-section">
            <h3>Cài Đặt Chung</h3>
            <div className="form-group">
              <label>Tên Bài Kiểm Tra</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Ví dụ: Giữa kì Toán học" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Mô tả nội dung bài thi..." 
              />
            </div>
            <div className="form-group">
              <label>Thời lượng (Phút)</label>
              <input 
                type="number" 
                value={duration} 
                onChange={(e) => setDuration(Number(e.target.value))} 
                required 
              />
            </div>
          </section>

          <section className="glass-card questions-section">
            <div className="section-header flex-between">
              <h3>Ngân Hàng Câu Hỏi ({questions.length})</h3>
              <div className="header-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsImporting(!isImporting)}
                >
                  {isImporting ? '✖ Hủy Nhập' : '📥 Nhập từ Text/Excel'}
                </button>
              </div>
            </div>

            {isImporting && (
              <div className="import-area animate-fade-in glass-card">
                <p className="help-text">Định dạng: Câu hỏi | Lựa chọn 1 | Lựa chọn 2 | Lựa chọn 3 | Đúng (1/2/3)</p>
                <textarea 
                  className="import-textarea"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Ví dụ: Thủ đô của Pháp? | Luân Đôn | Paris | Berlin | 2"
                />
                <div className="import-actions">
                  <button type="button" className="btn btn-primary" onClick={handleImport}>Xác nhận Nhập khẩu</button>
                </div>
              </div>
            )}

            <div className="questions-list">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="question-item glass-card">
                  <div className="question-item-header flex-between">
                    <span className="q-number">Câu hỏi {qIdx + 1}</span>
                    <button type="button" className="text-error btn-icon" onClick={() => removeQuestion(qIdx)}>🗑️</button>
                  </div>
                  <input
                    type="text"
                    className="question-text-input"
                    value={q.text}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    placeholder="Nhập nội dung câu hỏi..."
                    required
                  />
                  <div className="options-grid">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="option-row">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={opt.isCorrect}
                          onChange={() => setCorrectOption(qIdx, oIdx)}
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                          placeholder={`Lựa chọn ${oIdx + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <button 
                type="button" 
                className="btn btn-secondary w-full add-q-btn"
                onClick={addQuestion}
              >
                + Thêm Câu Hỏi Riêng Lẻ
              </button>
            </div>
          </section>
        </div>

        <div className="form-footer">
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Hủy bỏ</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Tạo Bài Kiểm Tra & Khởi Chạy'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .create-quiz-container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .page-header { margin-bottom: 2.5rem; }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .subtitle { color: var(--text-muted); }

        .form-sections-grid { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; align-items: start; }
        
        h3 { margin-bottom: 1.5rem; color: var(--primary); font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; }
        
        .form-group { margin-bottom: 1.5rem; }
        label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-muted); font-size: 0.9rem; }
        input, textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text);
          outline: none;
          transition: var(--transition);
        }
        input:focus { border-color: var(--primary); }
        
        .flex-between { display: flex; justify-content: space-between; align-items: center; }
        
        .questions-list { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem; }
        .question-item { padding: 1.5rem; border: 1px solid var(--border); }
        .q-number { font-weight: 800; font-size: 0.8rem; color: var(--text-muted); }
        .question-text-input { margin: 1rem 0; font-size: 1.1rem; font-weight: 600; border-bottom: 2px solid var(--border); border-top: 0; border-left: 0; border-right: 0; border-radius: 0; }
        
        .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .option-row { display: flex; align-items: center; gap: 0.75rem; background: rgba(255,255,255,0.03); padding: 0.5rem; border-radius: 8px; }
        .option-row input[type="text"] { border: none; padding: 0.5rem; background: transparent; }
        
        .import-area { margin-bottom: 2rem; border-color: var(--primary); background: rgba(99, 102, 241, 0.05); }
        .help-text { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; }
        .import-textarea { min-height: 150px; font-family: monospace; font-size: 0.9rem; margin-bottom: 1rem; }
        
        .add-q-btn { border: 2px dashed var(--border); padding: 1.5rem; background: transparent; }
        .add-q-btn:hover { border-color: var(--primary); color: var(--primary); }
        
        .form-footer {
          margin-top: 3rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }
        
        .btn-icon { background: none; border: none; cursor: pointer; font-size: 1.2rem; }
        .text-error { color: var(--error); }
        .w-full { width: 100%; }

        @media (max-width: 1024px) {
          .form-sections-grid { grid-template-columns: 1fr; }
          .options-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
