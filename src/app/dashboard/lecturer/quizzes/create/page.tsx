'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateQuizPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  const handleImport = () => {
    // Basic parser for: Question text | Option A | Option B | Option C | Correct (A,B,C)
    // Example: Capital of France?|London|Paris|Berlin|B
    const lines = importText.split('\n').filter(l => l.trim() !== '');
    alert(`Parsed ${lines.length} questions from text!`);
    setIsImporting(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save to API
    alert('Quiz created successfully!');
    router.push('/dashboard/lecturer/quizzes');
  };

  return (
    <div className="create-quiz-container animate-fade-in">
      <header className="page-header">
        <h1>Create New Quiz</h1>
        <p className="subtitle">Configure your examination and question bank.</p>
      </header>

      <form onSubmit={handleSave} className="quiz-form">
        <div className="form-sections-grid">
          <section className="glass-card settings-section">
            <h3>General Settings</h3>
            <div className="form-group">
              <label>Quiz Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., CS101 Final Exam" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief overview of the quiz contents..." />
            </div>
            <div className="form-group">
              <label>Duration (Minutes)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
            </div>
          </section>

          <section className="glass-card questions-section">
            <div className="section-header flex-between">
              <h3>Question Bank</h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsImporting(true)}
              >
                📥 Import from Text/Excel
              </button>
            </div>

            {isImporting ? (
              <div className="import-area animate-fade-in">
                <p className="help-text">Format: Question | Option 1 | Option 2 | Option 3 | Correct(1/2/3)</p>
                <textarea 
                  className="import-textarea"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Example: Capital of France? | London | Paris | Berlin | 2"
                />
                <div className="import-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsImporting(false)}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={handleImport}>Confirm Import</button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>No questions added yet.</p>
                <button type="button" className="btn btn-secondary">+ Add Individual Question</button>
              </div>
            )}
          </section>
        </div>

        <div className="form-footer">
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary">Create Quiz & Launch</button>
        </div>
      </form>

      <style jsx>{`
        .page-header { margin-bottom: 2.5rem; }
        h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .subtitle { color: var(--text-muted); }

        .form-sections-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; margin-bottom: 2rem; }
        
        h3 { margin-bottom: 1.5rem; color: var(--primary); font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; }
        
        .form-group { margin-bottom: 1.5rem; text-align: left; }
        label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-muted); }
        input, textarea {
          width: 100%;
          padding: 0.85rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text);
        }
        
        .flex-between { display: flex; justify-content: space-between; align-items: center; }
        
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          color: var(--text-muted);
        }
        .empty-state p { margin-bottom: 1.5rem; }
        
        .import-area { display: flex; flex-direction: column; gap: 1rem; }
        .help-text { font-size: 0.8rem; color: var(--text-muted); }
        .import-textarea { min-height: 250px; font-family: monospace; font-size: 0.9rem; }
        .import-actions { display: flex; justify-content: flex-end; gap: 1rem; }
        
        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1.5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }

        @media (max-width: 1024px) {
          .form-sections-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
