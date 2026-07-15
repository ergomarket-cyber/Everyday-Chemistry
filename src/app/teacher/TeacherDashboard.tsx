'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Key, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard({ initialTeams, roster, simpleTeams }: any) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [teams, setTeams] = useState(initialTeams);
  const [currentRoster, setCurrentRoster] = useState(roster);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'evaluations' | 'roster'>('evaluations');
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'CHEM2026') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const updateScore = (teamId: string, field: 'contentScore' | 'accuracyScore', value: number) => {
    setTeams((prev: any) => 
      prev.map((t: any) => t.id === teamId ? { ...t, [field]: value } : t)
    );
  };

  const handleSave = async (teamId: string) => {
    setSaving(prev => ({ ...prev, [teamId]: true }));
    try {
      const team = teams.find((t: any) => t.id === teamId);
      const res = await fetch('/api/teacher-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          contentScore: team.contentScore,
          accuracyScore: team.accuracyScore
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      
      alert('Saved successfully!');
    } catch (err) {
      alert('Error saving');
    } finally {
      setSaving(prev => ({ ...prev, [teamId]: false }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-xl space-y-4">
          <h1 className="text-2xl font-bold text-white text-center">Teacher Login</h1>
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-800 text-white p-3 rounded"
          />
          <button type="submit" className="w-full bg-purple-600 text-white p-3 rounded font-bold hover:bg-purple-500 transition">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-purple-400">Teacher Dashboard</h1>
          <a href="/" className="text-slate-400 hover:text-white underline">Back to Arena</a>
        </div>

        <div className="flex gap-4 border-b border-slate-800 pb-2">
          <button 
            onClick={() => setActiveTab('evaluations')}
            className={`font-bold pb-2 border-b-2 transition-colors ${activeTab === 'evaluations' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Evaluations & Votes
          </button>
          <button 
            onClick={() => setActiveTab('roster')}
            className={`font-bold pb-2 border-b-2 transition-colors ${activeTab === 'roster' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Student Roster
          </button>
        </div>

        {activeTab === 'evaluations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team: any) => (
            <div key={team.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-xl">
              <div>
                <h2 className="text-xl font-bold">{team.song}</h2>
                <p className="text-slate-400">{team.name} (Grade {team.grade})</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold">Content Score (0-5)</label>
                  <input 
                    type="number" 
                    min="0" max="5" 
                    value={team.contentScore}
                    onChange={(e) => updateScore(team.id, 'contentScore', parseInt(e.target.value) || 0)}
                    className="bg-slate-800 text-white w-20 p-2 rounded text-center font-bold"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold">Scientific Accuracy (0-5)</label>
                  <input 
                    type="number" 
                    min="0" max="5" 
                    value={team.accuracyScore}
                    onChange={(e) => updateScore(team.id, 'accuracyScore', parseInt(e.target.value) || 0)}
                    className="bg-slate-800 text-white w-20 p-2 rounded text-center font-bold"
                  />
                </div>
              </div>

              <button 
                onClick={() => handleSave(team.id)}
                disabled={saving[team.id]}
                className="w-full bg-pink-600 hover:bg-pink-500 text-white p-3 rounded font-bold transition disabled:opacity-50"
              >
                {saving[team.id] ? 'Saving...' : 'Save Teacher Scores'}
              </button>
              
              {/* Detailed Student Votes */}
              <div className="pt-4 mt-4 border-t border-slate-700">
                <h3 className="text-sm font-bold text-slate-400 mb-2">Student Votes ({team.votesDetails?.length || 0})</h3>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
                  {team.votesDetails && team.votesDetails.length > 0 ? (
                    team.votesDetails.map((v: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-300 font-medium">{v.studentName}</span>
                        <div className="flex gap-3">
                          <span className="text-cyan-400">Sci: {v.scienceScore}</span>
                          <span className="text-orange-400">Bng: {v.bangerScore}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No votes yet</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {activeTab === 'roster' && (() => {
          const filteredRoster = roster.filter((s: any) => {
            if (filterGrade !== 'all' && s.grade.toString() !== filterGrade) return false;
            if (filterRole === 'captain' && !s.isCaptain) return false;
            if (filterRole === 'member' && s.isCaptain) return false;
            return true;
          });

          return (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
              <div className="flex gap-4 items-center">
                <Filter className="w-5 h-5 text-slate-400" />
                <select 
                  value={filterGrade}
                  onChange={e => setFilterGrade(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 outline-none focus:border-purple-500 text-sm"
                >
                  <option value="all">All Grades</option>
                  <option value="10">10th Grade</option>
                  <option value="11">11th Grade</option>
                </select>
                <select 
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 outline-none focus:border-purple-500 text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="captain">Captains Only</option>
                  <option value="member">Members Only</option>
                </select>
              </div>
              <button 
                onClick={() => setIsAddingStudent(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Student
              </button>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="p-4 font-semibold">Student Name</th>
                    <th className="p-4 font-semibold">Grade</th>
                    <th className="p-4 font-semibold">Team</th>
                    <th className="p-4 font-semibold text-center">Role</th>
                    <th className="p-4 font-semibold text-center">PIN</th>
                    <th className="p-4 font-semibold text-center">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredRoster.map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-medium">{student.name}</td>
                      <td className="p-4 text-slate-400">{student.grade}</td>
                      <td className="p-4 text-slate-300">{student.teamName}</td>
                      <td className="p-4 text-center">
                        {student.isCaptain ? <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-bold border border-purple-500/30">Captain</span> : <span className="text-slate-500 text-xs">Member</span>}
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-mono text-slate-400 text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">{student.pin || '????'}</span>
                      </td>
                      <td className="p-4 text-center">
                        {student.hasVoted ? <span className="text-emerald-400 font-bold text-xs">Voted</span> : <span className="text-rose-400 font-bold text-xs">Waiting</span>}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => setEditingStudent(student)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRoster.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">No students match the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )
        })()}
      </div>

      {(editingStudent || isAddingStudent) && (
        <StudentModal 
          student={editingStudent} 
          teams={simpleTeams}
          onSuccess={() => {
            setEditingStudent(null);
            setIsAddingStudent(false);
            router.refresh();
          }}
          onClose={() => {
            setEditingStudent(null);
            setIsAddingStudent(false);
          }}
        />
      )}
    </div>
  );
}

function StudentModal({ student, teams, onSuccess, onClose }: any) {
  const isEditing = !!student;
  const [formData, setFormData] = useState({
    name: student?.name || '',
    grade: student?.grade || 10,
    teamId: student?.teamId || (teams && teams.length > 0 ? teams[0].id : ''),
    isCaptain: student?.isCaptain || false,
    pin: student?.pin || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/students', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { id: student.id, ...formData } : formData)
      });
      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (err) {
      alert('Error saving student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${student.name}? This will also delete their votes.`)) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch('/api/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id })
      });
      if (res.ok) {
        onSuccess();
      } else {
        alert('Failed to delete student');
      }
    } catch (err) {
      alert('Error deleting student');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-white">{isEditing ? 'Edit Student' : 'Add Student'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Full Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500" 
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Grade</label>
                <select 
                  value={formData.grade} 
                  onChange={(e) => {
                    const newGrade = parseInt(e.target.value);
                    const availableTeams = teams?.filter((t: any) => t.grade === newGrade);
                    setFormData({
                      ...formData, 
                      grade: newGrade,
                      teamId: availableTeams?.length > 0 ? availableTeams[0].id : ''
                    });
                  }}
                  className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500" 
                >
                  <option value={10}>10th Grade</option>
                  <option value={11}>11th Grade</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">PIN Code</label>
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="Auto-gen"
                  value={formData.pin} 
                  onChange={(e) => setFormData({...formData, pin: e.target.value})}
                  className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 font-mono" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Team</label>
              <select 
                value={formData.teamId} 
                onChange={(e) => setFormData({...formData, teamId: e.target.value})}
                className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500" 
              >
                {teams?.filter((t: any) => t.grade === formData.grade).map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.grade})</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 p-4 bg-slate-800 border border-white/5 rounded-xl cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.isCaptain} 
                onChange={(e) => setFormData({...formData, isCaptain: e.target.checked})}
                className="w-5 h-5 rounded border-slate-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-800 bg-slate-700" 
              />
              <span className="text-sm font-bold text-slate-300">Is Team Captain? 👑</span>
            </label>

            <div className="flex gap-3 pt-6 mt-6 border-t border-white/10">
              {isEditing && (
                <button 
                  type="button" 
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
                  className="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl font-bold transition-colors border border-rose-500/30 flex items-center justify-center"
                  title="Delete Student"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white transition-colors"
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                disabled={isSaving || isDeleting}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition-colors shadow-lg shadow-purple-500/20"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
