import React from 'react';
import { 
  Briefcase, 
  Sparkles, 
  FileCheck, 
  CheckCircle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Compass,
  Bell,
  Percent,
  Send,
  MessageSquareCode
} from 'lucide-react';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: 'bookmarked' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  date: string;
  notes?: string;
  followUpDate?: string;
}

interface DashboardTabProps {
  stats: {
    explored: number;
    tailored: number;
    letters: number;
  };
  applications: Application[];
  onNavigate: (tab: string) => void;
}

export default function DashboardTab({ stats, applications, onNavigate }: DashboardTabProps) {
  // Constants for calculations
  const todayStr = new Date().toISOString().split('T')[0];

  const bookmarkedCount = applications.filter(app => app.status === 'bookmarked').length;
  const sentCount = applications.filter(app => app.status !== 'bookmarked').length;
  const interviewingCount = applications.filter(app => app.status === 'interviewing').length;
  const offerCount = applications.filter(app => app.status === 'offer').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;

  // Response rate: (Interviewing + Offer) / (Total Sent)
  const responseRate = sentCount > 0
    ? Math.round(((interviewingCount + offerCount) / sentCount) * 100)
    : 0;

  // Follow-ups due: active applications where followUpDate is today or past
  const dueFollowUps = applications.filter(app => 
    (app.status === 'applied' || app.status === 'interviewing') &&
    app.followUpDate && 
    app.followUpDate <= todayStr
  );

  const cards = [
    { 
      label: 'Applications Sent', 
      value: sentCount, 
      desc: `Active loops out of ${applications.length} tracked`, 
      icon: Send, 
      color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' 
    },
    { 
      label: 'Response Rate', 
      value: `${responseRate}%`, 
      desc: 'Interviews & offers ratio', 
      icon: Percent, 
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' 
    },
    { 
      label: 'Interviews Prep', 
      value: interviewingCount, 
      desc: 'Active live mock challenges', 
      icon: MessageSquareCode, 
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' 
    },
    { 
      label: 'Offers Received', 
      value: offerCount, 
      desc: 'Target internship offers', 
      icon: CheckCircle, 
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' 
    },
  ];

  // Funnel stages
  const funnelStages = [
    { name: 'Bookmarked Companies', key: 'bookmarked', color: 'bg-slate-500' },
    { name: 'Applied Outreaches', key: 'applied', color: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' },
    { name: 'Interview Stages', key: 'interviewing', color: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' },
    { name: 'Offers Received', key: 'offer', color: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
    { name: 'Archived / Rejected', key: 'rejected', color: 'bg-rose-500' },
  ];

  const maxStageCount = Math.max(...funnelStages.map(stage => 
    applications.filter(app => app.status === stage.key).length
  ), 1);

  // Recent timeline simulation
  const activities = [
    { type: 'tailor', text: 'Tailored resume bullets for Google (SWE Intern)', time: '10m ago' },
    { type: 'letter', text: 'Drafted professional outreach email for Stripe (Frontend)', time: '1h ago' },
    { type: 'apply', text: 'Moved Microsoft application to "Interviewing" stage', time: 'Yesterday' },
    { type: 'explore', text: 'Searched for React.js internship roles', time: '2 days ago' }
  ];

  // Helper to calculate days overdue
  const getOverdueText = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const today = new Date(todayStr);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day overdue';
    return `${diffDays} days overdue`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-1">Career Agent Hub</h2>
          <p className="text-slate-400 text-sm">Optimize your application checklist, auto-tailor credentials, and track follow-up schedules.</p>
        </div>
        {dueFollowUps.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold animate-pulse">
            <Bell className="h-4 w-4 shrink-0" />
            <span>{dueFollowUps.length} Follow-ups Due Today!</span>
          </div>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card p-6 flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className="text-3xl font-extrabold text-slate-100 mt-1">
                    {card.value}
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${card.color} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-slate-400">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Follow-ups Alert Section */}
      {dueFollowUps.length > 0 && (
        <div className="glass-card border-amber-500/20 bg-amber-500/[0.02] p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Outreach & Follow-ups Due</h3>
              <p className="text-xs text-slate-400">These companies haven't responded yet. Send a polite follow-up template.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dueFollowUps.map((app) => (
              <div 
                key={app.id} 
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex justify-between items-center group/item hover:border-amber-500/30 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{app.jobTitle}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{app.company}</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800">
                      Applied: {app.date}
                    </span>
                    <span className="text-[9px] text-amber-400 font-bold">
                      {getOverdueText(app.followUpDate || '')}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => onNavigate('cover-letter')}
                  className="py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/20 text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
                >
                  Draft Follow-up <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Funnel Chart */}
        <div className="glass-card p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200">Application Funnel</h3>
            </div>
            <button 
              onClick={() => onNavigate('tracker')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition"
            >
              Open Tracker board <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-4">
            {funnelStages.map((stage, i) => {
              const count = applications.filter(app => app.status === stage.key).length;
              const percentage = Math.round((count / maxStageCount) * 100);
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">{stage.name}</span>
                    <span className="text-slate-200">{count} {count === 1 ? 'entry' : 'entries'}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
                    <div 
                      className={`h-full rounded-full ${stage.color} transition-all duration-700`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-slate-200">Recent Activity</h3>
            </div>

            <div className="space-y-4">
              {activities.map((act, i) => (
                <div key={i} className="flex gap-3 text-xs leading-relaxed group">
                  <div className="timeline-dot mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-300 group-hover:text-slate-200 transition">{act.text}</p>
                    <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 mt-6">
            <button 
              onClick={() => onNavigate('search')}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold hover:bg-indigo-500/20 transition-all duration-200"
            >
              <Compass className="h-3.5 w-3.5" /> Company Finder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
