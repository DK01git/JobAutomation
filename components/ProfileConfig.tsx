
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Save, User, Code, Briefcase, Cpu, Settings, Plus, X, Check, FileText, Globe, Key, Zap, Info, ShieldAlert, Copy, Link, Terminal, ExternalLink, HelpCircle, AlertCircle, Cloud } from 'lucide-react';

interface ProfileConfigProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

type TabType = 'visual' | 'json';

const ProfileConfig: React.FC<ProfileConfigProps> = ({ profile, setProfile }) => {
  const [activeTab, setActiveTab] = useState<TabType>('visual');
  const [jsonInput, setJsonInput] = useState(JSON.stringify(profile, null, 2));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // ULTIMATE GAS SCRIPT: Generates PDF from text and searches Drive for CV
  const gasScriptCode = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var attachments = [];
    
    // 1. ATTACH CV: Search Drive for the filename provided in Profile
    if (data.attachments && data.attachments.length > 0) {
      for (var i = 0; i < data.attachments.length; i++) {
        var files = DriveApp.getFilesByName(data.attachments[i]);
        if (files.hasNext()) {
          attachments.push(files.next().getBlob());
        }
      }
    }

    // 2. ATTACH COVER LETTER: Convert AI text to PDF on-the-fly
    if (data.coverLetter && data.coverLetter.length > 10) {
      // Use HTML conversion for professional formatting
      var html = "<div style='font-family: Arial, sans-serif; padding: 40px; line-height: 1.5; color: #333;'>" + 
                 data.coverLetter.replace(/\\n/g, "<br>") + 
                 "</div>";
      var clBlob = Utilities.newBlob(html, "text/html", "Cover_Letter.html")
                           .getAs("application/pdf")
                           .setName("Cover_Letter.pdf");
      attachments.push(clBlob);
    }

    // 3. DISPATCH: Send email with all cloud-gathered attachments
    GmailApp.sendEmail(data.to, data.subject, data.body, {
      attachments: attachments,
      name: "AutoApply Orchestrator"
    });

    return ContentService.createTextOutput(JSON.stringify({"status":"success", "attached_count": attachments.length}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (f) {
    return ContentService.createTextOutput(JSON.stringify({"status":"error", "details": f.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  useEffect(() => {
    setJsonInput(JSON.stringify(profile, null, 2));
    setLocalProfile(profile);
  }, [profile]);

  const handleSave = (updatedProfile?: UserProfile) => {
    try {
      const toSave = updatedProfile || (activeTab === 'json' ? JSON.parse(jsonInput) : localProfile);
      setProfile(toSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert("Invalid JSON syntax.");
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

  const handleCopyScript = () => {
    navigator.clipboard.writeText(gasScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const addListItem = (key: 'desired_roles' | 'must_have' | 'nice_to_have', value: string) => {
    if (!value.trim()) return;
    setLocalProfile(prev => {
      if (key === 'desired_roles') return { ...prev, desired_roles: [...prev.desired_roles, value.trim()] };
      return { ...prev, skills: { ...prev.skills, [key]: [...prev.skills[key as 'must_have' | 'nice_to_have'], value.trim()] } };
    });
  };

  const removeListItem = (key: 'desired_roles' | 'must_have' | 'nice_to_have', index: number) => {
    setLocalProfile(prev => {
      if (key === 'desired_roles') return { ...prev, desired_roles: prev.desired_roles.filter((_, i) => i !== index) };
      return { ...prev, skills: { ...prev.skills, [key]: prev.skills[key as 'must_have' | 'nice_to_have'].filter((_, i) => i !== index) } };
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Agent Profile & Intelligence</h2>
          <p className="text-slate-400 text-sm mt-1">Configure your orchestrator identity and autonomous relay nodes.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button onClick={() => setActiveTab('visual')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'visual' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Visual Builder</button>
            <button onClick={() => setActiveTab('json')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'json' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>JSON Source</button>
          </div>
          <button onClick={() => handleSave()} className={`px-6 py-2.5 rounded-lg font-bold flex items-center space-x-2 transition-all ${saveSuccess ? 'bg-green-600 text-white shadow-green-900/40' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 shadow-xl'}`}>
            {saveSuccess ? <Check size={18} /> : <Save size={18} />}
            <span>{saveSuccess ? 'System Updated' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'visual' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            
            <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
               <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-blue-600/5">
                  <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 bg-emerald-600/20 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-lg">
                        <Cloud size={24} />
                     </div>
                     <div>
                        <h3 className="font-black text-white uppercase tracking-tight">Autonomous Drive-Sync Relay (GAS)</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Enables the agent to attach your resumes from Google Drive automatically.</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => setShowGuide(!showGuide)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <HelpCircle size={14} /> {showGuide ? 'Hide Setup Tutorial' : 'How to fix attachments?'}
                  </button>
               </div>

               <div className="p-8 space-y-8">
                  {showGuide && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
                       <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                          <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Step 1: The New Relay Code</div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">Paste the code below into your Apps Script. It uses a high-reliability HTML-to-PDF method for the Cover Letter.</p>
                          <div className="relative group">
                             <pre className="text-[9px] font-mono text-slate-600 bg-black/40 p-3 rounded-lg overflow-hidden h-20">
                                {gasScriptCode}
                             </pre>
                             <button onClick={handleCopyScript} className="absolute inset-0 flex items-center justify-center bg-blue-600/90 text-white text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                                <span className="ml-2">{copiedScript ? 'Copied to Clipboard' : 'Copy New Script'}</span>
                             </button>
                          </div>
                       </div>
                       <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                          <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Step 2: Important CV Step</div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">The file <b>{localProfile.personal_info.cv_name || 'DPerera_CV.pdf'}</b> MUST exist in your Google Drive root or a shared folder for the search to find it.</p>
                          <div className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                             <AlertCircle size={14} className="text-blue-400 shrink-0" />
                             <span className="text-[9px] text-blue-400 font-bold leading-tight">Must Re-Deploy as "New Deployment" and Authorize!</span>
                          </div>
                       </div>
                       <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                          <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Step 3: Test Verification</div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">Send a test to your own inbox first. You should see two PDFs: your Resume and the generated Cover Letter.</p>
                       </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Link size={14} className="text-emerald-500" />
                          Relay Deployment URL (Must be New Deployment)
                       </label>
                    </div>
                    <div className="relative">
                       <input 
                        type="text" 
                        value={localProfile.preferences.gas_url || ''} 
                        onChange={(e) => updatePreferences('gas_url', e.target.value)} 
                        placeholder="https://script.google.com/macros/s/..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-mono text-emerald-400 outline-none focus:border-emerald-500/50 shadow-inner" 
                      />
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 space-y-6 shadow-xl">
              <div className="flex items-center space-x-3 text-blue-400 border-b border-slate-800 pb-4">
                <User size={20} />
                <h3 className="font-black text-white uppercase tracking-tight">Identity Metadata</h3>
              </div>
              <div className="space-y-5 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Candidate Full Name</label>
                  <input type="text" value={localProfile.personal_info.name} onChange={(e) => updatePersonalInfo('name', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Primary Inbox</label>
                  <input type="email" value={localProfile.personal_info.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Resume Filename in Drive</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value={localProfile.personal_info.cv_name || ''} onChange={(e) => updatePersonalInfo('cv_name', e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono outline-none focus:border-blue-500/50" />
                    <FileText size={18} className="text-slate-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 space-y-6 shadow-xl">
                  <div className="flex items-center space-x-3 text-yellow-500 border-b border-slate-800 pb-4">
                    <Zap size={20} />
                    <h3 className="font-black text-white uppercase tracking-tight">LLM Orchestration</h3>
                  </div>
                  <div className="space-y-5 pt-2">
                    <div className="space-y-2">
                       <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Logic Node Provider</label>
                       <select value={localProfile.preferences.ai_provider} onChange={(e) => updatePreferences('ai_provider', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none appearance-none focus:border-blue-500/50">
                        <option value="gemini">Google Gemini (Default)</option>
                        <option value="huggingface">Hugging Face API</option>
                        <option value="openrouter">OpenRouter Free Tier</option>
                      </select>
                    </div>
                  </div>
               </div>

               <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 space-y-6 shadow-xl">
                  <div className="flex items-center space-x-3 text-purple-400 border-b border-slate-800 pb-4">
                    <Briefcase size={20} />
                    <h3 className="font-black text-white uppercase tracking-tight">Career Compass</h3>
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {localProfile.desired_roles.map((role, i) => (
                        <span key={i} className="flex items-center px-4 py-2 bg-slate-950 rounded-xl text-[11px] font-bold text-slate-300 border border-slate-800 group">
                          {role} 
                          <X size={14} className="ml-3 cursor-pointer text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all" onClick={() => removeListItem('desired_roles', i)} />
                        </span>
                      ))}
                    </div>
                    <input 
                      type="text" 
                      placeholder="Add another role + Enter..." 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-purple-500/50" 
                      onKeyDown={(e) => { if (e.key === 'Enter') { addListItem('desired_roles', (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} 
                    />
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <Terminal size={18} className="text-amber-500" />
                <span className="text-[11px] text-amber-500 font-black uppercase tracking-widest">Danger Zone: Direct Schema Modification</span>
             </div>
             <textarea 
               value={jsonInput} 
               onChange={(e) => setJsonInput(e.target.value)} 
               className="w-full h-[600px] bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 font-mono text-xs leading-relaxed text-slate-300 outline-none custom-scrollbar focus:border-blue-500/30 shadow-inner shadow-black" 
             />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileConfig;
