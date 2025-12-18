import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Save, AlertTriangle, User, Code, Briefcase, Cpu, Settings, Plus, X, Check, Globe, Map, FileText } from 'lucide-react';

interface ProfileConfigProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

type TabType = 'visual' | 'json';

const ProfileConfig: React.FC<ProfileConfigProps> = ({ profile, setProfile }) => {
  const [activeTab, setActiveTab] = useState<TabType>('visual');
  const [jsonInput, setJsonInput] = useState(JSON.stringify(profile, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    setJsonInput(JSON.stringify(profile, null, 2));
    setLocalProfile(profile);
  }, [profile]);

  const handleSave = (updatedProfile?: UserProfile) => {
    try {
      const toSave = updatedProfile || (activeTab === 'json' ? JSON.parse(jsonInput) : localProfile);
      setProfile(toSave);
      setError(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setError("Invalid JSON syntax. Please check your manual edits.");
    }
  };

  const updatePersonalInfo = (field: keyof UserProfile['personal_info'], value: string) => {
    setLocalProfile(prev => ({
      ...prev,
      personal_info: { ...prev.personal_info, [field]: value }
    }));
  };

  const updatePreferences = (field: keyof UserProfile['preferences'], value: any) => {
    setLocalProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
  };

  const addListItem = (key: 'desired_roles' | 'must_have' | 'nice_to_have', value: string) => {
    if (!value.trim()) return;
    setLocalProfile(prev => {
      if (key === 'desired_roles') {
        return { ...prev, desired_roles: [...prev.desired_roles, value.trim()] };
      }
      return {
        ...prev,
        skills: { ...prev.skills, [key]: [...prev.skills[key], value.trim()] }
      };
    });
  };

  const removeListItem = (key: 'desired_roles' | 'must_have' | 'nice_to_have', index: number) => {
    setLocalProfile(prev => {
      if (key === 'desired_roles') {
        return { ...prev, desired_roles: prev.desired_roles.filter((_, i) => i !== index) };
      }
      return {
        ...prev,
        skills: { ...prev.skills, [key]: prev.skills[key].filter((_, i) => i !== index) }
      };
    });
  };

  const TagInput = ({ label, items, onAdd, onRemove, colorClass }: any) => {
    const [val, setVal] = useState('');
    return (
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((item: string, i: number) => (
            <span key={i} className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm border ${colorClass}`}>
              <span>{item}</span>
              <button onClick={() => onRemove(i)} className="hover:text-white transition-colors">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input 
            type="text" 
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (onAdd(val), setVal(''))}
            placeholder={`Add ${label.toLowerCase()}...`}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button onClick={() => { onAdd(val); setVal(''); }} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700">
            <Plus size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Configuration Profile</h2>
          <p className="text-slate-400 text-sm mt-1">Refine your persona and skills to help Gemini find the perfect match.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button onClick={() => setActiveTab('visual')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'visual' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Visual Editor</button>
            <button onClick={() => setActiveTab('json')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'json' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Source Editor</button>
          </div>
          <button onClick={() => handleSave()} className={`px-6 py-2.5 rounded-lg font-bold flex items-center space-x-2 transition-all ${saveSuccess ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
            {saveSuccess ? <Check size={18} /> : <Save size={18} />}
            <span>{saveSuccess ? 'Changes Saved!' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'visual' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center space-x-3 text-blue-400 border-b border-slate-800 pb-4">
                <User size={20} />
                <h3 className="font-bold text-lg text-white">Identity & Contact</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input type="text" value={localProfile.personal_info.name} onChange={(e) => updatePersonalInfo('name', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                    <input type="email" value={localProfile.personal_info.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
                    <FileText size={12} />
                    <span>Master CV Source (Attachable)</span>
                  </label>
                  <input 
                    type="text" 
                    value={localProfile.personal_info.cv_name || ''} 
                    onChange={(e) => updatePersonalInfo('cv_name', e.target.value)} 
                    placeholder="e.g. Diluksha_Perera_CV.pdf"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                  <p className="text-[10px] text-slate-500 mt-1">This file will be automatically attached to outbound applications.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-6">
               <div className="flex items-center space-x-3 text-teal-400 border-b border-slate-800 pb-4">
                <Settings size={20} />
                <h3 className="font-bold text-lg text-white">Job Preferences</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Min Monthly Salary</label>
                    <input type="number" value={localProfile.preferences.salary_min} onChange={(e) => updatePreferences('salary_min', parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Currency</label>
                    <input type="text" value={localProfile.preferences.currency} onChange={(e) => updatePreferences('currency', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Work Mode</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['remote', 'hybrid', 'onsite', 'any'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updatePreferences('work_mode', mode)}
                        className={`py-2 rounded-lg text-xs font-bold uppercase transition-all border ${
                          localProfile.preferences.work_mode === mode 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-6">
               <div className="flex items-center space-x-3 text-purple-400 border-b border-slate-800 pb-4">
                <Cpu size={20} />
                <h3 className="font-bold text-lg text-white">Tech Stack</h3>
              </div>
              <TagInput label="Must Have Skills" items={localProfile.skills.must_have} onAdd={(v: string) => addListItem('must_have', v)} onRemove={(i: number) => removeListItem('must_have', i)} colorClass="bg-green-900/20 text-green-300 border-green-800/50" />
              <TagInput label="Nice to Have Skills" items={localProfile.skills.nice_to_have} onAdd={(v: string) => addListItem('nice_to_have', v)} onRemove={(i: number) => removeListItem('nice_to_have', i)} colorClass="bg-blue-900/20 text-blue-300 border-blue-800/50" />
            </div>
            
            <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-6">
               <div className="flex items-center space-x-3 text-amber-400 border-b border-slate-800 pb-4">
                <Briefcase size={20} />
                <h3 className="font-bold text-lg text-white">Desired Roles</h3>
              </div>
              <TagInput label="Target Job Titles" items={localProfile.desired_roles} onAdd={(v: string) => addListItem('desired_roles', v)} onRemove={(i: number) => removeListItem('desired_roles', i)} colorClass="bg-amber-900/20 text-amber-300 border-amber-800/50" />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col space-y-4">
            <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-6 font-mono text-sm text-slate-300 outline-none resize-none custom-scrollbar" spellCheck={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileConfig;