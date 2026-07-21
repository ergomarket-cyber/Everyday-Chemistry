'use client';

import React, { useState } from 'react';
import { Upload, X, Check, Save, Loader2, AlertCircle } from 'lucide-react';

interface ParsedQuestion {
  questionText: string;
  markSchemeText: string;
  maxMarks: number;
  suggestedSubtopicId: string;
}

export default function ExamParser({ topics }: { topics: any[] }) {
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [markschemeFile, setMarkschemeFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const subtopics = topics.flatMap(t => t.subtopics);

  const handleParse = async () => {
    if (!paperFile || !markschemeFile) {
      setError('Please select both a Past Paper PDF and a Mark Scheme PDF.');
      return;
    }

    setError('');
    setIsParsing(true);
    setParsedQuestions(null);

    try {
      const formData = new FormData();
      formData.append('paper', paperFile);
      formData.append('markscheme', markschemeFile);

      const res = await fetch('/api/parse-paper', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse');

      setParsedQuestions(data.questions);
    } catch (err: any) {
      setError(err.message || 'An error occurred during parsing.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async () => {
    if (!parsedQuestions || parsedQuestions.length === 0) return;

    setIsSaving(true);
    setError('');

    try {
      const validQuestions = parsedQuestions.filter(q => q.questionText && q.markSchemeText && q.suggestedSubtopicId);
      
      const res = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: validQuestions }),
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
      <h2 className="text-2xl font-bold text-white mb-4">AI PDF Parser</h2>
      <p className="text-slate-400 mb-6 text-sm">Upload an Edexcel 4CH1 Past Paper and its Mark Scheme. Gemini will automatically extract the questions, match them with the correct answers, and suggest the appropriate topic.</p>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {!parsedQuestions ? (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-300">1. Past Paper (PDF)</label>
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
              className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 cursor-pointer"
            />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-300">2. Mark Scheme (PDF)</label>
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => setMarkschemeFile(e.target.files?.[0] || null)}
              className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer"
            />
          </div>
          <div className="md:col-span-2">
            <button 
              onClick={handleParse}
              disabled={isParsing || !paperFile || !markschemeFile}
              className="w-full py-4 bg-white text-black hover:bg-slate-200 rounded-2xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isParsing ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Parsing with Gemini AI...
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

          <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
            {parsedQuestions.map((q, idx) => (
              <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-5 relative">
                <button 
                  onClick={() => removeQuestion(idx)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors bg-white/5 rounded-full p-1"
                  title="Remove this question"
                >
                  <X size={16} />
                </button>

                <div className="grid md:grid-cols-2 gap-4 mb-4 pr-8">
                  <div>
                    <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Question Text</label>
                    <textarea 
                      value={q.questionText}
                      onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-200 min-h-[100px] focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Mark Scheme / Answer</label>
                    <textarea 
                      value={q.markSchemeText}
                      onChange={(e) => updateQuestion(idx, 'markSchemeText', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-emerald-400 min-h-[100px] focus:border-emerald-500 outline-none"
                    />
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
