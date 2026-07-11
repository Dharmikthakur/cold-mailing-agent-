'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardTab from '@/components/DashboardTab';
import JobSearchTab from '@/components/JobSearchTab';
import ResumeTailorTab from '@/components/ResumeTailorTab';
import CoverLetterTab from '@/components/CoverLetterTab';
import TrackerTab from '@/components/TrackerTab';
import InterviewTab from '@/components/InterviewTab';
import { Warp, warpPresets } from "@/components/ui/warp";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  skills: string[];
  description: string;
  requirements: string[];
  postedDate: string;
  salary: string;
}

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: 'bookmarked' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  date: string;
  notes?: string;
  followUpDate?: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [savedCompanies, setSavedCompanies] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };
  
  // Tracked metrics
  const [stats, setStats] = useState({
    explored: 6,
    tailored: 2,
    letters: 1
  });

  // Tracked Applications array
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 'job-1',
      jobTitle: 'Software Engineer Intern',
      company: 'Google',
      status: 'applied',
      date: '2026-06-24',
      notes: 'Applied through Google careers page. Follow up needed.',
      followUpDate: '2026-07-05' // In the past, follow-up is due!
    },
    {
      id: 'job-2',
      jobTitle: 'Frontend Engineer (React)',
      company: 'Stripe',
      status: 'bookmarked',
      date: '2026-06-25',
      notes: 'Looks like a great match for my React experience.'
    },
    {
      id: 'job-4',
      jobTitle: 'AI Research & Development Intern',
      company: 'Microsoft',
      status: 'interviewing',
      date: '2026-06-23',
      notes: 'Initial HR screen scheduled for next Tuesday at 10 AM.',
      followUpDate: '2026-07-12' // Future date
    }
  ]);

  // Load jobs list, saved companies & theme preference
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        setJobsList(data);
        setStats(prev => ({ ...prev, explored: data.length }));
      } catch (err) {
        console.error('Error loading jobs:', err);
      }
    };
    loadJobs();

    const saved = localStorage.getItem('savedCompanies');
    if (saved) {
      try {
        setSavedCompanies(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.body.classList.add('light');
    } else {
      setIsDarkMode(true);
      document.body.classList.remove('light');
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      if (next) {
        document.body.classList.remove('light');
      } else {
        document.body.classList.add('light');
      }
      return next;
    });
  };

  const handleToggleSaveCompany = (companyId: string) => {
    setSavedCompanies(prev => {
      const updated = prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId];
      localStorage.setItem('savedCompanies', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddApplication = (job: Job, status: Application['status'], followUpDate?: string) => {
    // Avoid duplicate application tracking
    if (applications.some(a => a.id === job.id)) return;
    
    // Auto-generate follow-up date for 'applied' if not provided (7 days from now)
    const autoFollowUp = status === 'applied' 
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined;

    const newApp: Application = {
      id: job.id,
      jobTitle: job.title,
      company: job.company,
      status,
      date: new Date().toISOString().split('T')[0],
      notes: `Tracked from Apply Mate search. Salary: ${job.salary}.`,
      followUpDate: followUpDate || autoFollowUp
    };

    setApplications(prev => [newApp, ...prev]);
  };

  const handleUpdateStatus = (id: string, newStatus: Application['status']) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, notes } : app
    ));
  };

  const handleUpdateFollowUpDate = (id: string, followUpDate: string) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, followUpDate } : app
    ));
  };

  const handleAddManualApplication = (
    jobTitle: string, 
    company: string, 
    status: Application['status'],
    followUpDate?: string
  ) => {
    const autoFollowUp = status === 'applied' 
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined;

    const newApp: Application = {
      id: `manual-${Date.now()}`,
      jobTitle,
      company,
      status,
      date: new Date().toISOString().split('T')[0],
      notes: 'Manually added tracking.',
      followUpDate: followUpDate || autoFollowUp
    };
    setApplications(prev => [newApp, ...prev]);
  };

  const handleRemoveApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  // Navigations with job payload shortcuts
  const handleNavigateToTab = (tab: string, job: Job) => {
    setSelectedJob(job);
    setActiveTab(tab);
  };

  // Choose colors based on active mode
  const defaultColors = isDarkMode
    ? ["#030712", "#0f172a", "#1e293b", "#0f172a"] // professional dark slate & steel
    : ["#ffffff", "#f8fafc", "#f1f5f9", "#ffffff"]; // clean light paper layout

  const warpParams = {
    rotation: 20 + mousePos.x * 30,
    speed: 0.05 + mousePos.y * 0.1,
    proportion: 0.45,
    softness: 1.0,
    distortion: 0.05 + mousePos.y * 0.05,
    swirl: 0.2,
    swirlIterations: 4,
    shapeScale: 0.08,
    shape: 'edge' as const,
    scale: 1.02 + mousePos.x * 0.05,
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`flex h-screen w-screen overflow-hidden relative transition-colors duration-350 bg-transparent ${
        isDarkMode ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* Background dynamic interactive shader */}
      <div className={`absolute inset-0 w-full h-full z-0 pointer-events-none transition-opacity duration-300 ${
        isDarkMode ? 'opacity-40 mix-blend-screen' : 'opacity-25'
      }`}>
        <Warp {...warpParams} colors={defaultColors} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Main Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        onToggleTheme={handleToggleTheme} 
      />

      {/* Workspace Panel Container */}
      <main className="flex-1 p-8 overflow-y-auto h-screen relative z-10">
        <div className={activeTab === 'dashboard' ? '' : 'hidden'}>
          <DashboardTab 
            stats={stats} 
            applications={applications} 
            onNavigate={(tab) => setActiveTab(tab)} 
          />
        </div>
        <div className={activeTab === 'search' ? '' : 'hidden'}>
          <JobSearchTab 
            applications={applications} 
            onAddApplication={handleAddApplication} 
            onNavigateToTab={handleNavigateToTab} 
            savedCompanies={savedCompanies}
            onToggleSaveCompany={handleToggleSaveCompany}
          />
        </div>
        <div className={activeTab === 'tailor' ? '' : 'hidden'}>
          <ResumeTailorTab 
            selectedJob={selectedJob} 
            jobsList={jobsList} 
            onIncrementTailored={() => setStats(prev => ({ ...prev, tailored: prev.tailored + 1 }))}
          />
        </div>
        <div className={activeTab === 'cover-letter' ? '' : 'hidden'}>
          <CoverLetterTab 
            selectedJob={selectedJob} 
            jobsList={jobsList} 
            onIncrementLetters={() => setStats(prev => ({ ...prev, letters: prev.letters + 1 }))}
          />
        </div>
        <div className={activeTab === 'tracker' ? '' : 'hidden'}>
          <TrackerTab 
            applications={applications} 
            onUpdateStatus={handleUpdateStatus} 
            onUpdateNotes={handleUpdateNotes}
            onUpdateFollowUpDate={handleUpdateFollowUpDate}
            onAddManualApplication={handleAddManualApplication}
            onRemoveApplication={handleRemoveApplication}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        </div>
        <div className={activeTab === 'interview' ? '' : 'hidden'}>
          <InterviewTab 
            selectedJob={selectedJob} 
            jobsList={jobsList} 
          />
        </div>
      </main>
    </div>
  );
}
