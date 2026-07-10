import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Building2, 
  Globe, 
  Mail, 
  Star, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  X,
  Compass,
  Layers,
  Link
} from 'lucide-react';

interface Recruiter {
  name: string;
  role: string;
  linkedin: string;
  source: string;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  remote: string;
  description: string;
  technologies: string[];
  careersPage: string;
  hrEmail: string;
  linkedin: string;
  hiringContacts: Recruiter[];
}

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: 'bookmarked' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  date: string;
}

interface JobSearchTabProps {
  applications: Application[];
  onAddApplication: (job: any, status: Application['status']) => void;
  onNavigateToTab: (tab: string, selectedJob: any) => void;
  savedCompanies: string[];
  onToggleSaveCompany: (companyId: string) => void;
}

export default function JobSearchTab({ 
  applications, 
  onAddApplication, 
  onNavigateToTab,
  savedCompanies,
  onToggleSaveCompany
}: JobSearchTabProps) {
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Search Mode Toggle: 'companies' or 'jobs'
  const [searchMode, setSearchMode] = useState<'companies' | 'jobs'>('companies');
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // Advanced filters
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedRemote, setSelectedRemote] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [onlyInternships, setOnlyInternships] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const url = `/api/companies?query=${encodeURIComponent(searchQuery)}&size=${selectedSize}&remote=${selectedRemote}&industry=${selectedIndustry}`;
      const res = await fetch(url);
      const data = await res.json();
      setCompaniesList(data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const typeParam = selectedRemote.toLowerCase();
      const url = `/api/jobs?query=${encodeURIComponent(searchQuery)}&type=${typeParam}&industry=${selectedIndustry}&size=${selectedSize}&internship=${onlyInternships}`;
      const res = await fetch(url);
      const data = await res.json();
      setJobsList(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  // Re-fetch on filter or mode change
  useEffect(() => {
    if (searchMode === 'companies') {
      fetchCompanies();
    } else {
      fetchJobs();
    }
  }, [selectedSize, selectedRemote, selectedIndustry, searchMode, onlyInternships]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === 'companies') {
      fetchCompanies();
    } else {
      fetchJobs();
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const isCompanySaved = (companyId: string) => {
    return savedCompanies.includes(companyId);
  };

  // Filter list locally for "Saved Only" toggle
  const displayedCompanies = showSavedOnly 
    ? companiesList.filter(c => isCompanySaved(c.id))
    : companiesList;

  // Prepare a mock "job" payload so that the Email Generator can pick it up seamlessly
  const handleInitiateOutreach = (company: Company) => {
    const jobPayload = {
      id: `company-${company.id}`,
      title: 'Software Engineer Intern',
      company: company.name,
      location: company.location,
      type: 'Internship',
      salary: 'Competitive / Unspecified',
      postedDate: 'Ongoing',
      description: company.description,
      requirements: [`Familiarity with ${company.technologies.slice(0, 3).join(', ')}`],
      skills: company.technologies
    };
    
    // Navigate to email generator tab with pre-filled company info
    onNavigateToTab('cover-letter', jobPayload);
  };

  const industries = ["all", "Search & AI", "Fintech", "Developer Tools", "Design", "Artificial Intelligence", "SaaS", "EdTech"];
  const sizes = ["all", "Startup", "Mid-sized", "Enterprise"];
  const remotes = ["all", "Remote", "Hybrid", "On-site"];

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 relative overflow-hidden animate-fade-in">
      {/* Left Area: Listings and Filters */}
      <div className="flex-1 flex flex-col h-full space-y-6 overflow-y-auto pr-1">
        {/* Title and Search Form */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-1">
              {searchMode === 'companies' ? 'Company Finder' : 'Live Job Search'}
            </h2>
            <p className="text-slate-400 text-sm">
              {searchMode === 'companies' 
                ? 'Discover tech companies, fetch verified hiring contacts, and draft outreaches.' 
                : 'Browse live technical openings and internships in India and globally via Adzuna.'}
            </p>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder={searchMode === 'companies' 
                  ? "Search keywords (React, AI, Startup, Stripe)..." 
                  : "Search job titles (React, Python, Backend, Android)..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 px-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Search Mode Toggle buttons */}
        <div className="flex p-1.5 rounded-2xl bg-slate-950/60 border border-slate-900 self-start gap-1.5">
          <button
            type="button"
            onClick={() => setSearchMode('companies')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
              searchMode === 'companies'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Building2 className="h-4 w-4" /> Company Contacts
          </button>
          <button
            type="button"
            onClick={() => setSearchMode('jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
              searchMode === 'jobs'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Compass className="h-4 w-4" /> Live Jobs Index
          </button>
        </div>

        {/* Filters Controls Panel */}
        <div className="glass-card p-4 space-y-3.5 border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-indigo-400" /> Filter Criteria
            </span>
            
            {/* Saved list toggle (only applicable in companies mode) */}
            <button
              onClick={() => {
                if (searchMode === 'companies') {
                  setShowSavedOnly(!showSavedOnly);
                }
              }}
              className={`flex items-center gap-1.5 py-1 px-3.5 rounded-full text-xs font-bold transition ${
                searchMode === 'jobs' 
                  ? 'opacity-30 cursor-not-allowed bg-slate-900 border border-slate-850 text-slate-500'
                  : showSavedOnly 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              disabled={searchMode === 'jobs'}
            >
              <Star className={`h-3.5 w-3.5 ${showSavedOnly && searchMode === 'companies' ? 'fill-amber-400' : ''}`} />
              <span>Saved List ({savedCompanies.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Industry selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none"
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind === 'all' ? 'All Industries' : ind}</option>
                ))}
              </select>
            </div>

            {/* Size selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scale / Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none"
              >
                {sizes.map(sz => (
                  <option key={sz} value={sz}>{sz === 'all' ? 'All Sizes' : sz}</option>
                ))}
              </select>
            </div>

            {/* Remote policy selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Model</label>
              <select
                value={selectedRemote}
                onChange={(e) => setSelectedRemote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none"
              >
                {remotes.map(rem => (
                  <option key={rem} value={rem}>{rem === 'all' ? 'All Policies' : rem}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Internships Checkbox filter */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-900/60">
            <input
              type="checkbox"
              id="onlyInternships"
              checked={onlyInternships}
              onChange={(e) => setOnlyInternships(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
            />
            <label htmlFor="onlyInternships" className="text-xs font-bold text-slate-350 hover:text-slate-200 cursor-pointer flex items-center gap-1.5 select-none">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Only Show Internships & Co-ops
            </label>
          </div>
        </div>

        {/* Results List */}
        {searchMode === 'companies' ? (
          loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest animate-pulse">Loading companies list...</span>
            </div>
          ) : displayedCompanies.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 glass-card border-dashed">
              <p className="text-sm text-slate-400 font-medium">No companies match your query filters.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedSize('all'); setSelectedRemote('all'); setSelectedIndustry('all'); setShowSavedOnly(false); }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-3"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {displayedCompanies.map((company) => {
                const isSaved = isCompanySaved(company.id);
                const isSelected = selectedCompany?.id === company.id;
                return (
                  <div
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className={`glass-card p-5 cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform ${
                      isSelected 
                        ? 'border-indigo-500/60 bg-indigo-500/[0.04] shadow-[0_4px_20px_-5px_rgba(99,102,241,0.2)]' 
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-200 group-hover:text-white transition flex items-center gap-1.5">
                            {company.name}
                          </h3>
                          <span className="text-xs text-slate-400 font-semibold mt-0.5 block">{company.industry}</span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSaveCompany(company.id);
                          }}
                          className={`p-1.5 rounded-lg border transition ${
                            isSaved 
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-350'
                          }`}
                          title={isSaved ? "Saved to list" : "Save company"}
                        >
                          <Star className={`h-4 w-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {company.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {company.technologies.slice(0, 3).map((tech, index) => (
                          <span key={index} className="text-[10px] bg-slate-900/60 border border-slate-800/80 text-slate-400 px-2 py-0.5 rounded-md font-semibold">
                            {tech}
                          </span>
                        ))}
                        {company.technologies.length > 3 && (
                          <span className="text-[10px] text-slate-500 px-1 py-0.5 font-bold">
                            +{company.technologies.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-800/60 pt-4 mt-4 text-[10px] font-medium text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {company.location}</span>
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {company.size} · {company.remote}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Live Job List Mode */
          jobsLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest animate-pulse">Querying Live Adzuna Jobs Index...</span>
            </div>
          ) : jobsList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 glass-card border-dashed">
              <p className="text-sm text-slate-400 font-medium">No live job listings matched your search criteria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedRemote('all'); fetchJobs(); }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-3"
              >
                Reset Live Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {jobsList.map((job) => (
                <div
                  key={job.id}
                  className="glass-card p-5 border-slate-800 flex flex-col justify-between hover:scale-[1.01] transition-transform"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-200 flex items-center gap-1.5 leading-snug">
                          {job.title}
                        </h3>
                        <span className="text-xs text-indigo-400 font-bold mt-0.5 block">{job.company}</span>
                      </div>
                      <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide">
                        {job.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-mono">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills.slice(0, 4).map((skill: string, index: number) => (
                        <span key={index} className="text-[9px] bg-slate-900/80 border border-slate-850 text-slate-400 px-2 py-0.5 rounded font-semibold">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="text-[9px] text-slate-500 font-bold">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-850/60 pt-4 mt-4 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-500" /> {job.location}</span>
                      <span className="text-emerald-400/90 font-bold">{job.salary}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => onNavigateToTab('tailor', job)}
                        className="py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-transparent text-[10px] font-extrabold transition text-center"
                      >
                        Analyze Resume
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateToTab('cover-letter', job)}
                        className="py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-500/20 hover:border-transparent text-[10px] font-extrabold transition text-center"
                      >
                        Write Outreach
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Right Drawer: Contact Discovery */}
      {selectedCompany && (
        <div className="w-[450px] shrink-0 border-l border-slate-800/80 bg-slate-950/20 backdrop-blur-2xl p-6 h-full flex flex-col justify-between overflow-y-auto space-y-6 animate-slide-in">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                  {selectedCompany.industry}
                </span>
                <h3 className="font-extrabold text-xl text-slate-100 mt-3 leading-none">{selectedCompany.name}</h3>
                <span className="text-xs font-semibold text-slate-400 mt-1.5 block">{selectedCompany.location}</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onToggleSaveCompany(selectedCompany.id)}
                  className={`p-1.5 rounded-lg border transition ${
                    isCompanySaved(selectedCompany.id) 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <Star className={`h-4 w-4 ${isCompanySaved(selectedCompany.id) ? 'fill-amber-400' : ''}`} />
                </button>
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-500 hover:text-slate-350 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/40 p-4 rounded-xl border border-slate-900">
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Company Size</span>
                <div className="text-slate-300 font-medium">{selectedCompany.size}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Work Model</span>
                <div className="text-slate-300 font-medium">{selectedCompany.remote} Policy</div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Company Mission</h4>
              <p className="text-xs text-slate-350 leading-relaxed">{selectedCompany.description}</p>
            </div>

            {/* Core Stack */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Tech Stack & Keywords</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedCompany.technologies.map((tech, i) => (
                  <span key={i} className="text-[10px] bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 font-semibold px-2.5 py-1 rounded-lg">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Discovery Sections */}
            <div className="space-y-4 border-t border-slate-900 pt-5">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-indigo-400" /> Contact Discovery
              </h4>
              
              <div className="space-y-2.5">
                {/* Careers page link */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-900">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide leading-none">Careers Hub</span>
                      <span className="text-[10px] text-slate-350 font-medium block truncate max-w-[200px] mt-0.5">careers_page_source</span>
                    </div>
                  </div>
                  <a 
                    href={selectedCompany.careersPage} 
                    target="_blank" 
                    rel="noreferrer"
                    className="py-1 px-3 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[10px] font-bold transition flex items-center gap-1 shrink-0"
                  >
                    Open Page <Link className="h-3 w-3" />
                  </a>
                </div>

                {/* Published HR email */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-900">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide leading-none">HR Outreach Email</span>
                      <span className="text-[10px] text-slate-300 font-semibold block mt-0.5">{selectedCompany.hrEmail}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCopyEmail(selectedCompany.hrEmail)}
                    className="py-1 px-3 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold transition shrink-0"
                  >
                    {copiedEmail ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Corporate LinkedIn */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-900">
                  <div className="flex items-center gap-2">
                    <Link className="h-3.5 w-3.5 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide leading-none">LinkedIn Profile</span>
                      <span className="text-[10px] text-slate-350 font-medium block truncate max-w-[200px] mt-0.5">linkedin.com/company/{selectedCompany.name.toLowerCase()}</span>
                    </div>
                  </div>
                  <a 
                    href={selectedCompany.linkedin} 
                    target="_blank" 
                    rel="noreferrer"
                    className="py-1 px-3 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold transition shrink-0"
                  >
                    Visit
                  </a>
                </div>
              </div>

              {/* Recruiter Hiring Contacts */}
              <div className="space-y-3.5 pt-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Recruiter / Hiring Lead Contacts</span>
                
                <div className="space-y-2">
                  {selectedCompany.hiringContacts.map((contact, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-850 bg-slate-950/30 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-slate-250 block">{contact.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{contact.role}</span>
                        </div>
                        <a 
                          href={contact.linkedin} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-900 text-slate-450 hover:text-indigo-400 transition"
                          title="LinkedIn Profile"
                        >
                          <Link className="h-3.5 w-3.5" />
                        </a>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-900/60 pt-2 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        <span>Source:</span>
                        <span className="text-indigo-400/90">{contact.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-900 pt-5 space-y-3 shrink-0">
            <button
              onClick={() => handleInitiateOutreach(selectedCompany)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/10"
            >
              <Sparkles className="h-4 w-4" /> Draft Personalized Outreach
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
