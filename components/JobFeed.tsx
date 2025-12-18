import React, { useState, useEffect } from 'react';
import { Job, UserProfile } from '../types';
import { analyzeJobRequirements, matchJobToProfile, discoverJobs, generateApplicationMaterials } from '../services/geminiService';
import { Sparkles, ExternalLink, MapPin, Building, Loader2, Target, Search, Send, CheckCircle, Globe, Mail, FileText, X, Activity, ShieldCheck, Edit3, RotateCcw, Paperclip, ThumbsUp, Copy, Check, XCircle } from 'lucide-react';

interface JobFeedProps {
  jobs: Job[];
  profile: UserProfile;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  addLog: (message: string, agent: any, level?: any) => void;
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
}

const SOURCES = ["LinkedIn", "Indeed", "Wellfound", "Glassdoor", "Recruiter.lk", "TopJobs.lk", "Google Jobs"];

const JobFeed: React.FC<JobFeedProps> = ({ jobs, profile, setJobs, addLog, selectedJobId, setSelectedJobId }) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [copiedType, setCopiedType] = useState<'email' | 'letter' | null>(null);
  
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftMaterials, setDraftMaterials] = useState<{ emailBody: string; coverLetter: string } | null>(null);

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  useEffect(() => {
    let interval: any;
    if (loadingAction === 'discovery') {
      interval = setInterval(() => {
        setActiveSourceIndex(prev => (prev + 1) % SOURCES.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loadingAction]);

  useEffect(() => {
    setIsDrafting(false);
    setDraftMaterials(null);
  }, [selectedJobId]);

  const runExtraction = async (job: Job) => {
    setLoadingAction(`extract-${job.id}`);
    addLog(`Deep Extraction: Parsing metadata for ${job.title}...`, 'EXTRACTION');
    try {
      const requirements = await analyzeJobRequirements(job.description);
      const updatedJobs = jobs.map(j => 
        j.id === job.id ? { ...j, extractedRequirements: requirements, status: 'extracted' as const } : j
      );
      setJobs(updatedJobs);
      addLog(`Extraction complete.`, 'EXTRACTION', 'success');
    } catch (e) {
      addLog(`Extraction error: ${e}`, 'EXTRACTION', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    setSelectedJobId(null);
    addLog('Job manually rejected and removed from stream.', 'ORCHESTRATOR', 'info');
  };

  const runMatching = async (job: Job) => {
    setLoadingAction(`match-${job.id}`);
    addLog(`Matching Engine: Comparing profile against ${job.company} requirements...`, 'MATCHING');
    try {
      const matchResult = await matchJobToProfile(job, profile);
      const updatedJobs = jobs.map(j => 
        j.id === job.id ? { ...j, matchScore: matchResult.score, matchReasoning: matchResult.reasoning, status: 'matched' as const } : j
      );
      setJobs(updatedJobs);
      addLog(`Match analysis complete: ${matchResult.score}% fit.`, 'MATCHING', 'success');
    } catch (e) {
      addLog(`Matching failed: ${e}`, 'MATCHING', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const initiateDrafting = async (job: Job) => {
    setLoadingAction(`drafting-${job.id}`);
    addLog(`Submission Agent: Generating custom draft materials...`, 'SUBMISSION');
    try {
      const materials = await generateApplicationMaterials(job, profile);
      setDraftMaterials(materials);
      setIsDrafting(true);
      addLog(`Drafts ready for review. Signature placement optimized.`, 'SUBMISSION', 'info');
    } catch (e) {
      addLog(`Drafting failed: ${e}`, 'SUBMISSION', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRewrite = async () => {
    if (!selectedJob) return;
    setLoadingAction('rewriting');
    addLog(`Submission Agent: Regenerating with fresh perspective...`, 'SUBMISSION');
    try {
      const materials = await generateApplicationMaterials(selectedJob, profile);
      setDraftMaterials(materials);
      addLog(`Draft successfully rewritten by AI.`, 'SUBMISSION', 'success');
    } catch (e) {
      addLog(`Rewrite failed.`, 'SUBMISSION', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFinalSubmit = async () => {
    if (!selectedJob || !draftMaterials) return;
    setLoadingAction(`submit-${selectedJob.id}`);
    addLog(`Fetching Master CV: ${profile.personal_info.cv_name || 'DPerera_CV.pdf'}...`, 'SUBMISSION');
    
    try {
      await new Promise(r => setTimeout(r, 1200)); 
      
      const attachments = [
        profile.personal_info.cv_name || "DPerera_CV.pdf",
        `Cover_Letter_${selectedJob.company.replace(/\s+/g, '_')}.pdf`
      ];

      const applicationDetails = {
        ...draftMaterials,
        sentAt: new Date().toLocaleString(),
        trackingId: `TRK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        status: 'delivered' as const,
        attachments
      };
      
      const updatedJobs = jobs.map(j => 
        j.id === selectedJob.id ? { ...j, status: 'applied' as const, applicationDetails } : j
      );
      setJobs(updatedJobs);
      setIsDrafting(false);
      addLog(`Packet delivered via Simulated SMTP Relay. Check 'Sent Outbox' for archive.`, 'SUBMISSION', 'success');
    } catch (e) {
      addLog(`Final submission failed.`, 'SUBMISSION', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDiscovery = async () => {
    setLoadingAction('discovery');
    addLog(`Discovery Agent: Scouring web...`, 'DISCOVERY');
    try {
      const foundJobs = await discoverJobs(profile);
      if (foundJobs.length > 0) {
        setJobs(prev => {
          const existing = new Set(prev.map(p => `${p.title}-${p.company}`));
          return [...foundJobs.filter(f => !existing.has(`${f.title}-${f.company}`)), ...prev];
        });
        addLog(`Found ${foundJobs.length} new roles. Awaiting user approval in Command Center.`, 'DISCOVERY', 'success');
      }
    } catch (e) {
      addLog(`Discovery failed.`, 'DISCOVERY', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCopy = (text: string, type: 'email' | 'letter') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const TrackingModal = () => {
    if (!selectedJob?.applicationDetails) return null;
    const { applicationDetails } = selectedJob;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[95vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Audit Archive</h2>
                <div className="flex items-center gap-3 mt-1">
                   <p className="text-xs text-slate-500 font-mono tracking-wider">ID: {applicationDetails.trackingId}</p>
                   <span className="w-1 h-1 rounded-full bg-slate-700" />
                   <p className="text-xs text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                     <CheckCircle size={12} /> Full Packet Verified
                   </p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowTrackingModal(false)} className="w-12 h-12 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <X size={28} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar bg-slate-950/20">
            {/* Attachments Section */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Paperclip size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Dispatched Package Attachments</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applicationDetails.attachments.map((file, i) => (
                    <div key={i} className="flex items-center space-x-4 p-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-sm text-slate-300 hover:border-slate-700 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-bold text-slate-200">{file}</p>
                        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-tighter">Verified PDF Document</p>
                      </div>
                      <CheckCircle size={16} className="text-emerald-500/50" />
                    </div>
                  ))}
                </div>
            </div>

            {/* Content Sections - Unrestricted rendering */}
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Mail size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Full Email Transcript</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(applicationDetails.emailBody, 'email')}
                    className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1.5"
                  >
                    {copiedType === 'email' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    {copiedType === 'email' ? 'Copied' : 'Copy Full Transcript'}
                  </button>
                </div>
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-[15px] text-slate-300 italic font-mono leading-relaxed whitespace-pre-line shadow-inner min-h-[150px]">
                  {applicationDetails.emailBody}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-purple-400">
                    <FileText size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Full Generated Cover Letter</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(applicationDetails.coverLetter, 'letter')}
                    className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1.5"
                  >
                    {copiedType === 'letter' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    {copiedType === 'letter' ? 'Copied' : 'Copy Full Letter'}
                  </button>
                </div>
                <div className="p-10 bg-slate-900 border border-slate-800 rounded-3xl text-[15px] text-slate-300 whitespace-pre-line leading-loose shadow-inner min-h-[300px]">
                  {applicationDetails.coverLetter}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">ARCHIVED ON {applicationDetails.sentAt} • ALL DATA RETRIEVED</div>
            </div>
            <button onClick={() => setShowTrackingModal(false)} className="px-12 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-sm font-black transition-all border border-slate-700 shadow-xl">
              Dismiss Archive
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full gap-0 overflow-hidden">
      <div className="flex-1 flex flex-col space-y-4 h-full overflow-hidden p-1 pr-6">
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Search size={18} className="text-blue-500" />
                <span>Deep Search Stream</span>
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Scanning: {SOURCES.length} Nodes Online</p>
            </div>
            <button onClick={handleDiscovery} disabled={!!loadingAction} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 disabled:opacity-50 flex items-center space-x-2">
                {loadingAction === 'discovery' ? <Loader2 className="animate-spin" size={14} /> : <Globe size={14} />}
                <span>{loadingAction === 'discovery' ? `CRWLING ${SOURCES[activeSourceIndex]}` : 'Trigger New Discovery'}</span>
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-24 custom-scrollbar">
            {jobs.map(job => (
                <div key={job.id} onClick={() => setSelectedJobId(job.id)} className={`p-5 rounded-2xl border transition-all cursor-pointer group ${selectedJobId === job.id ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/20' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-4">
                            <h3 className="font-bold text-slate-100 text-base group-hover:text-blue-400 transition-colors truncate">{job.title}</h3>
                            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-2">
                                <span className="flex items-center"><Building size={12} className="mr-1"/> {job.company}</span>
                                <span className="flex items-center"><MapPin size={12} className="mr-1"/> {job.location}</span>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest border mb-2 inline-block ${
                                job.status === 'applied' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                job.status === 'discovered' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-slate-800 text-slate-500 border-slate-700'
                            }`}>{job.status.toUpperCase()}</span>
                            {job.matchScore ? <div className="text-lg font-black text-white">{job.matchScore}%</div> : null}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="w-[450px] bg-slate-900/80 backdrop-blur-md border-l border-slate-800 h-full flex flex-col shadow-2xl relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32">
          {selectedJob ? (
              <div className="space-y-8">
                  {!isDrafting ? (
                    <>
                      <div className="space-y-3">
                          <h2 className="text-3xl font-black text-white leading-tight tracking-tight">{selectedJob.title}</h2>
                          <p className="text-xl text-slate-400 font-bold">{selectedJob.company}</p>
                          <div className="flex items-center space-x-4 text-slate-500 text-sm">
                              <span className="flex items-center"><MapPin size={14} className="mr-1.5"/> {selectedJob.location}</span>
                              <a href={selectedJob.url} target="_blank" rel="noreferrer" className="flex items-center text-blue-400 font-bold hover:text-blue-300">
                                Live Post <ExternalLink size={14} className="ml-1.5" />
                              </a>
                          </div>
                      </div>

                      {selectedJob.status === 'applied' && selectedJob.applicationDetails && (
                        <div className="p-6 bg-blue-600/10 border border-blue-500/30 rounded-3xl space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-blue-400 font-black text-xs uppercase tracking-widest">
                              <ShieldCheck size={18} />
                              <span>Submission Active</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{selectedJob.applicationDetails.sentAt}</span>
                          </div>
                          <button onClick={() => setShowTrackingModal(true)} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black transition-all flex items-center justify-center space-x-3 shadow-xl shadow-blue-900/40">
                              <Activity size={20} />
                              <span>VIEW SUBMISSION TRACKING</span>
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col space-y-3">
                          {selectedJob.status !== 'applied' && (
                            <>
                              {selectedJob.status === 'discovered' ? (
                                <div className="grid grid-cols-2 gap-3">
                                  <button onClick={() => handleReject(selectedJob.id)} className="py-4 bg-slate-950 hover:bg-red-900/20 text-slate-500 hover:text-red-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-slate-800 flex items-center justify-center gap-2">
                                      <XCircle size={16} /> Reject Role
                                  </button>
                                  <button onClick={() => runExtraction(selectedJob)} disabled={!!loadingAction} className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                                      {loadingAction?.startsWith('extract-') ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={16} />} 
                                      Approve & Process
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => runExtraction(selectedJob)} disabled={!!loadingAction} className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                                        {loadingAction === `extract-${selectedJob.id}` ? <Loader2 className="animate-spin" size={16}/> : 'Rerun Extraction'}
                                    </button>
                                    <button onClick={() => runMatching(selectedJob)} disabled={!!loadingAction} className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                                        {loadingAction === `match-${selectedJob.id}` ? <Loader2 className="animate-spin" size={16}/> : 'Match Profiler'}
                                    </button>
                                  </div>
                                  <button onClick={() => initiateDrafting(selectedJob)} disabled={!!loadingAction} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center space-x-3 group">
                                      {loadingAction === `drafting-${selectedJob.id}` ? <Loader2 className="animate-spin" size={20} /> : <Edit3 size={20} className="group-hover:scale-110 transition-transform" />}
                                      <span>Generate Final Packet</span>
                                  </button>
                                </>
                              )}
                            </>
                          )}
                      </div>

                      {selectedJob.matchReasoning && (
                        <div className="bg-slate-950/50 rounded-3xl p-6 border border-slate-800 space-y-3">
                            <div className="flex items-center space-x-3 text-purple-400">
                                <Sparkles size={18} />
                                <span className="font-black text-[10px] uppercase tracking-widest">Neural Match Analysis</span>
                            </div>
                            <p className="text-sm text-slate-300 italic border-l-2 border-blue-600 pl-4 whitespace-pre-line leading-relaxed">{selectedJob.matchReasoning}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Job Narrative</h4>
                        <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="flex items-center justify-between">
                        <button onClick={() => setIsDrafting(false)} className="text-slate-400 hover:text-white flex items-center text-xs font-bold">
                          <RotateCcw size={14} className="mr-2" /> Back to Details
                        </button>
                        <button onClick={handleRewrite} disabled={!!loadingAction} className="text-blue-400 hover:text-blue-300 flex items-center text-xs font-bold">
                          {loadingAction === 'rewriting' ? <Loader2 size={14} className="animate-spin mr-2" /> : <Sparkles size={14} className="mr-2" />}
                          Regenerate
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-emerald-400">
                          <Paperclip size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Enclosed Files</span>
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center space-x-3 p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-400">
                              <FileText size={14} className="text-blue-500" />
                              <span>{profile.personal_info.cv_name || "DPerera_CV.pdf"}</span>
                              <span className="ml-auto text-slate-600 uppercase tracking-tighter">Attaching</span>
                           </div>
                           <div className="flex items-center space-x-3 p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-400">
                              <FileText size={14} className="text-purple-500" />
                              <span>Custom_Cover_Letter.pdf</span>
                              <span className="ml-auto text-slate-600 uppercase tracking-tighter">Drafted</span>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                            <Mail size={12} className="mr-2" /> Draft Email Body
                          </label>
                          <textarea 
                            value={draftMaterials?.emailBody || ''} 
                            onChange={(e) => setDraftMaterials(prev => prev ? { ...prev, emailBody: e.target.value } : null)}
                            className="w-full h-48 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 font-mono outline-none focus:border-blue-500/50 resize-y custom-scrollbar"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                            <FileText size={12} className="mr-2" /> Draft Cover Letter
                          </label>
                          <textarea 
                            value={draftMaterials?.coverLetter || ''} 
                            onChange={(e) => setDraftMaterials(prev => prev ? { ...prev, coverLetter: e.target.value } : null)}
                            className="w-full h-96 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 leading-relaxed outline-none focus:border-blue-500/50 resize-y custom-scrollbar"
                          />
                        </div>

                        <button onClick={handleFinalSubmit} disabled={!!loadingAction} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/30 flex items-center justify-center space-x-3">
                            {loadingAction?.startsWith('submit-') ? <Loader2 className="animate-spin" size={20} /> : <ThumbsUp size={20} />}
                            <span>Approve & Dispatch Full Packet</span>
                        </button>
                      </div>
                    </div>
                  )}
              </div>
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 mb-4">
                      <Target size={32} />
                  </div>
                  <h3 className="text-white font-bold">No Job Selected</h3>
                  <p className="text-xs text-slate-500 max-w-[200px]">Select a position from the deep search stream to begin the automation sequence.</p>
              </div>
          )}
        </div>
      </div>
      {showTrackingModal && <TrackingModal />}
    </div>
  );
};

export default JobFeed;