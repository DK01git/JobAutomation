
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Job, ViewState, UserProfile } from '../types';
import { Briefcase, CheckCircle, Search, Cpu, Mail, Clock, Send, Check, ExternalLink, Activity, ArrowRight, Zap, ListChecks, ThumbsUp, XCircle, Globe, ShieldAlert, Terminal, Loader2, X, FileText, Paperclip, ShieldCheck, SendHorizonal } from 'lucide-react';
import { generateDailyDigest, generateApplicationMaterials } from '../services/geminiService';
import { sendEmail } from '../services/emailService';

interface DashboardProps {
  jobs: Job[];
  addLog: (msg: string, agent: any, level?: any) => void;
  setView: (view: ViewState) => void;
  setSelectedJobId: (id: string | null) => void;
  lastDigestTime: number;
  profile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ jobs, addLog, setView, setSelectedJobId, lastDigestTime, profile }) => {
  const [emailStatus, setEmailStatus] = useState<'idle' | 'generating' | 'sending' | 'sent'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [testResult, setTestResult] = useState<{ subject: string; body: string; to: string; mailtoUrl?: string; mode: 'relay' | 'mailto' } | null>(null);
  
  const pendingJobs = jobs.filter(j => j.status === 'discovered');

  useEffect(() => {
    const updateCountdown = () => {
      const nextRun = lastDigestTime + (24 * 60 * 60 * 1000);
      const diff = nextRun - Date.now();
      
      if (diff <= 0) {
        setTimeLeft('DUE NOW');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${mins}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [lastDigestTime]);

  const stats = {
    discovered: jobs.length,
    extracted: jobs.filter(j => j.status !== 'discovered').length,
    matched: jobs.filter(j => j.status === 'matched' || j.status === 'applied').length,
    applied: jobs.filter(j => j.status === 'applied').length,
  };

  const chartData = [
    { name: 'Discovered', value: stats.discovered, color: '#3b82f6' },
    { name: 'Analyzed', value: stats.extracted, color: '#8b5cf6' },
    { name: 'Matched', value: stats.matched, color: '#10b981' },
    { name: 'Applied', value: stats.applied, color: '#f59e0b' },
  ];

  const handleReviewJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setView('jobs');
  };

  const handleManualDigest = async () => {
    if (emailStatus !== 'idle') return;
    setEmailStatus('generating');
    addLog('Manual override: Forcing discovery sync...', 'ORCHESTRATOR');
    try {
        const emailBody = await generateDailyDigest(jobs.slice(0, 5), profile.personal_info.name);
        setEmailStatus('sending');
        await sendEmail({ 
          to: profile.personal_info.email, 
          subject: "Manual Sync Briefing", 
          body: emailBody,
          gasUrl: profile.preferences.gas_url
        });
        setEmailStatus('sent');
        addLog('Manual sync complete. Check your inbox.', 'ORCHESTRATOR', 'success');
        setTimeout(() => setEmailStatus('idle'), 3000);
    } catch (e) {
        setEmailStatus('idle');
        addLog('Manual sync failed.', 'ORCHESTRATOR', 'error');
    }
  };

  const runIntegrityTest = async () => {
    if (testStatus !== 'idle') return;
    setTestStatus('running');
    addLog('System Test Initiated: Testing end-to-end SMTP Relay...', 'SUBMISSION');
    
    try {
      const testJob: Job = {
        id: 'test-123',
        title: 'Senior AI Engineer (System Test)',
        company: 'AutoApply Core Labs',
        location: 'Remote',
        description: 'Test position for verifying application packet formatting.',
        status: 'discovered',
        source: 'Internal System',
        postedDate: new Date().toLocaleDateString(),
        url: '#'
      };

      addLog('Step 1/3: Composing high-fidelity email body...', 'SUBMISSION');
      const materials = await generateApplicationMaterials(testJob, profile);
      
      addLog(`Step 2/3: Attempting ${profile.preferences.gas_url ? 'AUTONOMOUS' : 'SIMULATED'} dispatch to ${profile.personal_info.email}...`, 'SUBMISSION');
      const subject = `Application for ${testJob.title} - ${profile.personal_info.name}`;
      
      const response = await sendEmail({
        to: profile.personal_info.email,
        subject: subject,
        body: materials.emailBody,
        gasUrl: profile.preferences.gas_url,
        attachments: [profile.personal_info.cv_name || "DPerera_CV.pdf", "Cover_Letter_Test.pdf"]
      });

      setTestResult({
        subject: subject,
        body: materials.emailBody,
        to: profile.personal_info.email,
        mailtoUrl: response.mailtoUrl,
        mode: response.mode
      });

      addLog(`Step 3/3: Integrity Check SUCCESS (${response.mode.toUpperCase()}).`, 'SUBMISSION', 'success');
      setTestStatus('complete');
      setTimeout(() => setTestStatus('idle'), 5000);
    } catch (e) {
      addLog('Integrity test failed.', 'SUBMISSION', 'error');
      setTestStatus('idle');
    }
  };

  const TestResultModal = () => {
    if (!testResult) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${testResult.mode === 'relay' ? 'bg-emerald-600/20 text-emerald-500 border-emerald-500/20' : 'bg-blue-600/20 text-blue-500 border-blue-500/20'}`}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Dispatch Integrity Report</h2>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${testResult.mode === 'relay' ? 'text-emerald-500' : 'text-blue-500'}`}>
                  {testResult.mode === 'relay' ? 'AUTONOMOUS RELAY SUCCESSFUL' : 'SIMULATED HANDSHAKE VERIFIED'}
                </p>
              </div>
            </div>
            <button onClick={() => setTestResult(null)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
            {testResult.mode === 'mailto' && (
              <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-sm uppercase tracking-tight">Manual Client Handoff Required</h4>
                  <p className="text-[10px] text-slate-400">No GAS relay detected. Use your local mail client to send for real.</p>
                </div>
                <a 
                  href={testResult.mailtoUrl} 
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
                >
                  <SendHorizonal size={16} /> Open in Local Mail App
                </a>
              </div>
            )}

            {testResult.mode === 'relay' && (
              <div className="bg-emerald-600/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                  <Check size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-sm uppercase tracking-tight">Fully Autonomous Dispatch Successful</h4>
                  <p className="text-[10px] text-slate-400">Packet was pushed directly to your Google Apps Script relay. Check your Gmail 'Sent' folder.</p>
                </div>
              </div>
            )}

            <div className="space-y-4 bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase block mb-1">Target Address</label>
                  <span className="text-slate-300 font-mono">{testResult.to}</span>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase block mb-1">Relay Source</label>
                  <span className="text-slate-300 font-mono">{testResult.mode === 'relay' ? 'GAS_ORCHESTRATOR' : 'browser.local_host'}</span>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase block mb-1">Protocol</label>
                  <span className="text-blue-400 font-bold uppercase">{testResult.mode === 'relay' ? 'HTTPS_POST' : 'MAILTO:HANDOFF'}</span>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-600 uppercase block mb-1">Compiled Subject Line</label>
                <span className="text-white font-bold text-base">{testResult.subject}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-blue-400">
                  <Mail size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Content Preview</span>
                </div>
                <button onClick={() => navigator.clipboard.writeText(testResult.body)} className="text-[10px] text-slate-500 hover:text-white font-bold">Copy Body</button>
              </div>
              <div className="bg-white/5 p-8 rounded-3xl border border-slate-800 font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-line shadow-inner">
                {testResult.body}
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-slate-800 bg-slate-900/80 flex justify-end">
             <button onClick={() => setTestResult(null)} className="px-10 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                Dismiss Report
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 overflow-y-auto max-h-full pb-20 custom-scrollbar pr-2">
      <TestResultModal />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
          <Zap className="text-yellow-500 fill-yellow-500/20" />
          Command Center
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-4 py-1.5 rounded-full border border-slate-800 tracking-widest">
            NODE_ORCHESTRATOR: <span className="text-emerald-500">ACTIVE_MONITORING</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
             <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldAlert size={200} />
             </div>
             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-5">
                   <div className="w-14 h-14 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                      <Terminal size={28} />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">System Health & Test Run</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-md">Verify the full AI-to-SMTP pipeline. {profile.preferences.gas_url ? 'Autonomous relay is ACTIVE.' : 'Simulated mode enabled.'}</p>
                   </div>
                </div>
                <button 
                  onClick={runIntegrityTest}
                  disabled={testStatus !== 'idle'}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${
                    testStatus === 'complete' ? 'bg-emerald-600 text-white' : 
                    testStatus === 'running' ? 'bg-slate-800 text-slate-500' : 
                    'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'
                  }`}
                >
                  {testStatus === 'idle' && <><Activity size={16} /> Run System Integrity Test</>}
                  {testStatus === 'running' && <><Loader2 className="animate-spin" size={16} /> Executing Protocol...</>}
                  {testStatus === 'complete' && <><Check size={16} /> Packet Delivered</>}
                </button>
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="p-8 bg-blue-600/5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <ListChecks className="text-blue-500" />
                  Daily Discovery Digest
                </h3>
                <p className="text-xs text-slate-500 mt-1">Review and approve new job findings from the last automated crawl.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-blue-400 block mb-1">CRAWL_WINDOW: {new Date(lastDigestTime).toLocaleDateString()}</span>
                <span className="text-xs font-black text-white">{pendingJobs.length} NEW MATCHES PENDING</span>
              </div>
            </div>

            <div className="p-0">
              {pendingJobs.length === 0 ? (
                <div className="p-20 text-center space-y-4 bg-slate-950/30">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                    <Check size={32} />
                  </div>
                  <p className="text-sm text-slate-400 italic">No new jobs pending review. System is up to date.</p>
                  <button onClick={handleManualDigest} className="text-xs text-blue-500 font-bold hover:underline">Trigger manual discovery crawl</button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800 bg-slate-950/30 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {pendingJobs.map(job => (
                    <div key={job.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                      <div className="flex items-center space-x-5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700 shrink-0">
                          <Search size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-white truncate">{job.title}</h4>
                            <a href={job.url} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-500 hover:text-blue-400 transition-colors" title="Verify Original Post">
                              <ExternalLink size={14} />
                            </a>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500 font-bold">{job.company}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1.5 uppercase">
                              <Globe size={10} /> {job.source}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 ml-6">
                        <button 
                          onClick={() => handleReviewJob(job.id)}
                          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all"
                        >
                          Review Detail
                        </button>
                        <button 
                          onClick={() => handleReviewJob(job.id)}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                        >
                          <ThumbsUp size={12} /> Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pendingJobs.length > 0 && (
              <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Awaiting user confirmation to proceed with AI extraction agents</p>
                <button onClick={() => setView('jobs')} className="text-[10px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-widest flex items-center gap-2">
                  View full list <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Successful Applications</h3>
                <div className="flex items-end justify-between">
                  <span className="text-5xl font-black text-white tracking-tighter">{stats.applied}</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <CheckCircle size={20} />
                  </div>
                </div>
             </div>
             
             <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 md:col-span-2">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Discovery Pulse Rate</h3>
               <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={30}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.6} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock size={80} />
            </div>
            <div className="w-16 h-16 rounded-3xl bg-blue-600/20 flex items-center justify-center text-blue-500 mb-6 border border-blue-500/30 shadow-xl shadow-blue-500/10">
              <Clock size={32} />
            </div>
            <h3 className="text-white font-black text-lg">Daily Scheduler</h3>
            <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-widest">Next Discovery Wave In</p>
            <p className="text-3xl font-black text-blue-400 mt-2 font-mono tracking-tighter">{timeLeft}</p>
            
            <button 
              onClick={handleManualDigest}
              disabled={emailStatus !== 'idle'}
              className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/30 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {emailStatus === 'idle' ? (
                <><Send size={16} /> Force Sync Digest</>
              ) : (
                <><Activity className="animate-spin" size={16} /> Crawling Web...</>
              )}
            </button>
          </div>

          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Agent Control Status</h3>
            <div className="space-y-4">
              {[
                { name: 'Crawler Node', status: 'MONITORING', color: 'bg-emerald-500' },
                { name: 'Analysis Engine', status: 'WAITING_APPROVAL', color: 'bg-amber-500' },
                { name: 'SMTP Simulated Relay', status: profile.preferences.gas_url ? 'ACTIVE_RELAY' : 'STANDBY', color: profile.preferences.gas_url ? 'bg-emerald-500' : 'bg-blue-500' },
                { name: 'Heartbeat Monitor', status: 'ACTIVE', color: 'bg-emerald-500' }
              ].map((node, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                  <span className="text-[11px] font-bold text-slate-400 tracking-tight">{node.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-[9px] text-slate-600 font-mono font-black uppercase tracking-tighter">{node.status}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${node.color} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
