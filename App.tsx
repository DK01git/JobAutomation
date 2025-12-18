import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import JobFeed from './components/JobFeed';
import ProfileConfig from './components/ProfileConfig';
import AgentLogs from './components/AgentLogs';
import Outbox from './components/Outbox';
import { Job, UserProfile, LogEntry, ViewState } from './types';
import { MOCK_JOBS, INITIAL_PROFILE } from './constants';
import { generateDailyDigest, discoverJobs } from './services/geminiService';
import { sendEmail } from './services/emailService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [lastDigestTime, setLastDigestTime] = useState<number>(() => {
    const saved = localStorage.getItem('autoapply_last_digest');
    return saved ? parseInt(saved) : Date.now() - (23 * 60 * 60 * 1000); // Default to 23 hours ago for demo
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    { 
      id: 'init-1', 
      timestamp: new Date().toLocaleTimeString(), 
      agent: 'ORCHESTRATOR', 
      message: 'System Command Center initialized. All agents on standby.', 
      level: 'info' 
    }
  ]);

  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    if (process.env.API_KEY) {
      setHasApiKey(true);
    }
  }, []);

  const addLog = useCallback((message: string, agent: LogEntry['agent'], level: LogEntry['level'] = 'info') => {
    setLogs(prev => [
      ...prev, 
      { id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toLocaleTimeString(), agent, message, level }
    ]);
  }, []);

  // Background Scheduler Agent
  useEffect(() => {
    const checkSchedule = async () => {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      addLog('Heartbeat check: Scheduler verifying task queue...', 'SCHEDULER', 'info');

      if (now - lastDigestTime >= twentyFourHours) {
        addLog('Daily window reached. Initiating Autonomous Sync Sequence.', 'SCHEDULER', 'success');
        
        try {
          // 1. Discover New Jobs
          addLog('Discovery Agent: Waking up for scheduled crawl...', 'DISCOVERY');
          const newJobs = await discoverJobs(profile);
          
          if (newJobs.length > 0) {
            setJobs(prev => {
              const existing = new Set(prev.map(p => `${p.title}-${p.company}`));
              return [...newJobs.filter(f => !existing.has(`${f.title}-${f.company}`)), ...prev];
            });
          }

          // 2. Generate and Send Digest
          addLog('Generating Daily Briefing for ' + profile.personal_info.name + '...', 'ORCHESTRATOR');
          const emailBody = await generateDailyDigest(newJobs.slice(0, 5), profile.personal_info.name);
          
          addLog('Dispatching briefing via SMTP Relay...', 'SUBMISSION');
          await sendEmail({ 
            to: profile.personal_info.email, 
            subject: `Daily AI Job Briefing - ${new Date().toLocaleDateString()}`, 
            body: emailBody 
          });

          // 3. Update state
          const newTimestamp = Date.now();
          setLastDigestTime(newTimestamp);
          localStorage.setItem('autoapply_last_digest', newTimestamp.toString());
          addLog('Autonomous Sync Sequence complete. Next run in 24 hours.', 'SCHEDULER', 'success');
        } catch (error) {
          addLog(`Scheduled task failed: ${error}`, 'SCHEDULER', 'error');
        }
      }
    };

    // Run once on mount
    checkSchedule();

    // Check every minute
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, [lastDigestTime, profile, addLog]);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard jobs={jobs} addLog={addLog} setView={setCurrentView} setSelectedJobId={setSelectedJobId} lastDigestTime={lastDigestTime} profile={profile} />;
      case 'jobs':
        return <JobFeed jobs={jobs} profile={profile} setJobs={setJobs} addLog={addLog} selectedJobId={selectedJobId} setSelectedJobId={setSelectedJobId} />;
      case 'outbox':
        return <Outbox jobs={jobs} setSelectedJobId={setSelectedJobId} setView={setCurrentView} />;
      case 'profile':
        return <ProfileConfig profile={profile} setProfile={setProfile} />;
      case 'logs':
        return <AgentLogs logs={logs} />;
      default:
        return <Dashboard jobs={jobs} addLog={addLog} setView={setCurrentView} setSelectedJobId={setSelectedJobId} lastDigestTime={lastDigestTime} profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden">
      <Sidebar currentView={currentView} setView={setView => setCurrentView(setView)} />
      
      <main className="flex-1 ml-64 p-8 h-screen flex flex-col relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.1),transparent)] pointer-events-none" />
        
        {!hasApiKey && (
           <div className="bg-red-500/10 text-red-400 px-6 py-3 rounded-2xl mb-6 text-xs border border-red-500/20 flex justify-between items-center backdrop-blur-sm z-20">
             <span className="font-bold tracking-widest uppercase">CRITICAL: API_KEY_MISSING</span>
             <span className="opacity-70">AI reasoning and discovery agents are currently localized.</span>
           </div>
        )}
        
        <div className="flex-1 relative overflow-hidden z-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;