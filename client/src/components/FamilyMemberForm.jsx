import React from 'react';
import { UserPlus, Trash2, Users } from 'lucide-react';
import AadhaarInput from './AadhaarInput';

const FamilyMemberForm = ({ familyMembers, onChange }) => {
  const addMember = () => {
    onChange([
      ...familyMembers,
      { name: '', relation: 'Spouse', dateOfBirth: '', aadhaarNumber: '' }
    ]);
  };

  const removeMember = (index) => {
    if (familyMembers.length <= 1) return; // Keep head of household
    const updated = familyMembers.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateMember = (index, field, value) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-4 border-t border-slate-800 pt-5 mt-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Family Members Listed on Ration Card
          </h3>
          <p className="text-xs text-slate-400">Add all household members for entitlement calculation</p>
        </div>
        <button
          type="button"
          onClick={addMember}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold border border-blue-500/30 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add Member
        </button>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {familyMembers.map((member, index) => (
          <div key={index} className="glass-card p-4 rounded-xl border border-slate-800 space-y-3 relative group">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <span className="text-xs font-bold text-slate-300">
                Member #{index + 1} {index === 0 ? '(Head of Household)' : ''}
              </span>
              {familyMembers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full name as in Aadhaar"
                  value={member.name}
                  onChange={(e) => updateMember(index, 'name', e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Relation to Head</label>
                <select
                  value={member.relation}
                  onChange={(e) => updateMember(index, 'relation', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Self (Head)">Self (Head)</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={member.dateOfBirth ? member.dateOfBirth.slice(0, 10) : ''}
                  onChange={(e) => updateMember(index, 'dateOfBirth', e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <AadhaarInput
                label={`Member #${index + 1} Aadhaar Number`}
                value={member.aadhaarNumber}
                onChange={(val) => updateMember(index, 'aadhaarNumber', val)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyMemberForm;
