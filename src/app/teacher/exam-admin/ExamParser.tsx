'use client';

import React, { useState } from 'react';
import { Upload, X, Check, Save, Loader2, AlertCircle, Plus } from 'lucide-react';

interface ParsedQuestion {
  questionText: string;
  questionImgUrl?: string;
  markSchemeText: string;
  markSchemeImgUrl?: string;
  maxMarks: number;
  suggestedSubtopicId: string;
}

export default function ExamParser({ topics, pastPapers: initialPastPapers }: { topics: any[], pastPapers: any[] }) {
  const [paperUrl, setPaperUrl] = useState('');
  const [markschemeUrl, setMarkschemeUrl] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Paper Selection State
  const [pastPapers, setPastPapers] = useState(initialPastPapers);
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [isCreatingPaper, setIsCreatingPaper] = useState(false);
  const [newPaperYear, setNewPaperYear] = useState(new Date().getFullYear());
  const [newPaperMonth, setNewPaperMonth] = useState('June');
  const [newPaperRef, setNewPaperRef] = useState('');

  const handleCreatePaper = async () => {
    try {
      const res = await fetch('/api/past-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: newPaperYear, month: newPaperMonth, reference: newPaperRef })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setPastPapers([data, ...pastPapers]);
      setSelectedPaperId(data.id);
      setIsCreatingPaper(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create paper');
    }
  };

  const handleParse = async () => {
    if (!paperUrl || !markschemeUrl) {
      setError('Please paste Google Drive links for both the Past Paper and Mark Scheme.');
      return;
    }
    if (!selectedPaperId) {
      setError('Please select or create a Past Paper first.');
      return;
    }

    setError('');
    setIsParsing(true);
    setParsedQuestions(null);

    try {
      const res = await fetch('/api/parse-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperUrl, markschemeUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse');

      setParsedQuestions(data.questions.map((q: any) => ({...q, questionImgUrl: '', markSchemeImgUrl: ''})));
    } catch (err: any) {
      setError(err.message || 'An error occurred during parsing.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async () => {
    if (!parsedQuestions || parsedQuestions.length === 0 || !selectedPaperId) return;

    setIsSaving(true);
    setError('');

    try {
      // Validate
      const validQuestions = parsedQuestions.filter(q => (q.questionText || q.questionImgUrl) && q.suggestedSubtopicId);
      
      // Auto-format Google Drive Links just in case
      const formatGoogleDriveLink = (url: string) => {
        if (!url) return url;
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
        if (match && match[1]) {
          return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
        return url;
      };

      const finalQuestions = validQuestions.map(q => ({
        ...q,
        paperId: selectedPaperId,
        questionImgUrl: formatGoogleDriveLink(q.questionImgUrl || ''),
        markSchemeImgUrl: formatGoogleDriveLink(q.markSchemeImgUrl || '')
      }));
      
      const res = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: finalQuestions }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save questions');

      alert(`Successfully saved ${data.count} questions!`);
      setParsedQuestions(null);
      setPaperFile(null);
      setMarkschemeFile(null);
      
      // Force reload the page to see the new questions
      window.location.reload();

    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeQuestion = (index: number) => {
    setParsedQuestions(prev => prev ? prev.filter((_, i) => i !== index) : null);
  };

  const updateQuestion = (index: number, field: keyof ParsedQuestion, value: string | number) => {
    setParsedQuestions(prev => {
      if (!prev) return null;
      const newQ = [...prev];
      newQ[index] = { ...newQ[index], [field]: value };
      return newQ;
    });
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">AI PDF Parser & Metadata</h2>
      <p className="text-slate-400 mb-6 text-sm">Upload an Edexcel 4CH1 Past Paper, assign it to a Paper Reference, and add optional Image URLs. (Google Drive links will be automatically formatted for you!)</p>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Paper Metadata Selection */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-5 mb-6">
        <label className="text-sm font-bold text-slate-300 block mb-3">Past Paper Reference</label>
        
        {isCreatingPaper ? (
          <div className="flex gap-4 items-end">
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Year</label>
              <input type="number" value={newPaperYear} onChange={e => setNewPaperYear(Number(e.target.value))} className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Month</label>
              <input type="text" placeholder="June" value={newPaperMonth} onChange={e => setNewPaperMonth(e.target.value)} className="w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Reference (e.g. 4CH1/1C)</label>
              <input type="text" value={newPaperRef} onChange={e => setNewPaperRef(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
            </div>
            <button onClick={handleCreatePaper} className="bg-emerald-500 text-slate-950 font-bold px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-400 transition-colors">
              <Check size={18} /> Save Paper
            </button>
            <button onClick={() => setIsCreatingPaper(false)} className="bg-white/10 text-white font-bold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <select 
              value={selectedPaperId}
              onChange={(e) => setSelectedPaperId(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
            >
              <option value="">-- Select a Past Paper --</option>
              {pastPapers.map(p => (
                <option key={p.id} value={p.id}>{p.year} {p.month} - {p.reference}</option>
              ))}
            </select>
            <button onClick={() => setIsCreatingPaper(true)} className="bg-white/10 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors">
              <Plus size={18} /> Create New
            </button>
          </div>
        )}
      </div>

      {!parsedQuestions ? (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-300">1. Past Paper — Google Drive Link</label>
            <input 
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={paperUrl}
              onChange={(e) => setPaperUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-blue-300 focus:border-emerald-500 outline-none placeholder:text-slate-600"
            />
            <p className="text-xs text-slate-500">Откройте PDF на Google Drive → Поделиться → Скопировать ссылку</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-300">2. Mark Scheme — Google Drive Link</label>
            <input 
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={markschemeUrl}
              onChange={(e) => setMarkschemeUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-blue-300 focus:border-blue-500 outline-none placeholder:text-slate-600"
            />
            <p className="text-xs text-slate-500">Откройте Mark Scheme на Google Drive → Поделиться → Скопировать ссылку</p>
          </div>
          <div className="md:col-span-2">
            <button 
              onClick={handleParse}
              disabled={isParsing || !paperUrl || !markschemeUrl || !selectedPaperId}
              className="w-full py-4 bg-white text-black hover:bg-slate-200 rounded-2xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isParsing ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Parsing with Gemini AI... (may take ~30s)
                </>
              ) : (
                <>
                  <Upload size={24} />
                  Parse Exam Papers
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-emerald-500/20 text-emerald-400 p-4 rounded-2xl border border-emerald-500/30">
            <p className="font-bold">🎉 Extracted {parsedQuestions.length} questions successfully!</p>
            <button 
              onClick={() => setParsedQuestions(null)}
              className="text-sm font-bold hover:text-white transition-colors"
            >
              Start Over
            </button>
          </div>

          <div className="max-h-[800px] overflow-y-auto space-y-6 pr-2">
            {parsedQuestions.map((q, idx) => (
              <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-5 relative">
                <button 
                  onClick={() => removeQuestion(idx)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors bg-white/5 rounded-full p-1"
                  title="Remove this question"
                >
                  <X size={16} />
                </button>

                <div className="grid md:grid-cols-2 gap-6 mb-4 pr-8">
                  {/* Question Column */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Question Text</label>
                      <textarea 
                        value={q.questionText}
                        onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-200 min-h-[100px] focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Question Image URL (Optional)</label>
                      <input 
                        type="text"
                        placeholder="https://drive.google.com/... or any image link"
                        value={q.questionImgUrl || ''}
                        onChange={(e) => updateQuestion(idx, 'questionImgUrl', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-blue-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Markscheme Column */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Mark Scheme / Answer</label>
                      <textarea 
                        value={q.markSchemeText}
                        onChange={(e) => updateQuestion(idx, 'markSchemeText', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-emerald-400 min-h-[100px] focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Mark Scheme Image URL (Optional)</label>
                      <input 
                        type="text"
                        placeholder="https://drive.google.com/... or any image link"
                        value={q.markSchemeImgUrl || ''}
                        onChange={(e) => updateQuestion(idx, 'markSchemeImgUrl', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-blue-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Assign to Subtopic</label>
                    <select 
                      value={q.suggestedSubtopicId || ''}
                      onChange={(e) => updateQuestion(idx, 'suggestedSubtopicId', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                    >
                      <option value="">-- Select Subtopic --</option>
                      {topics.map(topic => (
                        <optgroup key={topic.id} label={topic.name}>
                          {topic.subtopics.map((sub: any) => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Max Marks</label>
                    <input 
                      type="number"
                      min="1"
                      value={q.maxMarks}
                      onChange={(e) => updateQuestion(idx, 'maxMarks', parseInt(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving || parsedQuestions.length === 0}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Saving to Database...
              </>
            ) : (
              <>
                <Save size={24} />
                Save All Approved Questions
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
