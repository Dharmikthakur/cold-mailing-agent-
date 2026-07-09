import { NextResponse } from 'next/server';

const defaultQuestions = {
  frontend: [
    {
      id: "q-1",
      question: "How do you optimize performance in a React application? Mention techniques like code splitting, memoization, and rendering optimization.",
      category: "Technical"
    },
    {
      id: "q-2",
      question: "Explain the difference between client-side rendering (CSR), server-side rendering (SSR), and static site generation (SSG) in Next.js, and when you would use each.",
      category: "Technical"
    },
    {
      id: "q-3",
      question: "Describe a time when you had to debug a complex visual layout bug. What tools did you use and how did you resolve it?",
      category: "Behavioral"
    }
  ],
  backend: [
    {
      id: "q-1",
      question: "What is database indexing and how does it speed up queries? Are there any downsides to adding too many indexes?",
      category: "Technical"
    },
    {
      id: "q-2",
      question: "Explain the difference between SQL and NoSQL databases. When would you choose MongoDB over PostgreSQL?",
      category: "Technical"
    },
    {
      id: "q-3",
      question: "Describe a scenario where a backend service failed or became extremely slow. How would you diagnose the problem?",
      category: "Technical"
    }
  ],
  general: [
    {
      id: "q-1",
      question: "Tell me about a challenging technical project you worked on. What obstacles did you encounter, and how did you overcome them?",
      category: "Behavioral"
    },
    {
      id: "q-2",
      question: "What is your approach to learning a new codebase or framework quickly? Give an example of when you had to do this.",
      category: "Behavioral"
    },
    {
      id: "q-3",
      question: "Explain the concept of REST APIs and how they differ from GraphQL. What are the key HTTP methods and status codes?",
      category: "Technical"
    }
  ]
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode = 'generate', jobId, jobTitle, questionId, userAnswer, questionText } = body;

    if (mode === 'generate') {
      let role = 'general';
      const title = (jobTitle || '').toLowerCase();
      
      if (title.includes('front') || title.includes('react') || title.includes('design') || title.includes('ui')) {
        role = 'frontend';
      } else if (title.includes('back') || title.includes('data') || title.includes('server') || title.includes('node')) {
        role = 'backend';
      }

      const selectedQuestions = defaultQuestions[role as keyof typeof defaultQuestions] || defaultQuestions.general;
      
      return NextResponse.json({
        jobTitle: jobTitle || 'Software Engineer',
        questions: selectedQuestions
      });
    }

    if (mode === 'evaluate') {
      if (!userAnswer || userAnswer.trim().length < 5) {
        return NextResponse.json({
          grade: "D",
          feedback: "Your answer is too short. Please provide a more detailed explanation of your approach or definition to receive full feedback.",
          modelAnswer: "A comprehensive answer should define the core terminology, explain the underlying mechanism, and list practical examples of applying the concepts in a project environment."
        });
      }

      const answerLower = userAnswer.toLowerCase();
      let grade = "C";
      let feedback = "";
      let modelAnswer = "";

      // Simple keyword checks to simulate grading
      if (questionText && questionText.includes('React')) {
        const hasMemo = answerLower.includes('memo') || answerLower.includes('usememo') || answerLower.includes('usecallback');
        const hasSplitting = answerLower.includes('lazy') || answerLower.includes('split') || answerLower.includes('suspense');
        const hasState = answerLower.includes('state') || answerLower.includes('render');

        let hits = 0;
        if (hasMemo) hits++;
        if (hasSplitting) hits++;
        if (hasState) hits++;

        if (hits === 3) {
          grade = "A";
          feedback = "Excellent answer! You covered core memoization hooks (useMemo/useCallback), code-splitting using React.lazy/Suspense, and state optimization to minimize re-renders. This demonstrates robust React optimization concepts.";
        } else if (hits === 2) {
          grade = "B";
          feedback = "Strong response. You explained key optimizations well, but you could enhance your answer by mentioning code-splitting patterns (dynamic imports) or lazy loading resources to optimize Initial Page Load size.";
        } else {
          grade = "C";
          feedback = "Good start. However, a complete React performance optimization response should cover code splitting (lazy loading), virtual lists for long arrays, and memoization APIs to prevent redundant render cycles.";
        }
        
        modelAnswer = "React apps are optimized by: 1) Code splitting (React.lazy + Suspense, dynamic imports in Next.js) to reduce bundle size; 2) Memoization (useMemo to cache expensive lookups, useCallback to prevent reference changes for functions, and React.memo for components); 3) Virtualized lists (e.g., react-window) for handling long data lists; and 4) Efficient state structure to minimize unnecessary layout updates.";
      } else if (questionText && (questionText.includes('SQL') || questionText.includes('index'))) {
        const hasBtree = answerLower.includes('b-tree') || answerLower.includes('structure') || answerLower.includes('speed') || answerLower.includes('search');
        const hasWrite = answerLower.includes('write') || answerLower.includes('slow') || answerLower.includes('insert') || answerLower.includes('update');

        let hits = 0;
        if (hasBtree) hits++;
        if (hasWrite) hits++;

        if (hits === 2) {
          grade = "A";
          feedback = "Spot on. You correctly identified that indexes accelerate data lookup (often using B-Tree data structures) but slow down write operations (INSERT/UPDATE/DELETE) because the index trees must be rebuilt.";
        } else if (hits === 1) {
          grade = "B";
          feedback = "Nice explanation. You highlighted how query speeds improve. Be sure to note that excessive indexing incurs memory overhead and slows down write/update queries since the DB must sync index trees.";
        } else {
          grade = "C";
          feedback = "A standard indexing response should cover both the retrieval speed improvements (reduction in disk reads) and the write penalty (overhead on data modifications).";
        }

        modelAnswer = "Database indexing builds a structured search index (typically a B-Tree or Hash index) that allows the query engine to find rows in O(log N) complexity instead of scanning the full table (O(N)). The downside is write overhead: every INSERT, UPDATE, or DELETE query must modify the underlying index trees, which slows down write throughput.";
      } else {
        // General/Behavioral evaluation
        const hasStar = answerLower.includes('situation') || answerLower.includes('task') || answerLower.includes('action') || answerLower.includes('result');
        const hasDetail = userAnswer.split(' ').length > 25;

        if (hasStar && hasDetail) {
          grade = "A";
          feedback = "Fantastic response. You structured your behavioral example matching the STAR methodology. You clearly laid out the context, your specific responsibilities, the action you drove, and the final quantifiable outcome.";
        } else if (hasDetail) {
          grade = "B";
          feedback = "Good details. To make your behavioral answer stand out to interviewers, try to explicitly structure it using the STAR model: state the initial Situation/Task, focus heavily on the Action you took, and state the Result.";
        } else {
          grade = "C";
          feedback = "Try expanding on your answer. Provide a concrete example from your past projects, detailing the exact bottleneck, what technologies you chose to fix it, and what the final outcome was.";
        }

        modelAnswer = "A strong behavioral response utilizes the STAR method: 1) Situation: Describe the conflict or technical roadblock; 2) Task: Clarify your specific goal; 3) Action: Elaborate on your design choices, scripts written, or debugging sessions; 4) Result: Highlight the positive result, e.g. 'This improved load times by 40% and resolved active logs warnings'.";
      }

      return NextResponse.json({
        grade,
        feedback,
        modelAnswer
      });
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error) {
    console.error('Error in mock interview API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
