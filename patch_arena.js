const fs = require('fs');
let code = fs.readFileSync('src/app/voting/Arena.tsx', 'utf8');

// 1. Add editingTeam state to Arena
code = code.replace(
  'const [playingId, setPlayingId] = useState<string | null>(null);',
  'const [playingId, setPlayingId] = useState<string | null>(null);\n  const [editingTeam, setEditingTeam] = useState<any>(null);'
);

// 2. Add EditTeamModal inside Arena's return, right before the last closing div of Arena component (which is line 199)
// The end of Arena component looks like:
//         </div>
//       </div>
//     </div>
//   );
// }
code = code.replace(
  `        </div>
      </div>
    </div>
  );
}`,
  `        </div>
      </div>
      {editingTeam && <EditTeamModal team={editingTeam} onClose={() => setEditingTeam(null)} students={editingTeam.grade === 10 ? students10 : students11} currentUser={currentUser} />}
    </div>
  );
}`
);

// 3. Remove EditTeamModal from TeamCard, pass onEdit instead, and remove isEditing state.
code = code.replace(
  'function TeamCard({ team, isPlaying, onPlay, votes, onVote, currentUser }: any) {',
  'function TeamCard({ team, isPlaying, onPlay, votes, onVote, currentUser, onEdit }: any) {'
);

code = code.replace(
  '  const [isEditing, setIsEditing] = useState(false);\n',
  ''
);

code = code.replace(
  `      {isEditing && (
        <EditTeamModal team={team} onClose={() => setIsEditing(false)} />
      )}`,
  ''
);

code = code.replace(
  `              <button 
                onClick={() => setIsEditing(true)}`,
  `              <button 
                onClick={() => onEdit(team)}`
);

// 4. In Arena, pass onEdit to TeamCard
code = code.replace(
  `            onVote={handleVote}
            currentUser={currentUser}
          />`,
  `            onVote={handleVote}
            currentUser={currentUser}
            onEdit={setEditingTeam}
          />`
);

// 5. Update EditTeamModal to receive students and currentUser, add team member selection
// function EditTeamModal({ team, onClose }: any) -> function EditTeamModal({ team, onClose, students, currentUser }: any)
code = code.replace(
  'function EditTeamModal({ team, onClose }: any) {',
  'function EditTeamModal({ team, onClose, students, currentUser }: any) {'
);

code = code.replace(
  'const [isSaving, setIsSaving] = useState(false);',
  `const [isSaving, setIsSaving] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const unassignedStudents = students?.filter((s: any) => !s.teamId || s.teamId === team.id) || [];
  
  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(prev => prev.filter(m => m !== id));
    } else if (selectedMembers.length < 7) {
      setSelectedMembers(prev => [...prev, id]);
    }
  };`
);

const handleSaveStr = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: team.id, ...formData })
      });
      
      let recruitOk = true;
      if (!team.isRosterLocked && selectedMembers.length > 0) {
        const recruitRes = await fetch('/api/team/recruit', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ teamId: team.id, studentIds: selectedMembers, captainId: currentUser.id })
        });
        if (!recruitRes.ok) {
           recruitOk = false;
        }
      }

      if (res.ok && recruitOk) {
        window.location.reload(); // Refresh to see changes
      } else {
        alert('Failed to save profile or members');
      }
    } catch (err) {
      alert('Error saving');
    } finally {
      setIsSaving(false);
    }
  };`;

// we need to replace the old handleSubmit
code = code.replace(
  /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsSaving\(false\);\s*\}\s*\};\s*/,
  handleSaveStr + '\n\n'
);

// Add the roster selection UI to the form if !team.isRosterLocked
const rosterSelectionUI = `            {!team.isRosterLocked && (
              <div className="pt-4 border-t border-white/10 mt-2">
                <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Recruit Team Members (Max 7)</label>
                <div className="flex flex-wrap gap-2">
                  {unassignedStudents.map((s: any) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleMember(s.id)}
                      className={\`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 \${selectedMembers.includes(s.id) ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}\`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                {unassignedStudents.length === 0 && <p className="text-sm text-slate-500 italic">No available students found.</p>}
              </div>
            )}`;

code = code.replace(
  '            <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">',
  rosterSelectionUI + '\n            <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">'
);

fs.writeFileSync('src/app/voting/Arena.tsx', code);
console.log("Patched Arena.tsx successfully");
