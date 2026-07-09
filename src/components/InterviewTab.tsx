import React, { useState, useEffect } from 'react';
import { 
  MessageSquareCode, 
  RefreshCw, 
  ArrowRight, 
  HelpCircle, 
  BookOpen, 
  CheckCircle,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
}

interface InterviewTabProps {
  selectedJob: Job | null;
  jobsList: Job[];
}

interface Question {
  id: string;
  question: string;
  category: string;
}

interface EvaluationResult {
  grade: string;
  feedback: string;
  modelAnswer: string;
}

export default function InterviewTab({ selectedJob, jobsList }: InterviewTabProps) {
  const [targetJobId, setTargetJobId] = useState('');
  const [customJobTitle, setCustomJobTitle] = useState('');
  
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const [userAnswer, setUserAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  // Sync selected job
  useEffect(() => {
    if (selectedJob) {
      setTargetJobId(selectedJob.id);
    } else if (jobsList.length > 0) {
      setTargetJobId(jobsList[0].id);
    }
  }, [selectedJob, jobsList]);

  const handleStartSession = async () => {
    try {
      setLoadingQuestions(true);
      setQuestions([]);
      setCurrentIdx(0);
      setEvaluation(null);
      setSessionFinished(false);
      setUserAnswer('');
      setShowModelAnswer(false);

      const payload: any = {};
      if (targetJobId === 'custom') {
        payload.jobTitle = customJobTitle || 'Software Engineer';
      } else {
        const matched = jobsList.find(j => j.id === targetJobId);
        payload.jobTitle = matched ? matched.title : 'Software Engineer';
      }
      payload.mode = 'generate';

      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setQuestions(data.questions);
    } catch (err) {
      console.error('Error starting interview session:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    try {
      setSubmittingAnswer(true);
      const activeQuestion = questions[currentIdx];
      
      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'evaluate',
          questionText: activeQuestion.question,
          userAnswer
        })
      });

      const data = await res.json();
      setEvaluation(data);
    } catch (err) {
      console.error('Error evaluating answer:', err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleNext = () => {
    setUserAnswer('');
    setEvaluation(null);
    setShowModelAnswer(false);
    
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setSessionFinished(true);
    }
  };

  const getGradeStyle = (grade: string) => {
    if (grade === 'A') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    if (grade === 'B') return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30';
    if (grade === 'C') return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    return 'bg-rose-500/10 text-rose-450 border border-rose-500/30';
  };

  const getGradeHeading = (grade: string) => {
    if (grade === 'A') return 'Excellent Answer!';
    if (grade === 'B') return 'Solid Response';
    if (grade === 'C') return 'Needs Enhancement';
    return 'Weak or Incomplete';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-140px)] overflow-hidden animate-fade-in">
      {/* Left Selector/Session parameters panel (Span 2) */}
      <div className="lg:col-span-2 flex flex-col h-full space-y-5 overflow-y-auto pr-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-1">Interview Prep Coach</h2>
          <p className="text-slate-400 text-sm">Practice behavioral and technical questions with instant grading feedback.</p>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Practice Role</label>
            <select
              value={targetJobId}
              onChange={(e) => setTargetJobId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {jobsList.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} · {job.company}
                </option>
              ))}
              <option value="custom">-- Custom Role --</option>
            </select>
          </div>

          {targetJobId === 'custom' && (
            <div className="space-y-1.5 border-l-2 border-indigo-500/20 pl-4 py-1">
              <label className="text-xs font-semibold text-slate-400">Target Role Title</label>
              <input
                type="text"
                placeholder="e.g. Backend Developer"
                value={customJobTitle}
                onChange={(e) => setCustomJobTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <button
            onClick={handleStartSession}
            disabled={loadingQuestions}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            {loadingQuestions ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Preparing question deck...
              </>
            ) : (
              <>
                <MessageSquareCode className="h-4 w-4" /> Start Mock Interview
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Arena panel (Span 3) */}
      <div className="lg:col-span-3 flex flex-col h-full overflow-y-auto pr-1">
        {questions.length > 0 && !sessionFinished ? (
          <div className="space-y-6">
            {/* Question Panel */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-3">
                <span>Question {currentIdx + 1} of {questions.length}</span>
                <span className="bg-indigo-500/5 px-2.5 py-1 rounded-md text-indigo-400 border border-indigo-500/10">
                  {questions[currentIdx].category}
                </span>
              </div>
              
              <div className="flex gap-3">
                <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-slate-250 leading-relaxed">
                  {questions[currentIdx].question}
                </p>
              </div>
            </div>

            {/* Answer Text Input */}
            <div className="glass-card p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Your Structured Answer</label>
                <textarea
                  rows={6}
                  placeholder="Type your response here. For behavioral questions, structure your answer using the STAR method (Situation, Task, Action, Result)..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={!!evaluation || submittingAnswer}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              {!evaluation && (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submittingAnswer || !userAnswer.trim()}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5"
                >
                  {submittingAnswer ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Evaluating answer...
                    </>
                  ) : (
                    <>
                      Submit Answer for Review
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Evaluation Results Card */}
            {evaluation && (
              <div className="glass-card p-5 space-y-4 animate-slide-in">
                <div className="flex gap-4 items-center">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-2xl font-black ${getGradeStyle(evaluation.grade)}`}>
                    {evaluation.grade}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coach Rating</h4>
                    <span className="text-sm font-bold text-slate-200 mt-0.5 block">{getGradeHeading(evaluation.grade)}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-900/10 text-xs text-slate-350 leading-relaxed flex gap-2">
                  <ThumbsUp className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p>{evaluation.feedback}</p>
                </div>

                {/* Collapsible model answer */}
                <div className="border border-slate-900 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                    className="w-full p-3.5 bg-slate-900/20 text-xs font-bold text-slate-400 hover:text-slate-200 transition flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> Study Model Answer Guideline</span>
                    <span>{showModelAnswer ? 'Hide' : 'Show'}</span>
                  </button>
                  
                  {showModelAnswer && (
                    <div className="p-4 border-t border-slate-900 bg-slate-950/20 text-xs text-slate-400 leading-relaxed leading-6 font-mono">
                      {evaluation.modelAnswer}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs transition flex items-center justify-center gap-1"
                >
                  {currentIdx + 1 < questions.length ? 'Next Question' : 'Finish Session'} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : sessionFinished ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/10 animate-scale-in">
            <CheckCircle className="h-16 w-16 text-emerald-500 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-full" />
            <h3 className="text-slate-100 font-extrabold text-lg">Interview Session Complete!</h3>
            <p className="text-slate-400 text-xs mt-2 max-w-sm leading-relaxed">
              Congratulations! You have completed your mock prep. Review your feedback grids and use model templates to prepare. Keep practicing to build high interview confidence.
            </p>
            <button
              onClick={handleStartSession}
              className="mt-6 py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
            >
              Start Another Practice Session
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
            <MessageSquareCode className="h-12 w-12 text-slate-700 mb-3" />
            <h3 className="text-slate-400 font-semibold text-sm">Coach inactive</h3>
            <p className="text-slate-500 text-xs mt-1.5 max-w-xs leading-relaxed">
              Select a target role in the coach inputs and click "Start Mock Interview" to load a dynamic practice deck.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
