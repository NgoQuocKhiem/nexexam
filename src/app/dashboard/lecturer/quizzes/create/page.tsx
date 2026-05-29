'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

export default function CreateQuizPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [importText, setImportText] = useState('');
  const [whitelistText, setWhitelistText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // EXCEL PARSING: Students
  const handleStudentExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      // Assuming columns: Name | MSSV | Class
      const formatted = data
        .slice(1) // Skip header
        .filter(row => row.length >= 2)
        .map(row => `${row[0] || ''} | ${row[1] || ''} | ${row[2] || ''}`)
        .join('\n');

      setWhitelistText(prev => prev ? prev + '\n' + formatted : formatted);
      alert(`Đã nhập thành công ${data.length - 1} sinh viên từ Excel.`);
    };
    reader.readAsBinaryString(file);
  };

  // EXCEL PARSING: Questions
  const handleQuestionExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      // Assuming columns: Question | Opt1 | Opt2 | Opt3 | Opt4 | CorrectIndex (1-4)
      const newQuestions: Question[] = data
        .slice(1)
        .filter(row => row.length >= 3)
        .map((row, idx) => ({
          id: `xl-${Date.now()}-${idx}`,
          text: String(row[0]),
          options: [
            { text: String(row[1] || ''), isCorrect: Number(row[5]) === 1 },
            { text: String(row[2] || ''), isCorrect: Number(row[5]) === 2 },
            { text: String(row[3] || ''), isCorrect: Number(row[5]) === 3 },
            { text: String(row[4] || ''), isCorrect: Number(row[5]) === 4 },
          ].filter(opt => opt.text !== ''),
        }));

      setQuestions(prev => [...prev, ...newQuestions]);
      alert(`Đã nhập thành công ${newQuestions.length} câu hỏi từ Excel.`);
    };
    reader.readAsBinaryString(file);
  };

  const addQuestion = () => {
    const newQ: Question = {
      id: Date.now().toString(),
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ],
    };
    setQuestions([...questions, newQ]);
  };

  const handleSave = async () => {
    if (!title || questions.length === 0) {
      alert('Vui lòng nhập tên bài thi và ít nhất 1 câu hỏi.');
      return;
    }

    setLoading(true);
    try {
      const whitelist = whitelistText
        .split('\n')
        .filter((l) => l.trim().includes('|'))
        .map((line) => {
          const parts = line.split('|').map((p) => p.trim());
          return { name: parts[0], mssv: parts[1], class: parts[2] };
        });

      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, duration, questions, whitelist }),
      });

      if (res.ok) {
        alert('Tạo bài kiểm tra thành công!');
        router.push('/dashboard/lecturer/quizzes');
      } else {
        const error = await res.json();
        alert('Lỗi: ' + error.error);
      }
    } catch (error) {
      alert('Đã xảy ra lỗi khi lưu bài thi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-quiz-container animate-fade-in">
      <header className="page-header flex-between">
        <div>
          <Link href="/dashboard/lecturer/quizzes" className="back-link">← Quay lại</Link>
          <h1>Tạo Bài Kiểm Tra Mới</h1>
          <p className="subtitle">Thiết lập bài kiểm tra và ngân hàng câu hỏi của bạn.</p>
        </div>
        <button 
          className="btn btn-primary btn-large" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : 'Tạo Bài kiểm tra & Khởi chạy'}
        </button>
      </header>

      <div className="create-grid">
        <div className="settings-column">
          <section className="glass-card settings-section">
            <h3>Cài đặt Chung</h3>
            <div className="form-group">
              <label>Tên Bài Kiểm Tra</label>
              <input 
                type="text" 
                placeholder="Ví dụ: Giữa kỳ học Toán" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea 
                placeholder="Tổng quan nội dung..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Thời lượng (Phút)</label>
              <input 
                type="number" 
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          </section>

          <section className="glass-card settings-section">
            <div className="section-header flex-between">
              <h3>Danh sách sinh viên (Whitelist)</h3>
              <label className="btn btn-secondary btn-sm cursor-pointer">
                📥 Nhập từ Excel
                <input type="file" hidden accept=".xlsx, .xls, .csv" onChange={handleStudentExcel} />
              </label>
            </div>
            <p className="help-text">Định dạng: Họ tên | MSSV | Lớp</p>
            <textarea 
              className="whitelist-textarea"
              value={whitelistText}
              onChange={(e) => setWhitelistText(e.target.value)}
              placeholder="Nguyễn Văn A | 200123 | IT-01"
            />
          </section>
        </div>

        <div className="questions-column">
          <section className="glass-card questions-section">
            <div className="section-header flex-between">
              <h3>Ngân hàng Câu hỏi ({questions.length})</h3>
              <div className="header-actions">
                <label className="btn btn-secondary btn-sm cursor-pointer mr-2">
                  📥 Nhập từ Excel
                  <input type="file" hidden accept=".xlsx, .xls, .csv" onChange={handleQuestionExcel} />
                </label>
                <button className="btn btn-primary btn-sm" onClick={addQuestion}>+ Thêm Câu Hỏi Riêng</button>
              </div>
            </div>

            <div className="questions-list">
              {questions.length === 0 && <p className="empty-msg">Chưa có câu hỏi nào. Hãy thêm hoặc nhập từ Excel.</p>}
              {questions.map((q, qIdx) => (
                <div key={q.id} className="question-item glass-card">
                  <div className="q-header flex-between">
                    <span>Câu hỏi #{qIdx + 1}</span>
                    <button className="delete-btn" onClick={() => setQuestions(questions.filter(item => item.id !== q.id))}>🗑️</button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Nội dung câu hỏi..." 
                    value={q.text}
                    onChange={(e) => {
                      const newQs = [...questions];
                      newQs[qIdx].text = e.target.value;
                      setQuestions(newQs);
                    }}
                  />
                  <div className="options-grid">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="option-row">
                        <input 
                          type="radio" 
                          checked={opt.isCorrect} 
                          onChange={() => {
                            const newQs = [...questions];
                            newQs[qIdx].options.forEach((o, i) => o.isCorrect = i === oIdx);
                            setQuestions(newQs);
                          }}
                        />
                        <input 
                          type="text" 
                          placeholder={`Lựa chọn ${oIdx + 1}`} 
                          value={opt.text}
                          onChange={(e) => {
                            const newQs = [...questions];
                            newQs[qIdx].options[oIdx].text = e.target.value;
                            setQuestions(newQs);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .create-quiz-container { padding-bottom: 5rem; }
        .page-header { margin-bottom: 3rem; }
        .back-link { display: block; margin-bottom: 1rem; color: var(--primary); text-decoration: none; }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .subtitle { color: var(--text-muted); }

        .create-grid { display: grid; grid-template-columns: 400px 1fr; gap: 2rem; }
        
        .settings-section, .questions-section { padding: 2rem; margin-bottom: 2rem; }
        h3 { margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
        .form-group { margin-bottom: 1.5rem; }
        label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted); }
        input[type="text"], input[type="number"], textarea {
          width: 100%; padding: 0.8rem; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text);
        }
        .whitelist-textarea { min-height: 200px; font-family: monospace; font-size: 0.85rem; }
        
        .section-header { margin-bottom: 1.5rem; align-items: center; }
        .cursor-pointer { cursor: pointer; }
        .mr-2 { margin-right: 0.5rem; }
        .empty-msg { text-align: center; color: var(--text-muted); padding: 3rem; }

        .question-item { padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.1); }
        .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
        .option-row { display: flex; align-items: center; gap: 0.5rem; }
        
        .delete-btn { background: none; border: none; cursor: pointer; opacity: 0.5; transition: 0.2s; }
        .delete-btn:hover { opacity: 1; }

        @media (max-width: 1000px) {
          .create-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
