import { NextResponse } from 'next/server';
import jobs from '@/data/jobs.json';

export async function POST(request: Request) {
  try {
    const { resume, jobId, customJobTitle, customJobDescription } = await request.json();

    if (!resume) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    let targetTitle = customJobTitle || '';
    let targetDescription = customJobDescription || '';
    let requiredSkills: string[] = [];

    if (jobId) {
      const matchedJob = jobs.find(j => j.id === jobId);
      if (matchedJob) {
        targetTitle = matchedJob.title;
        targetDescription = matchedJob.description;
        requiredSkills = matchedJob.skills;
      }
    }

    if (requiredSkills.length === 0 && targetDescription) {
      // Fallback: extract common skills from description text
      const commonTechSkills = [
        'React.js', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 
        'Python', 'Java', 'C++', 'Go', 'Tailwind CSS', 'MongoDB', 
        'PostgreSQL', 'Figma', 'UI/UX Design', 'Express', 'REST APIs', 'Git'
      ];
      requiredSkills = commonTechSkills.filter(skill => 
        new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i').test(targetDescription)
      );
    }

    if (requiredSkills.length === 0) {
      // Default fallback
      requiredSkills = ['React.js', 'JavaScript', 'Node.js', 'Git'];
    }

    const resumeLower = resume.toLowerCase();
    
    // Analyze matching skills
    const matchingSkills = requiredSkills.filter(skill => 
      resumeLower.includes(skill.toLowerCase())
    );
    const missingSkills = requiredSkills.filter(skill => 
      !resumeLower.includes(skill.toLowerCase())
    );

    // Score calculation
    const baseScore = requiredSkills.length > 0 
      ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
      : 50;
      
    // Clamp score
    const currentScore = Math.max(15, Math.min(baseScore, 95));
    const potentialScore = Math.min(currentScore + 20, 98);

    // Generate Tailored Bullets based on missing skills or keywords
    const bulletSuggestions = [
      {
        original: "Developed web features for a blogging platform.",
        tailored: `Engineered responsive, dynamic client-side pages using React.js and integrated missing modules to enhance blogging UX, leveraging modern state management.`,
        reason: "Shows technical depth and directly mentions key skill alignment."
      }
    ];

    if (missingSkills.length > 0) {
      bulletSuggestions.push({
        original: "Worked on database design and backend routes.",
        tailored: `Designed optimized schema queries using ${missingSkills[0]} and configured RESTful endpoint handlers, improving backend lookup latency by 25%.`,
        reason: `Explicitly adds matching proficiency for ${missingSkills[0]} in a quantifiable achievement.`
      });
    }

    if (missingSkills.length > 1) {
      bulletSuggestions.push({
        original: "Designed design systems and assets.",
        tailored: `Created component libraries in ${missingSkills[1]} and implemented styling guidelines, bridging the design-to-development pipeline efficiently.`,
        reason: `Demonstrates capability in ${missingSkills[1]} framework and component collaboration.`
      });
    } else {
      bulletSuggestions.push({
        original: "Used Git version control to manage code.",
        tailored: "Implemented structured Git workflows (branching models, code reviews, clean merges) within a collaborative squad, lowering regression rates.",
        reason: "Highlights modern development workflow practices."
      });
    }

    return NextResponse.json({
      jobTitle: targetTitle,
      currentScore,
      potentialScore,
      matchingSkills,
      missingSkills,
      bulletSuggestions
    });
  } catch (error) {
    console.error('Error in resume tailor API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
