import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Send,
  RotateCcw,
  Link,
  Mail,
  User,
  AlertCircle
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  skills?: string[];
}

interface CoverLetterTabProps {
  selectedJob: Job | null;
  jobsList: Job[];
  onIncrementLetters: () => void;
}

export default function CoverLetterTab({ selectedJob, jobsList, onIncrementLetters }: CoverLetterTabProps) {
  // Target inputs
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer Intern');
  const [technologies, setTechnologies] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  
  // Developer credentials
  const [portfolioLink, setPortfolioLink] = useState('https://dharmik.dev');
  const [githubLink, setGithubLink] = useState('https://github.com/dharmikthakur');
  const [candidateSummary, setCandidateSummary] = useState(
    'I am a Computer Science student at GGITS with internship experience at SkillHigh, building responsive React.js frontends and connecting RESTful MongoDB database endpoints.'
  );

  // Email parameters
  const [emailType, setEmailType] = useState<'outreach' | 'followup'>('outreach');
  const [loading, setLoading] = useState(false);
  
  // Results
  const [subjectText, setSubjectText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync selected job/company details
  useEffect(() => {
    if (selectedJob) {
      setTargetCompany(selectedJob.company);
      setTargetRole(selectedJob.title || 'Software Engineer Intern');
      if (selectedJob.skills) {
        setTechnologies(selectedJob.skills.join(', '));
      }
      
      // Auto-look up recruiter details from companies database if available
      const checkRecruiterDetails = async () => {
        try {
          const res = await fetch(`/api/companies?query=${encodeURIComponent(selectedJob.company)}`);
          const data = await res.json();
          const match = data.find((c: any) => c.name.toLowerCase() === selectedJob.company.toLowerCase());
          if (match) {
            setRecruiterEmail(match.hrEmail || 'jobs@' + selectedJob.company.toLowerCase() + '.com');
            if (match.hiringContacts && match.hiringContacts.length > 0) {
              setRecruiterName(match.hiringContacts[0].name);
            }
          } else {
            setRecruiterEmail('jobs@' + selectedJob.company.toLowerCase() + '.com');
            setRecruiterName('');
          }
        } catch (e) {
          setRecruiterEmail('jobs@' + selectedJob.company.toLowerCase() + '.com');
        }
      };
      checkRecruiterDetails();
    } else {
      setTargetCompany('Vercel');
      setTargetRole('Software Engineer Intern');
      setTechnologies('React, Next.js, TypeScript');
      setRecruiterEmail('recruiting@vercel.com');
      setRecruiterName('Sarah Chen');
    }
  }, [selectedJob]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/email-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: targetCompany,
          jobRole: targetRole,
          technologies: technologies.split(',').map(s => s.trim()).filter(Boolean),
          resumeSnippet: candidateSummary,
          portfolioLink,
          githubLink,
          emailType,
          contactName: recruiterName
        })
      });

      const data = await res.json();
      setSubjectText(data.subject);
      setBodyText(data.emailBody);
      onIncrementLetters();
    } catch (err) {
      console.error('Error generating email:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const fullMessage = `Subject: ${subjectText}\n\n${bodyText}`;
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open native mail app with pre-filled details (leaves final sending decision to the user)
  const handleSendEmail = () => {
    const emailTo = recruiterEmail || 'hr@company.com';
    const emailSubject = encodeURIComponent(subjectText);
    const emailBody = encodeURIComponent(bodyText);
    window.location.href = `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-140px)] overflow-hidden animate-fade-in">
      {/* Left Input Panel (Span 2) */}
      <div className="lg:col-span-2 flex flex-col h-full space-y-5 overflow-y-auto pr-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-1">Email Generator</h2>
          <p className="text-slate-400 text-sm">Write personalized cold outreach and follow-up templates.</p>
        </div>

        <div className="glass-card p-5 space-y-4">
          {/* Target Company specs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role / Title</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Recruiter / Contact details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <User className="h-3 w-3" /> Contact Name
              </label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Mail className="h-3 w-3" /> Recruiter Email
              </label>
              <input
                type="email"
                placeholder="e.g. jobs@google.com"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Technologies Used</label>
            <input
              type="text"
              placeholder="e.g. React, PyTorch, Node.js"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Link className="h-3 w-3" /> Portfolio
              </label>
              <input
                type="url"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Link className="h-3 w-3" /> GitHub Link
              </label>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Candidate Experience snippet */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Outreach Resume Highlights</label>
            <textarea
              rows={4}
              placeholder="Write core highlights or copy paste resume summary..."
              value={candidateSummary}
              onChange={(e) => setCandidateSummary(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Email Type selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Strategy</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setEmailType('outreach')}
                className={`py-2 px-3 border rounded-xl text-xs font-semibold transition ${
                  emailType === 'outreach'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                Initial Cold Outreach
              </button>
              <button
                onClick={() => setEmailType('followup')}
                className={`py-2 px-3 border rounded-xl text-xs font-semibold transition ${
                  emailType === 'followup'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                Follow-up (1 Week)
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" /> Customizing email draft...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate Personalized Email
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Output Panel (Span 3) */}
      <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
        {bodyText ? (
          <div className="glass-card flex-1 flex flex-col overflow-hidden">
            {/* Header controls */}
            <div className="border-b border-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/20 shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-indigo-400" /> Outreach Email Preview
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="py-1.5 px-3 rounded-lg border border-slate-800 hover:border-slate-700 text-[10px] font-semibold text-slate-350 hover:text-white transition flex items-center gap-1"
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copy Subject & Body</>
                  )}
                </button>
                <button
                  onClick={handleSendEmail}
                  className="py-1.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/10"
                >
                  <Send className="h-3.5 w-3.5" /> Open Email Client
                </button>
              </div>
            </div>

            {/* Subject Line display */}
            <div className="p-4 border-b border-slate-900/80 bg-slate-950/10 space-y-1 shrink-0">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Subject Line</span>
              <input
                type="text"
                value={subjectText}
                onChange={(e) => setSubjectText(e.target.value)}
                className="w-full bg-transparent text-slate-200 text-xs font-bold focus:outline-none"
              />
            </div>

            {/* Email Body text area */}
            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full h-full bg-transparent text-slate-250 text-xs leading-relaxed focus:outline-none resize-none font-sans whitespace-pre-wrap"
              />
            </div>

            <div className="p-3 border-t border-slate-900 bg-slate-950/20 text-[10px] text-slate-500 flex items-center gap-1.5 font-semibold">
              <AlertCircle className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>Email client will launch default application (`mailto:` link). No message will be sent without your approval.</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
            <Sparkles className="h-12 w-12 text-slate-700 mb-3" />
            <h3 className="text-slate-400 font-semibold text-sm">No outreach email generated</h3>
            <p className="text-slate-500 text-xs mt-1.5 max-w-xs leading-relaxed">
              Confirm candidate credentials and target company details, then select your strategy and click "Generate".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
