import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw,
  Sparkles,
  Zap,
  Upload,
  GraduationCap,
  Briefcase,
  Terminal,
  Bookmark,
  ChevronRight,
  X
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  skills: string[];
}

interface ResumeTailorTabProps {
  selectedJob: Job | null;
  jobsList: Job[];
  onIncrementTailored: () => void;
}

interface ExtractedProfile {
  skills: string[];
  education: {
    degree: string;
    school: string;
    year: string;
    details?: string;
  };
  experience: {
    role: string;
    company: string;
    duration: string;
    bullets: string[];
  }[];
  projects: {
    title: string;
    description: string;
  }[];
  strengths: string[];
  gaps: string[];
}

export default function ResumeTailorTab({ selectedJob, jobsList, onIncrementTailored }: ResumeTailorTabProps) {
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  
  // Job target states
  const [targetJobId, setTargetJobId] = useState('');
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [customJobDescription, setCustomJobDescription] = useState('');

  // UI Flow States
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzingStep, setAnalyzingStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'skills' | 'experience' | 'projects' | 'education'>('skills');

  // Outputs
  const [extractedData, setExtractedData] = useState<ExtractedProfile | null>(null);
  const [tailorResult, setTailorResult] = useState<any | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [optimized, setOptimized] = useState(false);

  // Sync selected job
  useEffect(() => {
    if (selectedJob) {
      setTargetJobId(selectedJob.id);
    } else if (jobsList.length > 0) {
      setTargetJobId(jobsList[0].id);
    }
  }, [selectedJob, jobsList]);

  // Handle template selection
  const handleInsertTemplate = (type: 'react' | 'ai' | 'design') => {
    setFileName(null);
    setFileSize(null);
    
    if (type === 'react') {
      setResumeText(`DHARMIK THAKUR
dharmikthakur1978@gmail.com | Noida, India
Full Stack Developer intern skilled in React.js, Node.js, JavaScript, and CSS.

Education:
- B.Tech in Computer Science, Gyan Ganga Institute (GGITS), expected 2027. GPA: 8.2

Experience:
- Full Stack Developer Intern at SkillHigh. Developed user dashboards using React.js and linked MongoDB API routes in Express.
- Web Intern at SaiKet Systems. Styled responsive layouts in HTML5 and CSS3.

Projects:
- DevConnect Social App: MERN stack platform featuring user authentication, post feeds, and search.
- Kanban task board: Drag-and-drop cards using React.

Skills:
React.js, Node.js, JavaScript, MongoDB, HTML, CSS, Git, REST APIs`);
    } else if (type === 'ai') {
      setResumeText(`SANYA SHARMA
sanya@ai-email.com | Bangalore, India
AI Research enthusiast and Machine Learning developer.

Education:
- B.Tech in AI & Data Science, State Engineering College, expected 2027.

Experience:
- ML Intern at DeepVision. Fine-tuned vision models and constructed dataset loaders using PyTorch.

Projects:
- Agentic Chatbot: LLM rag chat agent using OpenAI APIs and Pinecone vector store.
- PyTorch Object Detector: Custom CNN architecture training pipelines.

Skills:
Python, PyTorch, LLMs, OpenAI API, NumPy, Vector Databases, Git, Machine Learning`);
    } else {
      setResumeText(`ARUN MEHTA
arun@design.com
UI/UX Designer and Frontend Prototyper.

Education:
- Bachelor of Design, Design Academy, 2026.

Experience:
- UI Design Intern at CreativeStudio. Created user flows, wireframes, and component systems in Figma.

Projects:
- FinTech App Design: Complete interactive high-fidelity prototyping project.
- CSS Component Library: Custom styles and layouts.

Skills:
UI/UX Design, Figma, Prototyping, Wireframing, User Research, CSS, HTML`);
    }
  };

  // PDF file upload handler simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    setFileName(file.name);
    // Format size
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileSize(`${sizeMB} MB`);

    // Simulate reading text from PDF
    setAnalyzingStep('Reading PDF structure...');
    setLoading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Set simulated text content based on file name
          const nameLower = file.name.toLowerCase();
          if (nameLower.includes('design') || nameLower.includes('ui')) {
            setResumeText("Simulated Designer PDF:\nArun Mehta, Designer, Figma, UI/UX, Wireframing");
          } else if (nameLower.includes('ai') || nameLower.includes('ml') || nameLower.includes('model')) {
            setResumeText("Simulated AI PDF:\nSanya Sharma, Python, PyTorch, LLMs, Deep Learning");
          } else {
            setResumeText("Simulated Developer PDF:\nDharmik Thakur, GGITS, React, Node, Express, MongoDB");
          }
          setAnalyzingStep('Scanning pages...');
          triggerAnalysisAPI(file.name);
          return 100;
        }
        return prev + 30;
      });
    }, 300);
  };

  const triggerAnalysisAPI = async (nameOfFile: string) => {
    try {
      setAnalyzingStep('Extracting key sections...');
      
      // Simulate endpoint call
      const res = await fetch('/api/ai/resume-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText: resumeText || `Developer Resume Name: ${nameOfFile}`, 
          fileName: nameOfFile 
        })
      });
      const data = await res.json();
      
      setAnalyzingStep('Identifying strengths & gaps...');
      setTimeout(() => {
        setExtractedData(data.parsedData);
        setAnalyzingStep(null);
        setLoading(false);
        setUploadProgress(0);
      }, 800);
    } catch (e) {
      console.error(e);
      setAnalyzingStep(null);
      setLoading(false);
    }
  };

  // Trigger manually pasted analyze
  const handleAnalyzePaste = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setAnalyzingStep('Parsing pasted resume content...');
    
    try {
      const res = await fetch('/api/ai/resume-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      });
      const data = await res.json();
      
      setAnalyzingStep('Extracting metadata schema...');
      setTimeout(() => {
        setExtractedData(data.parsedData);
        setAnalyzingStep(null);
        setLoading(false);
      }, 700);
    } catch (e) {
      console.error(e);
      setAnalyzingStep(null);
      setLoading(false);
    }
  };

  // Tailor Resume triggers
  const handleTailorToJob = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setOptimized(false);
    setAnalyzingStep('Analyzing alignment with job description...');

    try {
      const payload: any = { resume: resumeText };
      if (targetJobId === 'custom') {
        payload.customJobTitle = customJobTitle;
        payload.customJobDescription = customJobDescription;
      } else {
        payload.jobId = targetJobId;
      }

      const res = await fetch('/api/ai/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setTailorResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setAnalyzingStep(null);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApplyOptimization = () => {
    if (!tailorResult) return;
    setOptimized(true);
    onIncrementTailored();
  };

  const scoreValue = tailorResult 
    ? (optimized ? tailorResult.potentialScore : tailorResult.currentScore)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'stroke-emerald-500 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    if (score >= 50) return 'stroke-amber-500 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    return 'stroke-rose-500 text-rose-450 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-140px)] overflow-hidden animate-fade-in">
      {/* Left Input panel (Span 2) */}
      <div className="lg:col-span-2 flex flex-col h-full space-y-5 overflow-y-auto pr-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-1">Resume Analyzer</h2>
          <p className="text-slate-400 text-sm">Upload a PDF resume to extract skills, history, and find gaps.</p>
        </div>

        {/* Upload & Drag-and-drop Card */}
        <div className="glass-card p-5 space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Resume Document</span>
          
          <div className="relative border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-900/10">
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer" 
              disabled={loading}
            />
            <Upload className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 mb-2.5 transition-colors" />
            <span className="text-xs font-semibold text-slate-350 block">Drag & Drop PDF here or Click to browse</span>
            <span className="text-[10px] text-slate-500 mt-1 block">PDF files up to 5MB</span>
          </div>

          {fileName && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <div className="truncate max-w-[180px]">
                  <span className="font-semibold text-slate-200 block truncate">{fileName}</span>
                  <span className="text-[10px] text-slate-500 block">{fileSize}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Loaded</span>
            </div>
          )}

          {/* Quick Predefined Templates */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Or Use A Demo Profile</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button 
                onClick={() => handleInsertTemplate('react')}
                className="py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-[10px] font-semibold text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300 transition"
              >
                React Intern
              </button>
              <button 
                onClick={() => handleInsertTemplate('ai')}
                className="py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-[10px] font-semibold text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300 transition"
              >
                AI Intern
              </button>
              <button 
                onClick={() => handleInsertTemplate('design')}
                className="py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-[10px] font-semibold text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300 transition"
              >
                UI Designer
              </button>
            </div>
          </div>

          {/* Text Area Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Raw Resume Text</label>
            <textarea
              rows={6}
              placeholder="Paste raw text or type details to analyze..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-3.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 resize-none font-mono leading-relaxed"
            />
          </div>

          <button
            onClick={handleAnalyzePaste}
            disabled={loading || !resumeText.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> {analyzingStep || 'Processing...'}
              </>
            ) : (
              <>
                <Cpu className="h-4 w-4" /> Analyze Resume Structure
              </>
            )}
          </button>
        </div>

        {/* Alignment Tailoring Card */}
        {extractedData && (
          <div className="glass-card p-5 space-y-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Target Alignment Tailoring</span>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-450">Target Company / Role</label>
                <select
                  value={targetJobId}
                  onChange={(e) => setTargetJobId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {jobsList.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} · {job.company}
                    </option>
                  ))}
                  <option value="custom">-- Custom Job details --</option>
                </select>
              </div>

              {targetJobId === 'custom' && (
                <div className="space-y-2.5 border-l-2 border-indigo-500/20 pl-3.5 py-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Intern"
                      value={customJobTitle}
                      onChange={(e) => setCustomJobTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Job Description</label>
                    <textarea
                      rows={3}
                      placeholder="Paste key requirements..."
                      value={customJobDescription}
                      onChange={(e) => setCustomJobDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleTailorToJob}
                disabled={loading}
                className="w-full py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Zap className="h-3.5 w-3.5" /> Tailor Resume Bullets
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Output Panel (Span 3) */}
      <div className="lg:col-span-3 flex flex-col h-full overflow-y-auto pr-1">
        {loading && uploadProgress > 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 glass-card">
            <RefreshCw className="h-10 w-10 text-indigo-400 animate-spin mb-4" />
            <h3 className="text-slate-250 font-bold text-sm">{analyzingStep}</h3>
            <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden mt-3 border border-slate-850">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-650 transition-all duration-350"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {!loading && extractedData ? (
          <div className="space-y-6">
            {/* Strengths & Gaps Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="glass-card p-5 border-emerald-500/10 bg-emerald-500/[0.01] space-y-3.5">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Key Profile Strengths
                </span>
                <ul className="space-y-2.5">
                  {extractedData.strengths.map((str, i) => (
                    <li key={i} className="text-xs text-slate-300 flex gap-2 items-start leading-relaxed">
                      <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div className="glass-card p-5 border-rose-500/10 bg-rose-500/[0.01] space-y-3.5">
                <span className="text-[10px] text-rose-455 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-500" /> Skill Gaps Identified
                </span>
                <ul className="space-y-2.5">
                  {extractedData.gaps.map((gap, i) => (
                    <li key={i} className="text-xs text-slate-300 flex gap-2 items-start leading-relaxed">
                      <X className="h-3.5 w-3.5 mt-0.5 text-rose-500 shrink-0" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Extracted Profile Sections */}
            <div className="glass-card p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Extracted Resume Sections
                </span>
                
                {/* Tabs */}
                <div className="flex gap-1.5">
                  {(['skills', 'experience', 'projects', 'education'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveAnalysisTab(tab)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                        activeAnalysisTab === tab
                          ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300'
                          : 'text-slate-500 hover:text-slate-350 border border-transparent'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Outputs */}
              <div className="min-h-48">
                {/* Skills Tab */}
                {activeAnalysisTab === 'skills' && (
                  <div className="space-y-3 animate-fade-in">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Core Technical Skills Extracted</span>
                    <div className="flex flex-wrap gap-2">
                      {extractedData.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience Tab */}
                {activeAnalysisTab === 'experience' && (
                  <div className="space-y-4 animate-fade-in">
                    {extractedData.experience.map((exp, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/35 border border-slate-900 space-y-2">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-200">{exp.role}</h4>
                            <span className="text-[10px] text-indigo-400 font-bold mt-0.5 block">{exp.company}</span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-900">
                            {exp.duration}
                          </span>
                        </div>
                        <ul className="space-y-1.5 mt-2 pl-1">
                          {exp.bullets.map((bullet, i) => (
                            <li key={i} className="text-xs text-slate-400 flex gap-2 items-start leading-relaxed">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-700 mt-1.5 shrink-0" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects Tab */}
                {activeAnalysisTab === 'projects' && (
                  <div className="space-y-4 animate-fade-in">
                    {extractedData.projects.map((proj, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/35 border border-slate-900 space-y-2">
                        <h4 className="text-xs font-extrabold text-slate-200 flex items-center gap-1.5">
                          <Terminal className="h-3.5 w-3.5 text-indigo-400" /> {proj.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Education Tab */}
                {activeAnalysisTab === 'education' && (
                  <div className="p-4 rounded-xl bg-slate-900/35 border border-slate-900 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-indigo-400" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-200">{extractedData.education.degree}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{extractedData.education.school}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-900/80 pt-2.5 mt-2 text-xs text-slate-400 leading-relaxed">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-550 block mb-1">Academic Timeline & Info</span>
                      <p className="font-semibold text-slate-300">{extractedData.education.year}</p>
                      {extractedData.education.details && <p className="mt-1">{extractedData.education.details}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resume Tailor Suggestion Section if tailor result loaded */}
            {tailorResult && (
              <div className="glass-card p-5 space-y-5 border-indigo-500/20">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Alignment Score & Bullet Recommendations
                  </span>
                </div>

                {/* Score Visual Dial Block */}
                <div className="flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-950/40 border border-slate-900/60">
                  {/* Circular SVG Dial */}
                  <div className="relative flex items-center justify-center shrink-0 w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="38"
                        className="stroke-slate-800"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="38"
                        className={`transition-all duration-1000 ease-out ${getScoreColor(scoreValue)}`}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={2 * Math.PI * 38 - (scoreValue / 100) * (2 * Math.PI * 38)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-slate-100">{scoreValue}%</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">ATS Match</span>
                    </div>
                  </div>

                  {/* Description and Action */}
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-sm font-bold text-slate-200">
                      {optimized 
                        ? "Excellent! ATS Match Optimized" 
                        : `Resume compared to ${tailorResult.jobTitle}`
                      }
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                      {optimized 
                        ? "Awesome job! Bullet points have been tailored using job keywords. This will optimize ATS performance."
                        : `Aligning missing keywords will increase your ATS compatibility score from ${tailorResult.currentScore}% to ${tailorResult.potentialScore}%.`
                      }
                    </p>
                    {!optimized && (
                      <button
                        onClick={handleApplyOptimization}
                        className="mt-2 py-1.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-450 hover:text-emerald-350 font-bold text-xs transition"
                      >
                        Optimize Bullets
                      </button>
                    )}
                  </div>
                </div>

                {/* Keyword Alignment Grid */}
                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Keyword Alignment Analysis</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Matching Keywords */}
                    <div className="p-4 rounded-xl bg-emerald-500/[0.01] border border-emerald-500/10 space-y-2">
                      <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-widest block flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Matched Keywords ({tailorResult.matchingSkills?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tailorResult.matchingSkills && tailorResult.matchingSkills.length > 0 ? (
                          tailorResult.matchingSkills.map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-1 rounded bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-semibold text-emerald-300">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">No keywords matched yet</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="p-4 rounded-xl bg-rose-500/[0.01] border border-rose-500/10 space-y-2">
                      <span className="text-[9px] uppercase font-bold text-rose-455 tracking-widest block flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-550" /> Missing Keywords ({tailorResult.missingSkills?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tailorResult.missingSkills && tailorResult.missingSkills.length > 0 ? (
                          tailorResult.missingSkills.map((skill: string, i: number) => (
                            <span key={i} className={`px-2 py-1 rounded text-[10px] font-semibold border transition-all duration-300 ${
                              optimized 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-rose-500/5 border border-rose-500/10 text-rose-400'
                            }`}>
                              {skill} {optimized && "✓"}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">None - 100% matched!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {tailorResult.bulletSuggestions.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-900 bg-slate-900/20 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Original Bullet</span>
                          <p className="text-xs text-slate-400 italic bg-slate-950/20 p-2.5 rounded-lg">{item.original}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-indigo-400 block mb-1">AI Optimized Recommendation</span>
                          <p className="text-xs text-slate-200 font-medium bg-slate-950/45 p-2.5 rounded-lg border border-indigo-500/10 leading-relaxed">
                            {item.tailored}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-slate-900/60 pt-2.5">
                        <span className="text-[9px] text-slate-500 font-semibold">{item.reason}</span>
                        <button
                          onClick={() => handleCopy(item.tailored, idx)}
                          className="py-1.5 px-3 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-350 hover:text-white transition flex items-center gap-1"
                        >
                          {copiedIndex === idx ? <><Check className="h-3 w-3 text-emerald-500" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy Bullet</>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
            <FileText className="h-12 w-12 text-slate-700 mb-3" />
            <h3 className="text-slate-400 font-semibold text-sm">No resume analysis loaded</h3>
            <p className="text-slate-500 text-xs mt-1.5 max-w-xs leading-relaxed">
              Upload a PDF resume document or paste raw text details and click "Analyze" to extract details, check strengths, and align core gaps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
