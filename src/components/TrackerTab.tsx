import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Trash2, 
  Calendar, 
  ChevronRight,
  ClipboardList,
  Edit3,
  X,
  Mail,
  Bell,
  CheckCircle,
  HelpCircle
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

interface TrackerTabProps {
  applications: Application[];
  onUpdateStatus: (id: string, newStatus: Application['status']) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateFollowUpDate: (id: string, date: string) => void;
  onAddManualApplication: (jobTitle: string, company: string, status: Application['status'], followUpDate?: string) => void;
  onRemoveApplication: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export default function TrackerTab({ 
  applications, 
  onUpdateStatus, 
  onUpdateNotes,
  onUpdateFollowUpDate,
  onAddManualApplication,
  onRemoveApplication,
  onNavigate
}: TrackerTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualStatus, setManualStatus] = useState<Application['status']>('bookmarked');
  const [manualFollowUp, setManualFollowUp] = useState('');

  const [activeNotesId, setActiveNotesId] = useState<string | null>(null);
  const [editingNotesText, setEditingNotesText] = useState('');
  const [editingFollowUpDate, setEditingFollowUpDate] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const columns: { label: string; key: Application['status']; color: string; border: string }[] = [
    { label: 'Bookmarked', key: 'bookmarked', color: 'bg-slate-500/10 text-slate-400', border: 'border-slate-800' },
    { label: 'Applied', key: 'applied', color: 'bg-indigo-500/10 text-indigo-400', border: 'border-indigo-500/20' },
    { label: 'Interviewing', key: 'interviewing', color: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/20' },
    { label: 'Offer', key: 'offer', color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/20' },
    { label: 'Archived', key: 'rejected', color: 'bg-rose-500/10 text-rose-450', border: 'border-rose-500/20' }
  ];

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualCompany.trim()) return;
    
    onAddManualApplication(manualTitle, manualCompany, manualStatus, manualFollowUp || undefined);
    
    setManualTitle('');
    setManualCompany('');
    setManualFollowUp('');
    setShowAddModal(false);
  };

  const handleOpenNotes = (app: Application) => {
    setActiveNotesId(app.id);
    setEditingNotesText(app.notes || '');
    setEditingFollowUpDate(app.followUpDate || '');
  };

  const handleSaveDetails = () => {
    if (activeNotesId) {
      onUpdateNotes(activeNotesId, editingNotesText);
      onUpdateFollowUpDate(activeNotesId, editingFollowUpDate);
      setActiveNotesId(null);
    }
  };

  // Check if follow-up is overdue
  const isFollowUpOverdue = (app: Application) => {
    return (
      (app.status === 'applied' || app.status === 'interviewing') &&
      app.followUpDate &&
      app.followUpDate <= todayStr
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-6 overflow-hidden animate-fade-in relative">
      {/* Header controls */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-1">Applications Tracker</h2>
          <p className="text-slate-400 text-sm">Organize, schedule, and keep track of your active outreach pipelines.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" /> Add Application
        </button>
      </div>

      {/* Board Layout */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-2 items-start select-none">
        {columns.map((col) => {
          const colApps = applications.filter(a => a.status === col.key);
          return (
            <div 
              key={col.key} 
              className="w-72 shrink-0 glass-card bg-slate-950/20 border-slate-900/60 p-4 h-full flex flex-col space-y-4"
            >
              {/* Column Title */}
              <div className="flex justify-between items-center shrink-0">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs text-slate-500 font-bold">{colApps.length}</span>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-0.5 select-text">
                {colApps.map((app) => {
                  const overdue = isFollowUpOverdue(app);
                  return (
                    <div 
                      key={app.id} 
                      className={`p-4 rounded-xl bg-slate-900/50 border transition-all duration-200 hover:scale-[1.01] ${
                        overdue 
                          ? 'border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.08)] bg-amber-500/[0.01]' 
                          : col.border
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{app.jobTitle}</h4>
                          {overdue && (
                            <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0 uppercase tracking-wide">
                              <Bell className="h-2 w-2 animate-bounce" /> Due
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 block">{app.company}</span>
                      </div>

                      <div className="space-y-1.5 mt-3 text-[10px] text-slate-500">
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Tracked: {app.date}
                        </p>
                        
                        {app.followUpDate && (
                          <p className={`flex items-center gap-1 font-semibold ${overdue ? 'text-amber-400' : 'text-slate-450'}`}>
                            <Bell className="h-3 w-3" /> Next Follow-up: {app.followUpDate}
                          </p>
                        )}
                      </div>

                      {/* Actions and status adjustments */}
                      <div className="flex justify-between items-center border-t border-slate-950/40 pt-2.5 mt-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenNotes(app)}
                            className="p-1 text-slate-500 hover:text-slate-350 transition-colors"
                            title="Edit Details & Notes"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          
                          {(app.status === 'applied' || app.status === 'interviewing') && (
                            <button
                              onClick={() => onNavigate('cover-letter')}
                              className="p-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                              title="Draft Outreach Email"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex gap-1.5 items-center">
                          {col.key !== 'rejected' && (
                            <button
                              onClick={() => {
                                const order: Application['status'][] = ['bookmarked', 'applied', 'interviewing', 'offer', 'rejected'];
                                const nextIdx = (order.indexOf(col.key) + 1) % order.length;
                                onUpdateStatus(app.id, order[nextIdx]);
                              }}
                              className="text-indigo-400 hover:text-indigo-300 transition text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5"
                            >
                              Next <ChevronRight className="h-3 w-3" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => onRemoveApplication(app.id)}
                            className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                            title="Delete Application"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colApps.length === 0 && (
                  <div className="h-24 flex items-center justify-center text-center border border-dashed border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-650 font-bold uppercase tracking-wider">Empty Stage</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Add Application Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-40 select-text">
          <form 
            onSubmit={handleAddManual}
            className="w-full max-w-sm glass-card border-indigo-500/20 bg-slate-950 p-6 space-y-4 animate-scale-in"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Add Job Application</h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-350 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Google"
                value={manualCompany}
                onChange={(e) => setManualCompany(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Pipeline Stage</label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="bookmarked">Bookmarked</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Follow-up Date</label>
                <input
                  type="date"
                  value={manualFollowUp}
                  onChange={(e) => setManualFollowUp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
            >
              Add Job to Board
            </button>
          </form>
        </div>
      )}

      {/* Edit Notes Modal/Panel */}
      {activeNotesId && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-45 select-text">
          <div className="w-full max-w-md glass-card border-indigo-500/20 bg-slate-950 p-6 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-indigo-400" /> Application Details & Notes
              </h3>
              <button 
                onClick={() => setActiveNotesId(null)}
                className="text-slate-500 hover:text-slate-355 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Next Follow-up Outreach Date</label>
                <input
                  type="date"
                  value={editingFollowUpDate}
                  onChange={(e) => setEditingFollowUpDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Interview Timeline, Contact, or Salary Details</label>
                <textarea
                  rows={4}
                  placeholder="Write interview schedules, specific recruiter emails, or follow-up details..."
                  value={editingNotesText}
                  onChange={(e) => setEditingNotesText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl py-3 px-4 text-xs text-slate-200 placeholder-slate-550 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveNotesId(null)}
                className="flex-1 py-2 px-4 rounded-xl border border-slate-805 hover:bg-slate-900 text-xs font-semibold text-slate-400 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDetails}
                className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
