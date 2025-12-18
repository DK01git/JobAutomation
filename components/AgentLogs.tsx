import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface AgentLogsProps {
  logs: LogEntry[];
}

const AgentLogs: React.FC<AgentLogsProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getBadgeColor = (agent: string) => {
    switch(agent) {
      case 'ORCHESTRATOR': return 'bg-slate-600 text-slate-100';
      case 'DISCOVERY': return 'bg-green-600 text-green-100';
      case 'EXTRACTION': return 'bg-purple-600 text-purple-100';
      case 'MATCHING': return 'bg-blue-600 text-blue-100';
      case 'SUBMISSION': return 'bg-amber-600 text-amber-100';
      case 'SCHEDULER': return 'bg-blue-900 text-blue-200 border border-blue-500/30';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-[2rem] border border-slate-800 overflow-hidden font-mono shadow-2xl">
      <div className="bg-slate-900/80 backdrop-blur-md p-5 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">System Core / Log Stream</span>
        </div>
        <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-slate-800"></div>
            <div className="w-3 h-3 rounded-full bg-slate-800"></div>
            <div className="w-3 h-3 rounded-full bg-slate-800"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start space-x-4 text-[12px] hover:bg-white/5 p-2 rounded-xl transition-colors group">
            <span className="text-slate-600 shrink-0 select-none font-bold opacity-50 group-hover:opacity-100">[{log.timestamp}]</span>
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black shrink-0 uppercase w-28 text-center tracking-widest ${getBadgeColor(log.agent)}`}>
              {log.agent}
            </span>
            <span className={`${
              log.level === 'error' ? 'text-red-400' : 
              log.level === 'success' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            } break-words leading-relaxed`}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 bg-slate-900/50 border-t border-slate-800 text-[10px] text-slate-600 flex justify-between uppercase font-black tracking-tighter">
        <span>Tail: online</span>
        <span>Filter: none</span>
        <span>Buffer: {logs.length} events</span>
      </div>
    </div>
  );
};

export default AgentLogs;