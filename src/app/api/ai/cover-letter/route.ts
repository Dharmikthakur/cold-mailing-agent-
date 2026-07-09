import { NextResponse } from 'next/server';
import jobs from '@/data/jobs.json';

export async function POST(request: Request) {
  try {
    const { jobId, customJobTitle, customJobDescription, userExperience, tone = 'professional' } = await request.json();

    let targetTitle = customJobTitle || '';
    let targetCompany = 'Your Company';
    let targetDescription = customJobDescription || '';
    
    if (jobId) {
      const matchedJob = jobs.find(j => j.id === jobId);
      if (matchedJob) {
        targetTitle = matchedJob.title;
        targetCompany = matchedJob.company;
        targetDescription = matchedJob.description;
      }
    }

    const experienceSnippet = userExperience || "a passionate developer skilled in building responsive user interfaces and backend integrations, with a focus on writing clean, scalable code.";

    let greeting = `Dear Hiring Team at ${targetCompany},`;
    let bodyIntro = "";
    let bodyValue = "";
    let bodyClosing = "";

    if (tone === 'enthusiastic') {
      bodyIntro = `I was absolutely thrilled to come across the opening for a ${targetTitle} at ${targetCompany}. Your company's mission to push engineering limits and craft state-of-the-art software resonates deeply with my personal values and aspirations. As someone who thrives in high-impact environments, I could not wait to submit my application.`;
      bodyValue = `In my previous work, I have consistently focused on engineering performant frontend modules and designing robust system flows. I bring hands-on experience as ${experienceSnippet} My approach is centered on writing clean, maintainable code, optimizing API lookups, and continuously learning new technologies to solve difficult problems.`;
      bodyClosing = `I would love the opportunity to bring my high energy and technical skills to the engineering squad at ${targetCompany}. Thank you so much for your time and consideration. I am looking forward to our discussion!`;
    } else if (tone === 'conversational') {
      bodyIntro = `I'm writing to express my interest in the ${targetTitle} role at ${targetCompany}. I've been following your progress in the industry for a while now, and I'm really impressed by the collaborative, forward-thinking developer culture you have built. I'd love to join the team and help build some awesome software together.`;
      bodyValue = `Over the past years, I have worked as ${experienceSnippet} Beyond the core technical skills, I pride myself on being an effective communicator who enjoys working closely with product owners, designers, and fellow engineers to turn complex requirements into smooth user experiences.`;
      bodyClosing = `I'd love to jump on a quick call to talk about how my background aligns with your engineering goals. Thank you for reading, and hope to speak soon!`;
    } else { // default: professional
      bodyIntro = `I am writing to formally apply for the ${targetTitle} position at ${targetCompany}, as advertised. With a strong foundation in computer science and full-stack software development principles, I am confident in my ability to make significant contributions to your engineering division.`;
      bodyValue = `My professional experience aligns well with the requirements of this role. I have worked as ${experienceSnippet} I possess practical expertise in implementing responsive interfaces, architecting relational/non-relational database models, and maintaining modular codebases. My focus remains on delivering high-fidelity user workflows.`;
      bodyClosing = `Thank you for reviewing my credentials. I welcome the opportunity to discuss how my technical skills and professional background can benefit the development team at ${targetCompany}.`;
    }

    const fullLetter = `${greeting}\n\n${bodyIntro}\n\n${bodyValue}\n\n${bodyClosing}\n\nSincerely,\n[Your Name]`;

    return NextResponse.json({
      jobTitle: targetTitle,
      company: targetCompany,
      tone,
      coverLetter: fullLetter
    });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
