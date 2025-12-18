import React, { useState } from 'react';
import { Job } from '../types';
import { Mail, FileText, Calendar, ShieldCheck, ChevronDown, ChevronUp, Paperclip, Clock, Copy, Check, ExternalLink } from 'lucide-react';

interface OutboxProps {
  jobs: Job[];
  setSelectedJobId: (id: string | null) => void;
  setView: (view: any) => void;
}

const Outbox: React.FC<OutboxProps> = ({ jobs, setSelectedJobId, setView }) => {
  const sentJobs = jobs.filter(j => j.status === 'applied');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<{ id: string, type: 'email' | 'letter' } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopy = (text: string, id: string, type: 'email' | 'letter') => {
    navigator.clipboard.writeText(text);
    setCopiedType({ id, type });
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleReview = (id: string) => {
    setSelectedJobId(id);
    setView('jobs');
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
            <Mail className="text-blue-500" />
            Sent Archive
          </h2>
          <p className="text-slate-400 text-sm mt-1">Full audit trail of all dispatched application materials. No content is truncated.</p>
        </div>
        <div className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          SYSTEM_OUTBOX: {sentJobs.length} PACKETS DISPATCHED
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-24">
        {sentJobs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl">
            <Mail size={48} className="mb-4 opacity-20" />
            <p className="font-bold">No Dispatched Items</p>
            <p className="text-xs">Your outbox will populate once an application sequence is confirmed.</p>
          </div>
        ) : (
          sentJobs.map((job) => (
            <div key={job.id} className={`bg-slate-900 border transition-all duration-300 rounded-3xl overflow-hidden ${expandedId === job.id ? 'border-blue-500/50 ring-1 ring-blue-500/20 shadow-2xl shadow-blue-900/10' : 'border-slate-800 hover:border-slate-700'}`}>
              {/* Header Info */}
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start space-x-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${expandedId === job.id ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white leading-none">{job.title}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-slate-400 font-bold">{job.company}</span>
                      <span className="flex items-center text-[10px] text-slate-500 uppercase tracking-widest font-black">
                        <Clock size={12} className="mr-1.5 text-slate-600" />
                        {job.applicationDetails?.sentAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => handleReview(job.id)}
                    className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                    title="View in Job Tracker"
                  >
                    <ExternalLink size={18} />
                  </button>
                  <button 
                    onClick={() => toggleExpand(job.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${expandedId === job.id ? 'bg-slate-800 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'}`}
                  >
                    {expandedId === job.id ? (
                      <>Collapse <ChevronUp size={16} /></>
                    ) : (
                      <>Audit Packet <ChevronDown size={16} /></>
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsed Brief Bar */}
              {expandedId !== job.id && (
                <div className="bg-slate-950/40 p-4 border-t border-slate-800/50 flex items-center justify-between text-[10px] font-bold">
                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1.5"><Paperclip size={12}/> {job.applicationDetails?.attachments.length} Attachments</span>
                    <span className="text-slate-800">|</span>
                    <span className="truncate max-w-[400px] italic font-mono text-slate-600">"{job.applicationDetails?.emailBody.substring(0, 100)}..."</span>
                  </div>
                  <span className="text-blue-500/60 font-mono tracking-tighter uppercase">{job.applicationDetails?.trackingId}</span>
                </div>
              )}

              {/* Expanded Full Content */}
              {expandedId === job.id && job.applicationDetails && (
                <div className="border-t border-slate-800 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Full Email Section */}
                    <div className="p-8 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/30">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-blue-400">
                          <Mail size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Dispatched Email Content</span>
                        </div>
                        <button 
                          onClick={() => handleCopy(job.applicationDetails!.emailBody, job.id, 'email')}
                          className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1.5"
                        >
                          {copiedType?.id === job.id && copiedType?.type === 'email' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          {copiedType?.id === job.id && copiedType?.type === 'email' ? 'Copied' : 'Copy Body'}
                        </button>
                      </div>
                      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-300 font-mono italic leading-relaxed whitespace-pre-line shadow-inner">
                        {job.applicationDetails.emailBody}
                      </div>
                    </div>

                    {/* Full Cover Letter Section */}
                    <div className="p-8 bg-slate-950/10">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-purple-400">
                          <FileText size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Submitted Cover Letter</span>
                        </div>
                        <button 
                          onClick={() => handleCopy(job.applicationDetails!.coverLetter, job.id, 'letter')}
                          className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1.5"
                        >
                          {copiedType?.id === job.id && copiedType?.type === 'letter' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          {copiedType?.id === job.id && copiedType?.type === 'letter' ? 'Copied' : 'Copy Letter'}
                        </button>
                      </div>
                      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-300 leading-loose whitespace-pre-line shadow-inner">
                        {job.applicationDetails.coverLetter}
                      </div>
                    </div>
                  </div>

                  {/* Attachment Footer */}
                  <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex flex-wrap gap-4 items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Enclosures:</span>
                    {job.applicationDetails.attachments.map((file, i) => (
                      <div key={i} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-400 font-bold">
                        <FileText size={12} className="text-blue-500" />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Outbox;